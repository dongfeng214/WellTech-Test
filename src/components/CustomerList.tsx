import React, { useState } from 'react';
import { Customer, User } from '../types';
import { Search, Plus, Building2, Phone, Mail, ChevronRight, Download, UserPlus, Filter, MoreVertical, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils';

interface CustomerListProps {
  customers: Customer[];
  users: User[];
  onSelectCustomer: (id: string) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
}

const statusColors = {
  '潜在客户': 'bg-slate-100 text-slate-700 ring-slate-600/20',
  '意向客户': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  '谈判中': 'bg-orange-100 text-orange-700 ring-orange-600/20',
  '已成交': 'bg-green-100 text-green-700 ring-green-600/20',
  '已流失': 'bg-red-100 text-red-700 ring-red-600/20',
};

const avatarColors = ['bg-blue-100 text-primary', 'bg-orange-100 text-orange-600', 'bg-purple-100 text-purple-600', 'bg-emerald-100 text-emerald-600'];

export function CustomerList({ customers, users, onSelectCustomer, onAddCustomer }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部客户');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '', company: '', title: '', phone: '', email: '', status: '潜在客户', assignedTo: users[0]?.id || ''
  });

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || '未知';

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.includes(searchQuery) || c.company.includes(searchQuery) || c.phone.includes(searchQuery);
    let matchesStatus = true;
    if (statusFilter === '活跃中') matchesStatus = ['意向客户', '谈判中'].includes(c.status);
    else if (statusFilter === '待跟进') matchesStatus = ['潜在客户'].includes(c.status);
    else if (statusFilter === '已成交') matchesStatus = ['已成交'].includes(c.status);
    
    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    const headers = ['客户姓名', '公司名称', '职位', '联系电话', '邮箱', '状态', '负责人', '最后联系时间'];
    const rows = filteredCustomers.map(c => [
      c.name, c.company, c.title, c.phone, c.email, c.status, getUserName(c.assignedTo), c.lastContactDate ? format(new Date(c.lastContactDate), 'yyyy-MM-dd') : '无'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer(newCustomer);
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', company: '', title: '', phone: '', email: '', status: '潜在客户', assignedTo: users[0]?.id || '' });
  };

  return (
    <div className="max-w-[1280px] mx-auto w-full p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-slate-900 text-4xl font-extrabold tracking-tight">客户列表</h1>
          <p className="text-slate-500 text-lg">高效管理您的客户关系与转化漏斗</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold shadow-sm hover:shadow-md transition-all">
            <Download className="w-4 h-4" />
            导出数据
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <UserPlus className="w-4 h-4" />
            新增客户
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 shadow-xl shadow-slate-200/50 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索客户姓名、手机号、企业名称..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setStatusFilter('全部客户')} className={cn("px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors", statusFilter === '全部客户' ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>全部客户</button>
            <button onClick={() => setStatusFilter('活跃中')} className={cn("px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors", statusFilter === '活跃中' ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>活跃中</button>
            <button onClick={() => setStatusFilter('待跟进')} className={cn("px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors", statusFilter === '待跟进' ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>待跟进</button>
            <button onClick={() => setStatusFilter('已成交')} className={cn("px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors", statusFilter === '已成交' ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>已成交</button>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
              <Filter className="w-4 h-4" />
              更多筛选
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-white/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">客户信息</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">联系方式</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">客户顾问</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">当前状态</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">最后联系时间</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCustomers.map((customer, idx) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectCustomer(customer.id)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-lg", avatarColors[idx % avatarColors.length])}>
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{customer.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-0.5">
                      <p className="text-sm text-slate-700">{customer.phone}</p>
                      <p className="text-xs text-slate-400">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {getUserName(customer.assignedTo).charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700">{getUserName(customer.assignedTo)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${statusColors[customer.status]}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {customer.lastContactDate ? format(new Date(customer.lastContactDate), 'yyyy-MM-dd') : '无'}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              没有找到匹配的客户
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500 font-medium">
              显示第 {(currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} 条，共 {filteredCustomers.length} 条
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
              >
                上一页
              </button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-bold text-slate-700">
                  {currentPage} <span className="text-slate-400 font-medium">/ {totalPages || 1}</span>
                </span>
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">新增客户</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">客户姓名</label>
                  <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">联系电话</label>
                  <input required type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">企业名称</label>
                <input required type="text" value={newCustomer.company} onChange={e => setNewCustomer({...newCustomer, company: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">职位</label>
                  <input type="text" value={newCustomer.title} onChange={e => setNewCustomer({...newCustomer, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">邮箱</label>
                  <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">状态</label>
                  <select value={newCustomer.status} onChange={e => setNewCustomer({...newCustomer, status: e.target.value as Customer['status']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                    <option value="潜在客户">潜在客户</option>
                    <option value="意向客户">意向客户</option>
                    <option value="谈判中">谈判中</option>
                    <option value="已成交">已成交</option>
                    <option value="已流失">已流失</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">负责人</label>
                  <select value={newCustomer.assignedTo} onChange={e => setNewCustomer({...newCustomer, assignedTo: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">取消</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">保存客户</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
