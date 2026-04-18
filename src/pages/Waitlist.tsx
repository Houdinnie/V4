import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../infra/firebase.ts';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { format } from 'date-fns';

export const WaitlistPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'waitlist'), orderBy('signupDate', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    } catch (err) {
      console.error(err);
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
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Waitlist Pipeline</h2>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest mt-2">Managing platform scarcity & exclusivity</p>
        </div>
        <button 
          onClick={fetchWaitlist}
          className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
        >
          <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-white/30 uppercase tracking-widest text-[9px]">
              <tr>
                <th className="px-6 py-4 font-bold">Email Address</th>
                <th className="px-6 py-4 font-bold">Signup Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-white/80">{entry.email}</td>
                  <td className="px-6 py-4 opacity-40">
                    {entry.signupDate ? format(entry.signupDate.toDate(), 'yyyy-MM-dd HH:mm') : '...'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                      entry.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      entry.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {entry.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(entry.id, 'approved')}
                          className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20 transition-all"
                        >
                          <Icons.Check size={14} />
                        </button>
                        <button 
                          onClick={() => updateStatus(entry.id, 'rejected')}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
                        >
                          <Icons.X size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && !loading && (
                 <tr>
                    <td colSpan={4} className="px-6 py-12 text-center opacity-20">The queue is currently empty</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
