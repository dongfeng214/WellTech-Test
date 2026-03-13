import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { CustomerList } from './components/CustomerList';
import { CustomerDetail } from './components/CustomerDetail';
import { KPIDashboard } from './components/KPIDashboard';
import { mockCustomers, mockEvents, mockUsers } from './data/mockData';
import { FollowUpEvent } from './types';
import { Search, Bell } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('customers');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('u1');
  
  // State for data
  const [customers] = useState(mockCustomers);
  const [events, setEvents] = useState<FollowUpEvent[]>(mockEvents);
  const [users] = useState(mockUsers);

  // Current logged in user (mock)
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentView('customer-detail');
  };

  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setCurrentView('customers');
  };

  const handleAddEvent = (newEventData: Omit<FollowUpEvent, 'id'>) => {
    const newEvent: FollowUpEvent = {
      ...newEventData,
      id: `e${Date.now()}`,
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div className="flex h-screen w-full bg-background-light font-sans text-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light">
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md border-b border-slate-200 z-10 shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="搜索订单、客户或报表..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer relative group">
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
                title="切换用户测试权限"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <div className="size-9 rounded-full bg-primary/20 border-2 border-primary/10 flex items-center justify-center text-primary font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">
                  {currentUser.name} <span className="text-xs font-normal text-slate-400 ml-1">▼ 切换</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">{currentUser.role} {currentUser.team ? `· ${currentUser.team}` : ''}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          {currentView === 'dashboard' && (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 text-slate-700">工作台概览</h2>
                <p>请点击左侧菜单查看具体功能模块</p>
              </div>
            </div>
          )}
          
          {currentView === 'customers' && (
            <CustomerList 
              customers={customers} 
              users={users} 
              onSelectCustomer={handleSelectCustomer} 
            />
          )}
          
          {currentView === 'customer-detail' && selectedCustomerId && (
            <CustomerDetail 
              customer={customers.find(c => c.id === selectedCustomerId)!}
              events={events.filter(e => e.customerId === selectedCustomerId)}
              users={users}
              onBack={handleBackToList}
              onAddEvent={handleAddEvent}
              currentUser={currentUser}
            />
          )}

          {currentView === 'kpi' && (
            <KPIDashboard 
              events={events} 
              users={users} 
              customers={customers} 
              currentUser={currentUser}
              onSelectCustomer={handleSelectCustomer} 
            />
          )}

          {currentView === 'settings' && (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2 text-slate-700">系统设置</h2>
                <p>设置模块开发中...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
