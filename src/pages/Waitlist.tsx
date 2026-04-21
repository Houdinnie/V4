import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../infra/firebase.ts';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export const WaitlistPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWaitlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'waitlist'), orderBy('signupDate', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'waitlist', id), { status });
      setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch (err) {
      console.error(err);
      setError('Failed to update status. Please try again.');
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Icons.Loader2 size={32} className="text-accent animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.5em] text-text-secondary">Loading waitlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-serif italic text-text-primary tracking-tight">Waitlist Pipeline</h2>
          <p className="text-text-secondary font-sans text-[0.65rem] uppercase tracking-[0.2em] mt-2 font-bold">Managing platform scarcity & exclusivity</p>
        </div>
        <button 
          onClick={fetchWaitlist}
          disabled={loading}
          className="p-3 bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50 text-accent"
          title="Refresh waitlist"
        >
          <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-3"
        >
          <Icons.AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-bg-elevated text-text-secondary uppercase tracking-widest text-[9px] font-bold border-b border-border-subtle">
              <tr>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Signup Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-bg-elevated transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-text-primary">{entry.email}</td>
                  <td className="px-6 py-4 text-text-secondary opacity-70 font-mono">
                    {entry.signupDate ? format(entry.signupDate.toDate(), 'yyyy-MM-dd HH:mm') : '...'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase border ${
                      entry.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      entry.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {entry.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(entry.id, 'approved')}
                          className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center hover:bg-green-500/20 transition-all"
                          title="Approve"
                        >
                          <Icons.Check size={14} />
                        </button>
                        <button 
                          onClick={() => updateStatus(entry.id, 'rejected')}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
                          title="Reject"
                        >
                          <Icons.X size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))}
              {entries.length === 0 && !loading && (
                 <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-secondary opacity-40 italic">The queue is currently empty</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-bg-surface border border-border-subtle rounded-lg">
        <div className="flex items-start gap-4">
          <Icons.Info size={18} className="text-accent mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-bold text-text-primary mb-1">Waitlist Management</p>
            <p>Review pending signups and approve or reject access to the platform. Approved users will receive access credentials via email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
