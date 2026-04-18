import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.ts';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined. AI features will be unavailable.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: any) => void;
}

/**
 * Generates a SHA-256 hash for cache keys
 */
async function getHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const streamChat = async (
  model: string,
  systemInstruction: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  message: string,
  callbacks: StreamCallbacks,
  useThinking: boolean = false
) => {
  try {
    // 1. Check Cache (Only for initial queries to save costs on common FAQs)
    const isInitialQuery = history.length === 0;
    let cacheKey = "";
    if (isInitialQuery) {
      const hashContent = `${model}:${systemInstruction}:${message}`;
      cacheKey = await getHash(hashContent);
      
      const cacheRef = doc(db, 'response_cache', cacheKey);
      const cacheSnap = await getDoc(cacheRef);
      
      if (cacheSnap.exists()) {
        const cachedData = cacheSnap.data();
        console.log("Strategic Cache Hit:", cacheKey);
        
        // Update stats
        await updateDoc(cacheRef, {
          usageCount: increment(1),
          lastHit: serverTimestamp()
        });

        // Simulate streaming for better UX even with cache
        const words = cachedData.response.split(' ');
        let current = "";
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i === words.length - 1 ? "" : " ");
          current += chunk;
          callbacks.onChunk(chunk);
          // Small delay to feel "live"
          if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
        }
        
        callbacks.onComplete(cachedData.response);
        return;
      }
    }

    // 2. Fallback to Gemini API
    const contents = [...history, { role: 'user', parts: [{ text: message }] }];
    
    // Convert to the correct format for the SDK
    const formattedContents = contents.map(c => ({
      role: c.role,
      parts: c.parts.map(p => ({ text: p.text }))
    }));

    const config: any = {
      systemInstruction,
    };

    if (useThinking && model === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: formattedContents,
      config,
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      fullText += chunkText;
      callbacks.onChunk(chunkText);
    }
    
    // 3. Populate Cache
    if (isInitialQuery && cacheKey && fullText) {
      try {
        await setDoc(doc(db, 'response_cache', cacheKey), {
          agentId: model, // Using model as agent identifier in cache
          promptHash: cacheKey,
          normalizedPrompt: message.toLowerCase().trim().slice(0, 500),
          response: fullText,
          usageCount: 1,
          lastHit: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      } catch (cacheErr) {
        console.warn("Failed to populate cache:", cacheErr);
      }
    }

    callbacks.onComplete(fullText);
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    callbacks.onError(error);
  }
};
