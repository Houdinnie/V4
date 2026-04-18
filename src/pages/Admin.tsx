import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../infra/firebase.ts';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalLogs: 0,
    totalConversations: 0,
    totalWaitlist: 0,
    totalCacheRows: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const logsSnap = await getDocs(query(collection(db, 'event_logs'), orderBy('timestamp', 'desc'), limit(10)));
        const waitlistSnap = await getDocs(collection(db, 'waitlist'));
        const cacheSnap = await getDocs(collection(db, 'response_cache'));
        
        setMetrics({
          totalUsers: usersSnap.size,
          totalLogs: 0,
          totalConversations: 0,
          totalWaitlist: waitlistSnap.size,
          totalCacheRows: cacheSnap.size,
        });

        const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentLogs(logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-bg-base min-h-full font-sans">
      <header>
        <h2 className="text-5xl font-serif italic text-text-primary tracking-tight">System Command Center</h2>
        <p className="text-text-secondary font-sans text-[0.65rem] uppercase tracking-[0.2em] mt-2 font-bold">VentureMind Infrastructure Operations</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Members" value={metrics.totalUsers.toString()} icon={<Icons.Users size={18} />} trend="+12%" />
        <MetricCard label="Cache Intelligence" value={metrics.totalCacheRows.toString()} icon={<Icons.BrainCircuit size={18} />} trend="Cost-Saving" />
        <MetricCard label="Event Streams" value="LIVE" valueColor="text-[#4ade80]" icon={<Icons.Zap size={18} />} />
        <MetricCard label="System Health" value="99.9%" icon={<Icons.Activity size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif italic text-lg flex items-center gap-2">
              <Icons.History size={18} className="text-accent" />
              Real-time Event Log
            </h3>
            <button className="text-[10px] font-sans uppercase tracking-widest text-text-secondary hover:text-accent transition-colors font-bold">Audit Archive</button>
          </div>
          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-bg-elevated text-text-secondary uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-border-subtle">Event Type</th>
                  <th className="px-6 py-4 font-bold border-b border-border-subtle">Subject</th>
                  <th className="px-6 py-4 font-bold border-b border-border-subtle">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-elevated transition-colors text-text-primary">
                    <td className="px-6 py-4 font-bold text-accent">{log.type}</td>
                    <td className="px-6 py-4 opacity-70 font-mono">{log.userId?.slice(0, 10)}...</td>
                    <td className="px-6 py-4 opacity-50 font-mono">
                      {log.timestamp ? format(log.timestamp.toDate(), 'HH:mm:ss') : '...'}
                    </td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                   <tr>
                     <td colSpan={3} className="px-6 py-12 text-center opacity-20 italic">No recent activity detected</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Info */}
        <div className="space-y-6">
          <h3 className="font-serif italic text-lg flex items-center gap-2">
            <Icons.Database size={18} className="text-accent" />
            Infrastructure Info
          </h3>
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 space-y-6">
             <InfoRow label="DB Version" value="Firestore Enterprise" />
             <InfoRow label="Auth Handler" value="Google OAuth" />
             <InfoRow label="Cache Core" value="SHA-256 / Subtle" />
             <InfoRow label="Region" value="europe-west2" />
             <div className="pt-4 mt-4 border-t border-border-subtle">
                <p className="text-[0.7rem] text-text-secondary leading-relaxed italic">
                  Security rules strictly enforce Attribute-Based Access Control (ABAC). 
                  Access to this dashboard is restricted to verified administrators via secure token validation.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, trend, valueColor = "text-text-primary" }: any) => (
  <div className="bg-bg-surface border border-border-subtle p-6 rounded-lg relative group overflow-hidden hover:border-accent/30 transition-all">
     <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-accent/10 rounded-sm text-accent transition-colors">
           {icon}
        </div>
        {trend && <span className="text-[9px] font-sans text-accent font-bold uppercase tracking-wider">{trend}</span>}
     </div>
     <div className="flex flex-col">
        <span className="text-[0.65rem] font-sans uppercase tracking-[0.1em] text-text-secondary mb-1 font-bold">{label}</span>
        <span className={`text-3xl font-serif italic tracking-tight ${valueColor}`}>{value}</span>
     </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-xs">
     <span className="text-text-secondary uppercase tracking-[0.1em] font-sans text-[0.65rem] font-bold">{label}</span>
     <span className="font-mono text-text-primary opacity-80">{value}</span>
  </div>
);
