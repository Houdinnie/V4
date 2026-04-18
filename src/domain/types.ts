import { z } from 'zod';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

export type AgentId = 
  | 'ideator'
  | 'legal'
  | 'nomad'
  | 'luxury'
  | 'hotel'
  | 'fundraising'
  | 'tax'
  | 'visa'
  | 'wealth'
  | 'branding';

export interface AgentConfig {
  id: AgentId;
  name: string;
  tagline: string;
  description: string;
  icon: string; // Lucide icon name
  placeholder: string;
  suggestedPrompts: string[];
  systemInstruction: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  agentId: AgentId;
  lastMessage?: string;
  updatedAt: number;
  createdAt: number;
}

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

export const WaitlistSchema = z.object({
  email: z.string().email(),
});
