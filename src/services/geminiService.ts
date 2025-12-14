import { GoogleGenAI } from "@google/genai";
import { PlanEvent, AIInsight } from "../types";

const getLocalApiKey = (): string | undefined => {
  try {
    const raw = localStorage.getItem('chronicle_user_profile');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed?.aiApiKey || undefined;
  } catch {
    return undefined;
  }
};

const apiKey =
  getLocalApiKey() ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) ||
  (typeof process !== 'undefined' ? process.env?.API_KEY : undefined);

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeSchedule = async (events: PlanEvent[]): Promise<string> => {
  if (events.length === 0) {
    return "Your schedule is currently empty. Add some events to get started!";
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.endDate >= today)
    .map(e => `- [${e.category}] ${e.title}: ${e.startDate} to ${e.endDate} (${e.notes})`)
    .join('\n');

  const prompt = `
    You are a personal productivity assistant. Analyze the following upcoming schedule for the user.
    Identify any potential date clashes (overlapping dates), provide a brief summary of the workload, and give one short motivational tip based on the categories (e.g., balancing Work and Personal).
    Keep the tone minimalist, professional, and calm. Max 100 words.
    
    Schedule:
    ${upcomingEvents}
  `;

  try {
    if (!ai) return "AI is not configured. Set VITE_GEMINI_API_KEY in .env.local.";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Unable to analyze schedule at this moment.";
  }
};

export const generateJournalReflection = async (events: PlanEvent[]): Promise<string> => {
  const recentEvents = events.slice(0, 5).map(e => `${e.title} (${e.category})`).join(', ');
  
  const prompt = `
    Based on these recent activities: ${recentEvents}, generate a short, thoughtful journal prompt for the user to reflect on their day. 
    Keep it under 30 words.
  `;

  try {
    if (!ai) return "What are you grateful for today?";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "What are you grateful for today?";
  } catch (error) {
    return "What are you grateful for today?";
  }
};
