import React, { useState, useEffect } from 'react';
import { useAuthStore } from './app/store.ts';
import { signInWithGoogle } from './infra/firebase.ts';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { ChatPage } from './pages/Chat.tsx';
import { AdminDashboard } from './pages/Admin.tsx';
import { WaitlistPage } from './pages/Waitlist.tsx';
import { ProfilePage } from './pages/Profile.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { AgentId } from './domain/types.ts';
import * as Icons from 'lucide-react';

export default function App() {
  const { user, loading, initialized, init } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'admin' | 'waitlist' | 'profile'>('dashboard');
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  useEffect(() => {
    init();
  }, []);

  if (!initialized || (loading && !user)) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-white text-black flex items-center justify-center text-4xl font-black animate-pulse">V</div>
           <div className="flex flex-col items-center">
             <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute inset-0 bg-white" 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
             </div>
             <p className="mt-4 text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">Initializing VentureMind v4</p>
           </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onSelectAgent={(id) => { setSelectedAgentId(id); setActiveTab('chat'); }} />;
      case 'chat':
        return <ChatPage initialAgentId={selectedAgentId} />;
      case 'admin':
        return user.role === 'admin' ? <AdminDashboard /> : <Dashboard onSelectAgent={(id) => { setSelectedAgentId(id); setActiveTab('chat'); }} />;
      case 'waitlist':
        return user.role === 'admin' ? <WaitlistPage /> : <Dashboard onSelectAgent={(id) => { setSelectedAgentId(id); setActiveTab('chat'); }} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard onSelectAgent={(id) => { setSelectedAgentId(id); setActiveTab('chat'); }} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedAgentId(null); }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

const LoginPage = () => {
  return (
    <div className="h-screen w-screen bg-bg-base text-text-primary flex overflow-hidden font-sans">
      {/* Left side: branding */}
      <div className="hidden lg:flex flex-1 flex-col p-12 justify-between border-r border-border-subtle relative bg-[radial-gradient(circle_at_0%_0%,rgba(201,160,99,0.05)_0%,transparent_50%)]">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-accent text-bg-base flex items-center justify-center font-bold">V</div>
            <span className="text-xl font-serif italic tracking-tight">VentureMind</span>
         </div>

         <div className="max-w-xl">
            <h1 className="text-7xl font-serif italic leading-[0.9] tracking-tighter mb-8 text-text-primary">Access the<br/>Billion-Dollar<br/>Brain Trust.</h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-12 max-w-md font-serif italic">
              The AI Chief of Staff for the global elite. Specialized consulting for founders, digital nomads, and high-net-worth individuals.
            </p>
            <div className="flex gap-12 border-t border-border-subtle pt-12">
               <LoginStat label="Active Agents" value="10" />
               <LoginStat label="Data Regions" value="12" />
               <LoginStat label="Response" value="< 1s" />
            </div>
         </div>

         <div className="text-[10px] font-mono text-text-secondary opacity-30 uppercase tracking-[0.5em]">System Version 4.0.01_PROD</div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-[500px] flex flex-col items-center justify-center p-8 bg-bg-surface">
         <div className="w-full max-w-sm">
            <header className="mb-12">
               <h2 className="text-3xl font-serif italic mb-3">Welcome Back</h2>
               <p className="text-text-secondary text-sm">Secure access to your personal audit trail and AI consulting history.</p>
            </header>

            <button 
              onClick={() => signInWithGoogle()}
              className="w-full h-14 bg-accent text-bg-base rounded-lg flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm shadow-[0_0_40px_rgba(201,160,99,0.1)] mb-8"
            >
              <Icons.Chrome size={20} />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 text-border-subtle mb-8">
               <div className="h-[1px] flex-1 bg-current"></div>
               <span className="text-[10px] font-mono uppercase tracking-widest text-text-secondary">Internal Access Only</span>
               <div className="h-[1px] flex-1 bg-current"></div>
            </div>

            <div className="space-y-4">
               <LoginInput label="Foundation Access Code" placeholder="••••••••" type="password" />
               <button className="w-full py-3 text-[10px] font-sans uppercase tracking-[0.2em] text-accent hover:text-white transition-colors font-bold">Apply for membership</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const LoginStat = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-1">
     <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">{label}</span>
     <span className="text-2xl font-bold">{value}</span>
  </div>
);

const LoginInput = ({ label, placeholder, type }: { label: string, placeholder: string, type: string }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 block px-1">{label}</label>
     <input 
       type={type} 
       placeholder={placeholder}
       className="w-full bg-white/5 border border-white/5 rounded-xl h-12 px-4 text-sm focus:bg-white/10 focus:border-white/20 outline-none transition-all"
     />
  </div>
);
