import React, { ReactNode } from 'react';
import { useAuthStore } from '../app/store.ts';
import { LogOut, User, LayoutDashboard, MessageSquare, ShieldCheck, Mail } from 'lucide-react';
import { logout } from '../infra/firebase.ts';
import { motion } from 'motion/react';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'chat' | 'admin' | 'waitlist' | 'profile';
  onTabChange: (tab: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-bg-base text-text-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-border-subtle flex flex-col bg-bg-surface py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-[4px] flex items-center justify-center font-bold text-bg-base">
            V
          </div>
          <span className="font-serif italic text-xl tracking-wider leading-none">VentureMind</span>
        </div>

        <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-secondary px-6 mb-3 font-bold">
          Navigation
        </div>

        <nav className="flex-1 space-y-0 text-nav-list">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')}
          />
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="AI Consultants" 
            active={activeTab === 'chat'} 
            onClick={() => onTabChange('chat')}
          />
          {user?.role === 'admin' && (
            <>
              <div className="text-[0.65rem] uppercase tracking-[0.15em] text-text-secondary px-6 pt-6 pb-3 font-bold">Audit & Ops</div>
              <SidebarItem 
                icon={<ShieldCheck size={18} />} 
                label="Analytics" 
                active={activeTab === 'admin'} 
                onClick={() => onTabChange('admin')}
              />
              <SidebarItem 
                icon={<Mail size={18} />} 
                label="Waitlist" 
                active={activeTab === 'waitlist'} 
                onClick={() => onTabChange('waitlist')}
              />
            </>
          )}
        </nav>

        <div className="px-6 mt-auto pt-6">
          {user && (
            <div 
              onClick={() => onTabChange('profile')}
              className={`p-4 bg-bg-elevated border rounded-lg flex flex-col gap-2 cursor-pointer transition-all hover:bg-bg-elevated/80 ${
                activeTab === 'profile' ? 'border-accent shadow-[0_0_15px_rgba(201,160,99,0.1)]' : 'border-border-subtle'
              }`}
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-accent/20">
                    {user.photoURL ? <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" /> : <User size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-text-primary">{user.displayName || 'Alex'}</p>
                    <p className="text-[10px] text-accent uppercase tracking-wider font-bold">{user.role === 'admin' ? 'Admin Tier' : 'Platinum Member'}</p>
                  </div>
               </div>
            </div>
          )}
          {user && (
            <button 
              onClick={(e) => { e.stopPropagation(); logout(); }} 
              className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-[10px] font-sans uppercase tracking-widest text-text-secondary hover:text-red-400 transition-colors border border-transparent hover:border-red-400/20 rounded"
            >
              <LogOut size={12} /> Terminate Session
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <header className="h-[72px] border-b border-border-subtle flex items-center px-8 justify-between bg-bg-base/50 backdrop-blur-md">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.4)]"></div>
             <div>
               <h2 className="text-[1.1rem] font-serif font-bold italic text-text-primary leading-tight">VentureMind Operations</h2>
               <p className="text-[0.7rem] text-text-secondary">System active and authenticated</p>
             </div>
           </div>
           <div className="text-[0.8rem] opacity-60 font-mono">
             ID: {activeTab.toUpperCase()}-{Math.floor(Math.random() * 10000)}
           </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-base">
          {children}
        </div>
      </main>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-[10px] text-[0.9rem] transition-all duration-200 border-r-2 ${
      active 
        ? 'bg-accent/8 text-accent border-accent' 
        : 'text-text-secondary hover:text-text-primary border-transparent'
    }`}
  >
    <span className="opacity-70">{active ? '◈' : icon}</span>
    <span className="flex-1 text-left">{label}</span>
  </button>
);
