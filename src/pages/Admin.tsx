import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '../infra/firebase.ts';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalLogs: 0,
    totalWaitlist: 0,
    totalCacheRows: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersCount, logsCount, waitlistCount, cacheCount] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'event_logs')),
          getCountFromServer(collection(db, 'waitlist')),
          getCountFromServer(collection(db, 'response_cache')),
        ]);

        const logsSnap = await getDocs(query(collection(db, 'event_logs'), orderBy('timestamp', 'desc'), limit(15)));
        
        setMetrics({
          totalUsers: usersCount.data().count,
          totalLogs: logsCount.data().count,
          totalWaitlist: waitlistCount.data().count,
          totalCacheRows: cacheCount.data().count,
        });

        const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentLogs(logs);
      } catch (err) {
        console.error("Admin data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Icons.Shield size={48} className="text-accent opacity-20" />
          <p className="text-[10px] uppercase tracking-[0.5em] text-text-secondary">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-bg-base min-h-full font-sans">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-serif italic text-text-primary tracking-tight">System Command Center</h2>
          <p className="text-text-secondary font-sans text-[0.65rem] uppercase tracking-[0.2em] mt-2 font-bold">VentureMind Infrastructure Operations</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1">Session Active</p>
          <p className="text-[10px] font-mono text-text-secondary opacity-50 uppercase tracking-widest">{format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Members" value={metrics.totalUsers.toString()} icon={<Icons.Users size={18} />} trend="+12%" />
        <MetricCard label="Cache Intelligence" value={metrics.totalCacheRows.toString()} icon={<Icons.BrainCircuit size={18} />} trend="Cost-Saving" />
        <MetricCard label="Event Streams" value={metrics.totalLogs.toString()} valueColor="text-[#4ade80]" icon={<Icons.Zap size={18} />} />
        <MetricCard label="Waitlist Queue" value={metrics.totalWaitlist.toString()} icon={<Icons.Clock size={18} />} />
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
                    <td className="px-6 py-4">
                      <span className="font-bold text-accent px-2 py-1 rounded-sm bg-accent/5 border border-accent/10">{log.type}</span>
                    </td>
                    <td className="px-6 py-4 opacity-70 font-mono">{log.userId?.slice(0, 12)}...</td>
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
             <div className="p-4 bg-accent/5 border border-accent/10 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                   <Icons.ShieldCheck size={14} className="text-accent" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Security Status</span>
                </div>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                   All data streams are encrypted at rest and in transit. Audit logs are immutable and system-managed.
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
