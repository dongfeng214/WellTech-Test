import React, { useState } from 'react';
import { FollowUpEvent, User, Customer, FollowUpType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, PhoneCall, CalendarCheck, Calendar, Download, Target, Activity, FileText, ChevronDown, ChevronUp, CheckCircle2, DollarSign, TrendingDown, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils';

interface KPIDashboardProps {
  events: FollowUpEvent[];
  users: User[];
  customers: Customer[];
  currentUser: User;
  onSelectCustomer?: (id: string) => void;
}

const COLORS = ['#0d59f2', '#8b5cf6', '#10b981', '#f59e0b', '#64748b'];

const typeColors: Record<FollowUpType, string> = {
  '电话沟通': 'bg-blue-100 text-blue-700',
  '线上会议': 'bg-purple-100 text-purple-700',
  '上门拜访': 'bg-emerald-100 text-emerald-700',
  '邮件沟通': 'bg-orange-100 text-orange-700',
  '其他': 'bg-slate-100 text-slate-700',
};

export function KPIDashboard({ events, users, customers, currentUser, onSelectCustomer }: KPIDashboardProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'month' | '30days' | 'all'>('month');

  // Determine visible users based on role
  const visibleUsers = React.useMemo(() => {
    if (currentUser.role === '销售主管') {
      return users; // Sees everyone
    } else if (currentUser.role === '销售经理') {
      return users.filter(u => u.team === currentUser.team); // Sees their team
    } else {
      return users.filter(u => u.id === currentUser.id); // Sees only themselves
    }
  }, [users, currentUser]);

  const visibleUserIds = new Set(visibleUsers.map(u => u.id));

  // Filter events based on dateFilter AND visible users
  const filteredEvents = events.filter(e => {
    if (!visibleUserIds.has(e.salespersonId)) return false;
    
    const eventDate = new Date(e.date);
    const now = new Date();
    if (dateFilter === 'month') {
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return eventDate >= thirtyDaysAgo;
    }
    return true;
  });

  // Calculate KPI metrics
  const totalFollowUps = filteredEvents.length;
  const uniqueCustomersContacted = new Set(filteredEvents.map(e => e.customerId)).size;
  
  // Calculate Revenue Metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentMonthRevenue = 0;
  let lastMonthRevenue = 0;
  let pipelineValue = 0;
  let wonDeals = 0;

  const visibleCustomers = customers.filter(c => visibleUserIds.has(c.assignedTo));

  visibleCustomers.forEach(c => {
    if (c.status === '已成交' && c.dealValue && c.dealDate) {
      wonDeals++;
      const dealDate = new Date(c.dealDate);
      if (dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear) {
        currentMonthRevenue += c.dealValue;
      } else if (dealDate.getMonth() === lastMonth && dealDate.getFullYear() === lastMonthYear) {
        lastMonthRevenue += c.dealValue;
      }
    } else if ((c.status === '谈判中' || c.status === '意向客户') && c.dealValue) {
      pipelineValue += c.dealValue;
    }
  });

  const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  const winRate = visibleCustomers.length > 0 ? (wonDeals / visibleCustomers.length) * 100 : 0;

  // Monthly Target per person
  const MONTHLY_REVENUE_TARGET = 500000;
  const teamRevenueTarget = visibleUsers.length * MONTHLY_REVENUE_TARGET;
  const revenueTargetProgress = Math.min(100, Math.round((currentMonthRevenue / teamRevenueTarget) * 100));

  // Follow-ups by salesperson
  const salespersonStats = visibleUsers.map(user => {
    const userEvents = filteredEvents.filter(e => e.salespersonId === user.id);
    const userCustomers = visibleCustomers.filter(c => c.assignedTo === user.id);
    const userRevenue = userCustomers
      .filter(c => c.status === '已成交' && c.dealValue && new Date(c.dealDate!).getMonth() === currentMonth)
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);
    const userPipeline = userCustomers
      .filter(c => (c.status === '谈判中' || c.status === '意向客户') && c.dealValue)
      .reduce((sum, c) => sum + (c.dealValue || 0), 0);

    return {
      name: user.name,
      '跟进次数': userEvents.length,
      '电话沟通': userEvents.filter(e => e.type === '电话沟通').length,
      '线上会议': userEvents.filter(e => e.type === '线上会议').length,
      '上门拜访': userEvents.filter(e => e.type === '上门拜访').length,
      '已成交金额': userRevenue,
      '预计成交金额': userPipeline,
    };
  }).sort((a, b) => b['已成交金额'] - a['已成交金额']);

  // Customer stage distribution (for pie chart)
  const stageStats = visibleCustomers.reduce((acc, customer) => {
    acc[customer.status] = (acc[customer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(stageStats).map(([name, value]) => ({ name, value }));

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || '未知客户';

  const handleExport = () => {
    const headers = ['销售人员', '总跟进次数', '已成交金额', '预计成交金额', '目标达成率'];
    const rows = salespersonStats.map(s => [
      s.name, 
      s['跟进次数'], 
      s['已成交金额'], 
      s['预计成交金额'], 
      `${Math.min(100, Math.round((s['已成交金额'] / MONTHLY_REVENUE_TARGET) * 100))}%`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_performance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let dashboardTitle = '销售业绩仪表盘';
  if (currentUser.role === '销售主管') dashboardTitle = '公司整体业绩仪表盘';
  else if (currentUser.role === '销售经理') dashboardTitle = `${currentUser.team} - 团队业绩仪表盘`;
  else dashboardTitle = '个人业绩仪表盘';

  return (
    <div className="max-w-[1280px] mx-auto w-full p-4 md:p-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">{dashboardTitle}</h2>
          <p className="text-slate-500 mt-1 text-lg">基于跟进记录的销售绩效与目标核查</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="month">本月数据</option>
              <option value="30days">过去30天</option>
              <option value="all">全部数据</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={handleExport} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-primary flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1", revenueGrowth >= 0 ? "text-emerald-600 bg-emerald-100" : "text-rose-600 bg-rose-100")}>
              {revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </span>
          </div>
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-500">本月已成交金额</p>
            <h3 className="text-4xl font-black mt-1 text-slate-900">
              ¥{(currentMonthRevenue / 10000).toFixed(1)}<span className="text-lg text-slate-500 font-bold ml-1">万</span>
            </h3>
          </div>
        </div>

        {/* Pipeline */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-500">预计成交金额 (Pipeline)</p>
            <h3 className="text-4xl font-black mt-1 text-slate-900">
              ¥{(pipelineValue / 10000).toFixed(1)}<span className="text-lg text-slate-500 font-bold ml-1">万</span>
            </h3>
          </div>
        </div>

        {/* Win Rate */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-500">整体客户转化率</p>
            <h3 className="text-4xl font-black mt-1 text-slate-900">
              {winRate.toFixed(1)}%
            </h3>
          </div>
        </div>

        {/* Target Completion */}
        <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            {revenueTargetProgress >= 100 ? (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">达标</span>
            ) : (
              <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg">跟进中</span>
            )}
          </div>
          <div className="mt-5">
            <p className="text-sm font-bold text-slate-500">
              {currentUser.role === '普通销售' ? '个人营收目标达成率' : '团队营收目标达成率'}
            </p>
            <h3 className="text-4xl font-black mt-1 text-slate-900">
              {revenueTargetProgress}%
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Salesperson Revenue Performance */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6">销售人员业绩排行 (元)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salespersonStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 600}} tickFormatter={(value) => `¥${value/10000}万`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontWeight: 500}} />
                <Bar dataKey="已成交金额" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="预计成交金额" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Customer Stages */}
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 mb-6">客户所处阶段分布</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} wrapperStyle={{paddingTop: '20px', fontWeight: 500}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Salesperson Activities */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900">
            {currentUser.role === '普通销售' ? '个人业务明细与目标核查' : '团队业务明细与目标核查'}
          </h3>
          <p className="text-sm font-medium text-slate-500">本月营收目标：每人 ¥{(MONTHLY_REVENUE_TARGET / 10000).toFixed(0)}万</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {visibleUsers.map(user => {
            const userEvents = filteredEvents.filter(e => e.salespersonId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const userStat = salespersonStats.find(s => s.name === user.name);
            const userRevenue = userStat ? userStat['已成交金额'] : 0;
            const progress = Math.min(100, Math.round((userRevenue / MONTHLY_REVENUE_TARGET) * 100));
            const isTargetMet = userRevenue >= MONTHLY_REVENUE_TARGET;
            const isExpanded = expandedUserId === user.id;

            return (
              <div key={user.id} className="glass-card rounded-3xl p-6 shadow-xl border border-slate-200/60 overflow-hidden transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-xl font-black text-primary shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{user.name}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">{user.role}</p>
                    </div>
                  </div>

                  {/* Target Progress */}
                  <div className="flex-1 max-w-md w-full">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        本月营收进度 (¥{(userRevenue / 10000).toFixed(1)}万 / ¥{(MONTHLY_REVENUE_TARGET / 10000).toFixed(0)}万)
                      </span>
                      <span className={cn("text-lg font-black", isTargetMet ? "text-emerald-600" : "text-primary")}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", isTargetMet ? "bg-emerald-500" : "bg-primary")}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {isTargetMet && (
                      <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 已达成目标
                      </p>
                    )}
                  </div>

                  {/* Toggle Button */}
                  <button 
                    onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors shrink-0"
                  >
                    {isExpanded ? (
                      <>收起工单记录 <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>查看工单记录 <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {/* Expanded Activities List */}
                {isExpanded && (
                  <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h5 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      近期业务动态 (最近 {Math.min(5, userEvents.length)} 条)
                    </h5>
                    
                    {userEvents.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">暂无跟进记录</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userEvents.slice(0, 5).map(event => (
                          <div 
                            key={event.id} 
                            onClick={() => onSelectCustomer?.(event.customerId)}
                            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3">
                                <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", typeColors[event.type])}>
                                  {event.type}
                                </span>
                                <span className="font-bold text-slate-900 hover:text-primary transition-colors">
                                  客户：{getCustomerName(event.customerId)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {format(new Date(event.date), 'yyyy-MM-dd HH:mm')}
                              </span>
                            </div>
                            
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                              <p className="text-slate-700 text-sm leading-relaxed">
                                <span className="font-bold text-slate-500 mr-2">沟通详情:</span>
                                {event.description}
                              </p>
                            </div>

                            {(event.nextStep || (event.attachments && event.attachments.length > 0)) && (
                              <div className="mt-4 flex flex-wrap gap-4">
                                {event.nextStep && (
                                  <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                                    下一步: {event.nextStep}
                                  </div>
                                )}
                                {event.attachments && event.attachments.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    {event.attachments.length} 个附件
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
