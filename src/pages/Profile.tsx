import React, { useState } from 'react';
import { useAuthStore } from '../app/store.ts';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      if (displayName && displayName.length > 128) {
        setError('Display name must be less than 128 characters.');
        return;
      }
      if (photoURL && photoURL.length > 512) {
        setError('Avatar URL must be less than 512 characters.');
        return;
      }
      await updateProfile({ displayName: displayName || undefined, photoURL: photoURL || undefined });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-12">
      <header>
        <h2 className="text-5xl font-serif italic text-text-primary tracking-tight">Identity Settings</h2>
        <p className="text-text-secondary font-sans text-[0.65rem] uppercase tracking-[0.2em] mt-2 font-bold font-sans">Strategic Profile Management</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8 bg-bg-surface border border-border-subtle p-8 rounded-lg">
        <div className="flex flex-col items-center gap-6 mb-8">
           <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-accent/20 overflow-hidden bg-bg-elevated flex items-center justify-center">
                 {photoURL ? (
                   <img src={photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                 ) : (
                   <Icons.User size={40} className="text-text-secondary" />
                 )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Icons.Camera size={20} className="text-white" />
              </div>
           </div>
           <div className="text-center">
              <p className="text-sm font-bold text-text-primary mb-1">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-accent uppercase tracking-widest font-bold">{user?.role === 'admin' ? 'Admin Tier' : 'Platinum Member'}</p>
           </div>
        </div>

        <div className="grid gap-6">
           <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-[0.15em] text-text-secondary font-bold">Display Name</label>
              <div className="relative">
                 <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                 <input 
                   type="text" 
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
                   className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-accent outline-none transition-all text-text-primary"
                   placeholder="Enter your legal or alias name"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-[0.15em] text-text-secondary font-bold">Avatar URL</label>
              <div className="relative">
                 <Icons.Link className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                 <input 
                   type="url" 
                   value={photoURL}
                   onChange={(e) => setPhotoURL(e.target.value)}
                   className="w-full bg-bg-elevated border border-border-subtle rounded-md pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-accent outline-none transition-all text-text-primary"
                   placeholder="https://images.remote.com/photo.jpg"
                 />
              </div>
              <p className="text-[10px] text-text-secondary opacity-50 italic">Provide a secure URL for your strategic avatar.</p>
           </div>
        </div>

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

        <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               {success && (
                 <motion.div 
                   initial={{ opacity: 0, x: -10 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   className="flex items-center gap-2 text-green-400 text-xs font-bold font-sans"
                 >
                   <Icons.CheckCircle size={14} /> Profile Synchronized
                 </motion.div>
               )}
            </div>
            <button 
              disabled={saving}
              className="bg-accent text-bg-base px-8 py-3 rounded-md font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-[0_0_20px_rgba(201,160,99,0.2)]"
            >
              {saving ? <Icons.Loader2 className="animate-spin" size={16} /> : <Icons.Save size={16} />}
              Update Identity
            </button>
        </div>
      </form>

      <section className="bg-bg-surface/50 border border-border-subtle/50 p-6 rounded-lg opacity-60">
         <h4 className="text-[0.65rem] uppercase tracking-[0.2em] text-accent font-bold mb-4">Identity Verification Notice</h4>
         <p className="text-[0.75rem] text-text-secondary leading-relaxed serif italic">
           To maintain the integrity of the VentureMind brain trust, all identity changes are recorded in the immutable infrastructure logs. Multiple frequent changes may trigger a manual audit by the Operations team.
         </p>
      </section>
    </div>
  );
};
