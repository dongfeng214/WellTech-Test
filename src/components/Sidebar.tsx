import React from 'react';
import { Users, LayoutDashboard, BarChart3, Settings, Database, Plus } from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
    { id: 'customers', label: '客户管理', icon: Users },
    { id: 'kpi', label: '销售业绩', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col h-screen z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/20">
          <Database className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">TechCRM</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (currentView === 'customer-detail' && item.id === 'customers');
          
          if (item.id === 'settings') {
             return (
               <React.Fragment key={item.id}>
                 <div className="pt-8 pb-4">
                   <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">系统设置</p>
                 </div>
                 <button
                    onClick={() => setCurrentView(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group cursor-pointer",
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-slate-600 hover:bg-slate-100 font-medium"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-500")} />
                    <span>{item.label}</span>
                  </button>
               </React.Fragment>
             )
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group cursor-pointer",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-500")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>
    </aside>
  );
}
