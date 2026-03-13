import React, { useState } from 'react';
import { Customer, FollowUpEvent, User, FollowUpType, Attachment } from '../types';
import { ArrowLeft, Building2, Phone, Mail, Calendar, Clock, User as UserIcon, Plus, MessageSquare, Video, MapPin, MoreHorizontal, CheckCircle2, Paperclip, FileText, Image as ImageIcon, Mic, X, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils';
import { AIChatbot } from './AIChatbot';

interface CustomerDetailProps {
  customer: Customer;
  events: FollowUpEvent[];
  users: User[];
  onBack: () => void;
  onAddEvent: (event: Omit<FollowUpEvent, 'id'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  currentUser: User;
}

const typeIcons: Record<FollowUpType, React.ElementType> = {
  '电话沟通': Phone,
  '线上会议': Video,
  '上门拜访': MapPin,
  '邮件沟通': Mail,
  '其他': MessageSquare,
};

const typeColors: Record<FollowUpType, string> = {
  '电话沟通': 'bg-blue-100 text-blue-600 ring-blue-600/20',
  '线上会议': 'bg-purple-100 text-purple-600 ring-purple-600/20',
  '上门拜访': 'bg-emerald-100 text-emerald-600 ring-emerald-600/20',
  '邮件沟通': 'bg-orange-100 text-orange-600 ring-orange-600/20',
  '其他': 'bg-slate-100 text-slate-600 ring-slate-600/20',
};

const statusColors = {
  '潜在客户': 'bg-slate-100 text-slate-700 ring-slate-600/20',
  '意向客户': 'bg-blue-100 text-blue-700 ring-blue-600/20',
  '谈判中': 'bg-orange-100 text-orange-700 ring-orange-600/20',
  '已成交': 'bg-green-100 text-green-700 ring-green-600/20',
  '已流失': 'bg-red-100 text-red-700 ring-red-600/20',
};

export function CustomerDetail({ customer, events, users, onBack, onAddEvent, onUpdateCustomer, currentUser }: CustomerDetailProps) {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(customer);
  const [newEvent, setNewEvent] = useState({
    type: '电话沟通' as FollowUpType,
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: '',
    nextStep: '',
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCustomer(editCustomer);
    setIsEditModalOpen(false);
  };

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || '未知';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newAttachments = await Promise.all(newFiles.map(async (file) => {
        return new Promise<Attachment>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              type: file.type,
              url: URL.createObjectURL(file),
              data: reader.result as string,
              mimeType: file.type
            });
          };
          reader.readAsDataURL(file);
        });
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Mic className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.description.trim()) return;

    onAddEvent({
      customerId: customer.id,
      salespersonId: currentUser.id,
      type: newEvent.type,
      date: new Date(newEvent.date).toISOString(),
      description: newEvent.description,
      nextStep: newEvent.nextStep,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    
    setIsAddingEvent(false);
    setNewEvent({
      type: '电话沟通',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: '',
      nextStep: '',
    });
    setAttachments([]);
  };

  return (
    <div className="max-w-[1280px] mx-auto w-full p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 mt-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{customer.name}</h1>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset", statusColors[customer.status])}>
                {customer.status}
              </span>
            </div>
            <p className="text-lg text-slate-500 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {customer.company} <span className="text-slate-300">|</span> {customer.title}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditCustomer(customer); setIsEditModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold shadow-sm hover:shadow-md transition-all">
            <Edit3 className="w-4 h-4" />
            编辑资料
          </button>
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            写跟进
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              联系方式
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{customer.phone}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">手机号码</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{customer.email}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">工作邮箱</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              业务信息
            </h3>
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">负责顾问</p>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {getUserName(customer.assignedTo).charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{getUserName(customer.assignedTo)}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">建档时间</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {format(new Date(customer.createdAt), 'yyyy-MM-dd')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Follow-up Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          <AIChatbot customer={customer} events={events} />

          {/* Add Event Form */}
          {isAddingEvent && (
            <div className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden ring-2 ring-primary/20">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">新增跟进记录</h3>
                <button onClick={() => setIsAddingEvent(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">跟进方式</label>
                    <select 
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value as FollowUpType})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                    >
                      {Object.keys(typeIcons).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">跟进时间</label>
                    <input 
                      type="datetime-local" 
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-medium transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">沟通详情</label>
                  <textarea 
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none transition-all"
                    placeholder="详细记录沟通内容、客户反馈及核心诉求..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">下一步计划 <span className="text-slate-400 font-normal">(选填)</span></label>
                  <input 
                    type="text" 
                    value={newEvent.nextStep}
                    onChange={(e) => setNewEvent({...newEvent, nextStep: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                    placeholder="例如：下周二发送产品报价单并安排演示"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">工作留痕 <span className="text-slate-400 font-normal">(上传会议纪要、录音、照片等)</span></label>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      添加附件
                    </button>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {attachments.map(att => (
                        <div key={att.id} className="flex items-center gap-2 bg-white text-slate-700 px-3 py-2 rounded-lg text-sm border border-slate-200 shadow-sm">
                          <span className="text-primary">{getFileIcon(att.type)}</span>
                          <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeAttachment(att.id)}
                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20"
                  >
                    保存记录
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timeline */}
          <div className="glass-card rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Clock className="w-5 h-5" />
              </div>
              跟进历史
            </h3>
            
            {sortedEvents.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-lg text-slate-600 font-bold">暂无跟进记录</p>
                <p className="text-slate-400 mt-2">点击上方"写跟进"开始记录您的第一次客户接触</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-6 space-y-10 pb-4">
                {sortedEvents.map((event, index) => {
                  const Icon = typeIcons[event.type];
                  const colorClass = typeColors[event.type];
                  
                  return (
                    <div key={event.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={cn("absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-inset", colorClass)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-lg">{event.type}</span>
                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-1.5">
                              <UserIcon className="w-3.5 h-3.5" />
                              {getUserName(event.salespersonId)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {format(new Date(event.date), 'yyyy-MM-dd HH:mm')}
                          </span>
                        </div>
                        
                        <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          {event.description}
                        </p>
                        
                        {event.attachments && event.attachments.length > 0 && (
                          <div className="mt-5 pt-5 border-t border-slate-100">
                            <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-slate-400" />
                              工作留痕 / 附件
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                              {event.attachments.map(att => (
                                <a 
                                  key={att.id} 
                                  href={att.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
                                >
                                  <span className="text-slate-400 group-hover:text-primary transition-colors">{getFileIcon(att.type)}</span>
                                  <span className="truncate max-w-[180px]">{att.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.nextStep && (
                          <div className="mt-5 pt-5 border-t border-slate-100">
                            <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                              <div className="p-1 bg-indigo-100 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-indigo-900/60 mb-1 uppercase tracking-wider">下一步计划</p>
                                <p className="text-sm font-medium text-indigo-900">{event.nextStep}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">编辑客户资料</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">客户姓名</label>
                  <input required type="text" value={editCustomer.name} onChange={e => setEditCustomer({...editCustomer, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">联系电话</label>
                  <input required type="tel" value={editCustomer.phone} onChange={e => setEditCustomer({...editCustomer, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">企业名称</label>
                <input required type="text" value={editCustomer.company} onChange={e => setEditCustomer({...editCustomer, company: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">职位</label>
                  <input type="text" value={editCustomer.title} onChange={e => setEditCustomer({...editCustomer, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">邮箱</label>
                  <input type="email" value={editCustomer.email} onChange={e => setEditCustomer({...editCustomer, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">状态</label>
                  <select value={editCustomer.status} onChange={e => setEditCustomer({...editCustomer, status: e.target.value as Customer['status']})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                    <option value="潜在客户">潜在客户</option>
                    <option value="意向客户">意向客户</option>
                    <option value="谈判中">谈判中</option>
                    <option value="已成交">已成交</option>
                    <option value="已流失">已流失</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">负责人</label>
                  <select value={editCustomer.assignedTo} onChange={e => setEditCustomer({...editCustomer, assignedTo: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">取消</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">保存修改</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
