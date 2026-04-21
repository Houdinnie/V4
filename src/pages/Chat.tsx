import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore, useChatStore } from '../app/store.ts';
import { AGENTS } from '../domain/agents.ts';
import { AgentId, Message, Conversation } from '../domain/types.ts';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { streamChat } from '../infra/gemini.ts';
import { formatDistanceToNow } from 'date-fns';

interface ChatPageProps {
  initialAgentId?: AgentId | null;
}

export const ChatPage: React.FC<ChatPageProps> = ({ initialAgentId }) => {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeConversation, 
    messages, 
    loadConversations, 
    setActiveConversation, 
    loadMessages, 
    addMessage,
    createConversation,
    deleteConversation,
    logEvent
  } = useChatStore();

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const unsub = loadConversations(user.uid);
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeConversation) {
      const unsub = loadMessages(user.uid, activeConversation.id);
      return () => unsub();
    }
  }, [user, activeConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  useEffect(() => {
    if (initialAgentId) {
      // Logic handled in parent or here to select or create
      handleAgentSelection(initialAgentId);
    }
  }, [initialAgentId]);

  const handleAgentSelection = async (agentId: AgentId) => {
    if (!user) return;
    const existing = conversations.find(c => c.agentId === agentId);
    if (existing) {
      setActiveConversation(existing);
    } else {
      const id = await createConversation(user.uid, agentId);
      // setActiveConversation will be handled by the onSnapshot or we can call it manually
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || !activeConversation || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setIsTyping(true);
    setStreamingText("");

    try {
      // 1. Add user message
      await addMessage(user.uid, activeConversation.id, 'user', userMessage);
      await logEvent('CHAT_REQUEST', { agentId: activeConversation.agentId, length: userMessage.length });

      // 2. Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }]
      }));

      const agent = AGENTS[activeConversation.agentId];

      // 3. Stream Gemini response
      await streamChat(
        'gemini-3.1-flash-lite-preview', // Lite for speed as requested
        agent.systemInstruction,
        history,
        userMessage,
        {
          onChunk: (chunk) => setStreamingText(prev => prev + chunk),
          onComplete: async (fullText) => {
            await addMessage(user.uid, activeConversation.id, 'model', fullText);
            setStreamingText("");
            setIsTyping(false);
          },
          onError: (err) => {
            setIsTyping(false);
            setStreamingText("An error occurred during response generation. Please try again.");
          }
        }
      );
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const agent = activeConversation ? AGENTS[activeConversation.agentId] : null;

  const handleClearSession = async () => {
    if (!user || !activeConversation) return;
    if (window.confirm("Are you sure you want to clear this session? This action is permanent.")) {
      await deleteConversation(user.uid, activeConversation.id);
      await logEvent('CLEAR_SESSION', { agentId: activeConversation.agentId });
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const agentCfg = AGENTS[conv.agentId];
      const nameMatch = agentCfg.name.toLowerCase().includes(q);
      const taglineMatch = agentCfg.tagline.toLowerCase().includes(q);
      const lastMsgMatch = conv.lastMessage?.toLowerCase().includes(q) || false;
      return nameMatch || taglineMatch || lastMsgMatch;
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex h-full">
      {/* Search & Thread Sidebar */}
      <div className="w-80 border-r border-border-subtle bg-bg-surface flex flex-col">
        <div className="p-6 border-b border-border-subtle">
           <h3 className="text-[0.65rem] font-sans uppercase tracking-[0.15em] text-text-secondary mb-4 font-bold">Service History</h3>
           <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input 
                type="text" 
                placeholder="Search sessions & insights..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-elevated rounded-md pl-9 pr-8 py-2 text-xs focus:ring-1 focus:ring-accent outline-none border border-border-subtle transition-all font-sans text-text-primary"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <Icons.X size={12} />
                </button>
              )}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 && (
            <div className="p-4 text-center opacity-30 italic text-xs">No active sessions</div>
          )}
          {searchQuery && filteredConversations.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center gap-3">
               <Icons.SearchX size={24} className="text-text-secondary opacity-20" />
               <p className="text-xs text-text-secondary italic">No strategic matches found for "{searchQuery}"</p>
            </div>
          )}
          {filteredConversations.map((conv) => {
            const agentCfg = AGENTS[conv.agentId];
            const isActive = activeConversation?.id === conv.id;
            const query = searchQuery.toLowerCase();
            const nameMatch = agentCfg.name.toLowerCase().includes(query);
            const taglineMatch = agentCfg.tagline.toLowerCase().includes(query);
            const lastMsgMatch = conv.lastMessage?.toLowerCase().includes(query) || false;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full text-left p-4 rounded-md transition-all border-r-2 ${
                  isActive ? 'bg-accent/8 text-accent border-accent' : 'hover:bg-bg-elevated text-text-secondary border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold truncate ${isActive ? 'text-accent' : 'text-text-primary'}`}>
                    {isActive ? '◈ ' : ''}
                    {agentCfg.name}
                  </span>
                  <span className="text-[9px] font-mono opacity-40">
                    {formatDistanceToNow(conv.updatedAt)}
                  </span>
                </div>
                {searchQuery && lastMsgMatch && !nameMatch && !taglineMatch && (
                  <div className="text-[10px] text-accent/60 mb-1 flex items-center gap-1">
                     <Icons.MessageSquare size={10} /> Match in response
                  </div>
                )}
                <p className="text-[0.65rem] opacity-50 line-clamp-1 h-3">{conv.lastMessage || 'Strategic inquiry pending...'}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-bg-base">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center mb-6 text-accent/20">
              <Icons.Fingerprint size={32} />
            </div>
            <h3 className="text-xl font-serif italic mb-2">Select a Consultant</h3>
            <p className="text-sm text-text-secondary max-w-sm">Initiate a secure session with a specialized intelligence layer.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-border-subtle flex items-center px-8 justify-between shrink-0 bg-bg-surface/30 backdrop-blur-sm">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent text-bg-base flex items-center justify-center font-bold shadow-[0_0_15px_rgba(201,160,99,0.2)]">
                    <Icons.Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif italic font-bold flex items-center gap-2 text-text-primary">
                      {agent?.name}
                      <span className="px-1.5 py-0.5 rounded-sm bg-accent/10 text-[8px] font-sans text-accent border border-accent/20 uppercase tracking-tighter">Verified Agent</span>
                    </h3>
                    <p className="text-[0.7rem] text-text-secondary uppercase tracking-widest">{agent?.tagline}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <RoundButton 
                    onClick={handleClearSession}
                    icon={<Icons.Trash2 size={16} />} 
                    title="Clear Session" 
                  />
                  <RoundButton icon={<Icons.Lock size={16} />} title="Secure Thread" />
               </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 scroll-smooth">
               {messages.length === 0 && !streamingText && (
                 <div className="max-w-3xl mx-auto space-y-12 py-12">
                   <div className="space-y-4">
                      <p className="text-[0.65rem] font-sans uppercase tracking-[0.2em] text-accent font-bold">Initialization Confirmed</p>
                      <h4 className="text-3xl font-serif italic">{agent?.description}</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {agent?.suggestedPrompts.map((p, i) => (
                        <button 
                          key={i} 
                          onClick={() => { setInput(p); handleSendMessage(); }}
                          className="text-left p-4 rounded-lg bg-bg-elevated border border-border-subtle hover:border-accent/30 transition-all group"
                        >
                          <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">{p}</p>
                        </button>
                      ))}
                   </div>
                 </div>
               )}

               {messages.map((m) => {
                 const highlightedContent = searchQuery && m.content.toLowerCase().includes(searchQuery.toLowerCase()) 
                   ? m.content.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark class="bg-accent/30 text-accent-foreground px-0.5 rounded">$1</mark>')
                   : m.content;

                 return (
                   <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {m.role === 'model' && <span className="font-serif italic text-accent text-sm mb-2">{agent?.name}</span>}
                      <div className={`max-w-[80%] ${
                        m.role === 'user' 
                          ? 'text-text-secondary text-right text-[1.05rem]' 
                          : 'text-text-primary text-[1.05rem] leading-relaxed tracking-[0.01em]'
                      }`}>
                        {searchQuery && m.content.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                          <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedContent }} />
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
                        <div className="text-[9px] opacity-30 mt-3 font-mono">
                          {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '...'}
                        </div>
                     </div>
                   </div>
                 );
               })}

               {streamingText && (
                 <div className="flex flex-col items-start">
                   <span className="font-serif italic text-accent text-sm mb-2">{agent?.name}</span>
                   <div className="max-w-[80%] text-text-primary text-[1.05rem] leading-relaxed tracking-[0.01em] animate-pulse">
                      <div className="whitespace-pre-wrap">{streamingText}</div>
                   </div>
                 </div>
               )}

               {isTyping && !streamingText && (
                 <div className="flex justify-start">
                    <div className="bg-bg-elevated rounded-full px-4 py-2 flex gap-1 border border-border-subtle">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce"></span>
                       <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                 </div>
               )}
            </div>

            {/* Input */}
            <div className="p-8 pb-10 bg-gradient-to-t from-bg-base via-bg-base to-transparent shrink-0">
               <div className="max-w-4xl mx-auto">
                  <form 
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-4 bg-bg-surface border border-border-subtle rounded-lg p-3 px-6 focus-within:border-accent/40 transition-all"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your strategic inquiry..."
                      className="flex-1 bg-transparent border-none outline-none resize-none py-3 text-[0.95rem] min-h-[44px] max-h-48 scrollbar-hide text-text-primary placeholder:text-text-secondary"
                      rows={1}
                    />
                    <button 
                      disabled={!input.trim() || isTyping}
                      className="text-accent hover:scale-110 active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all"
                    >
                      <Icons.ChevronRight size={24} />
                    </button>
                  </form>
                  <div className="mt-4 flex flex-wrap gap-2">
                     {agent?.suggestedPrompts.slice(0, 3).map((p, i) => (
                       <button 
                         key={i} 
                         onClick={() => setInput(p)}
                         className="px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded text-[0.75rem] text-text-secondary hover:text-accent hover:border-accent transition-all font-sans"
                       >
                         {p}
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Right Info Panel */}
      <div className="w-[300px] border-l border-border-subtle bg-bg-surface p-8 space-y-10 hidden xl:flex flex-col">
         <section>
            <span className="font-serif italic text-accent text-[0.85rem] uppercase tracking-widest block mb-4">Strategic Profile</span>
            <div className="p-5 bg-bg-elevated border border-border-subtle rounded-lg">
               <span className="text-sm font-bold block mb-1">{user?.displayName || 'Alexander von Herzog'}</span>
               <span className="text-[0.7rem] text-accent uppercase tracking-widest font-bold">Platinum Member</span>
            </div>
         </section>

         <section>
            <span className="font-serif italic text-accent text-[0.85rem] uppercase tracking-widest block mb-4">Context Metrics</span>
            <div className="space-y-4">
               <MetricRow label="Risk Tolerance" value="Moderate" />
               <MetricRow label="Asset Class" value="Global Real Estate" />
               <MetricRow label="Session Grade" value="Priority-A" />
            </div>
         </section>

         <section>
            <span className="font-serif italic text-accent text-[0.85rem] uppercase tracking-widest block mb-4">Compliance Audit</span>
            <div className="text-[0.75rem] text-text-secondary leading-relaxed">
               All sessions are encrypted end-to-end. Your audit trail is immutable and accessible only by your verified biometric ID.
            </div>
         </section>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-[0.85rem]">
     <span className="text-text-secondary font-sans">{label}</span>
     <span className="text-text-primary font-mono">{value}</span>
  </div>
);
const RoundButton = ({ icon, title, onClick }: { icon: any, title: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center hover:bg-bg-elevated transition-colors group relative" 
    title={title}
  >
    {icon}
  </button>
);
