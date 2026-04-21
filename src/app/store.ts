import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../infra/firebase.ts';
import { UserProfile, Conversation, Message, AgentId } from '../domain/types.ts';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>) => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    set({ user: updatedUser });
  },
  init: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const isBootstrappedAdmin = firebaseUser.email === 'panamurang@gmail.com';
        
        if (userSnap.exists()) {
          let userData = userSnap.data() as UserProfile;
          if (isBootstrappedAdmin && userData.role !== 'admin') {
             // Sync role for bootstrapped admin
             await updateDoc(userRef, { role: 'admin' });
             userData.role = 'admin';
          }
          set({ user: userData, loading: false, initialized: true });
        } else {
          // New user
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: isBootstrappedAdmin ? 'admin' : 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await setDoc(userRef, newUser);
          set({ user: newUser, loading: false, initialized: true });
        }
      } else {
        set({ user: null, loading: false, initialized: true });
      }
    });
  },
}));

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingMessages: boolean;
  loadConversations: (userId: string) => () => void;
  setActiveConversation: (conv: Conversation | null) => void;
  loadMessages: (userId: string, convId: string) => () => void;
  addMessage: (userId: string, convId: string, role: 'user' | 'model', content: string) => Promise<void>;
  createConversation: (userId: string, agentId: AgentId) => Promise<string>;
  deleteConversation: (userId: string, convId: string) => Promise<void>;
  logEvent: (type: string, payload: any) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loadingMessages: false,

  loadConversations: (userId) => {
    const q = query(
      collection(db, 'users', userId, 'conversations'),
      where('deleted', '!=', true),
      orderBy('deleted'),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const convs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[];
      set({ conversations: convs });
    });
  },

  setActiveConversation: (conv) => set({ activeConversation: conv, messages: [] }),

  loadMessages: (userId, convId) => {
    set({ loadingMessages: true });
    const q = query(
      collection(db, 'users', userId, 'conversations', convId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      set({ messages: msgs, loadingMessages: false });
    });
  },

  addMessage: async (userId, convId, role, content) => {
    const messagesRef = collection(db, 'users', userId, 'conversations', convId, 'messages');
    await addDoc(messagesRef, {
      role,
      content,
      timestamp: serverTimestamp(),
    });

    // Update conversation metadata
    const convRef = doc(db, 'users', userId, 'conversations', convId);
    await updateDoc(convRef, {
      lastMessage: content,
      updatedAt: serverTimestamp(),
    });

    // Update analytics
    if (role === 'user') {
      const convSnap = await getDoc(convRef);
      const agentId = convSnap.data()?.agentId;
      if (agentId) {
        const analyticsRef = doc(db, 'service_analytics', agentId);
        await setDoc(analyticsRef, {
          agentId,
          count: increment(1),
          lastUsed: serverTimestamp()
        }, { merge: true });
      }
    }
  },

  createConversation: async (userId, agentId) => {
    const convsRef = collection(db, 'users', userId, 'conversations');
    const docRef = await addDoc(convsRef, {
      userId,
      agentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  deleteConversation: async (userId, convId) => {
    const convRef = doc(db, 'users', userId, 'conversations', convId);
    await updateDoc(convRef, { deleted: true }); // Soft delete for audit
    set({ activeConversation: null, messages: [] });
  },

  logEvent: async (type, payload) => {
    const user = useAuthStore.getState().user;
    await addDoc(collection(db, 'event_logs'), {
      type,
      userId: user?.uid || 'anonymous',
      payload,
      timestamp: serverTimestamp()
    });
  }
}));
