import React from 'react';
import { AGENT_LIST } from '../domain/agents.ts';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { AgentId } from '../domain/types.ts';

interface DashboardProps {
  onSelectAgent: (agentId: AgentId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectAgent }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <header className="mb-12">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[0.65rem] font-sans uppercase tracking-[0.2em] text-accent mb-2 font-bold"
        >
          Specialized Intelligence Layer
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-serif italic text-text-primary mb-4"
        >
          Welcome, Founder.
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-text-secondary max-w-2xl leading-relaxed"
        >
          Access 10 distinct AI agents tuned for global founders, digital nomads, and elite consultants.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {AGENT_LIST.map((agent, index) => {
          const Icon = (Icons as any)[agent.icon];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              onClick={() => onSelectAgent(agent.id)}
              className="group cursor-pointer p-6 rounded-lg bg-bg-surface border border-border-subtle hover:border-accent/30 hover:bg-bg-elevated transition-all relative overflow-hidden"
            >
              <div className="mb-8 w-10 h-10 rounded-[4px] bg-accent text-bg-base flex items-center justify-center group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(201,160,99,0.2)]">
                {Icon && <Icon size={20} />}
              </div>
              <h3 className="font-serif italic text-lg mb-1">{agent.name}</h3>
              <p className="text-[0.6rem] text-text-secondary font-sans mb-4 uppercase tracking-[0.1em] font-bold">{agent.tagline}</p>
              <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed h-10">{agent.description}</p>
              
              <div className="mt-8 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                  Connect <Icons.ArrowRight size={10} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <footer className="mt-20 pt-12 border-t border-border-subtle flex flex-col items-center">
         <div className="text-[10px] font-mono opacity-20 uppercase tracking-[0.5em] mb-4 text-text-secondary">VentureMind Proprietary Model v4.0.1</div>
         <div className="flex gap-12">
            <Stats icon={<Icons.Zap size={14} />} label="Response Time" value="< 1.2s" />
            <Stats icon={<Icons.Shield size={14} />} label="Encryption" value="AES-256" />
            <Stats icon={<Icons.Server size={14} />} label="Global Nodes" value="12 Regions" />
         </div>
      </footer>
    </div>
  );
};

const Stats = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-3 opacity-60">
    <div className="p-1.5 text-accent">{icon}</div>
    <div className="flex flex-col">
       <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">{label}</span>
       <span className="text-xs font-mono text-text-primary">{value}</span>
    </div>
  </div>
);
