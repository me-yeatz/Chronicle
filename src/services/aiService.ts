import { PlanEvent } from "../types";

// Define AI provider types
export type AIProvider = 'gemini' | 'openai' | 'huggingface' | 'deepseek' | 'ollama';

// Configuration interface for each provider
export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// Response interface
export interface AIResponse {
  text: string;
  success: boolean;
  error?: string;
}

// Initialize with default provider
const DEFAULT_PROVIDER: AIProvider = 'gemini';

// Get user's preferred provider from localStorage
const getUserProvider = (): AIProvider => {
  try {
    const raw = localStorage.getItem('chronicle_user_profile');
    if (!raw) return DEFAULT_PROVIDER;
    const parsed = JSON.parse(raw);
    return parsed?.aiProvider || DEFAULT_PROVIDER;
  } catch {
    return DEFAULT_PROVIDER;
  }
};

// Get API key for the selected provider
const getApiKey = (provider: AIProvider): string | undefined => {
  try {
    const raw = localStorage.getItem('chronicle_user_profile');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    
    // Try to get provider-specific key first, fallback to generic key
    switch (provider) {
      case 'gemini':
        return parsed?.geminiApiKey || parsed?.aiApiKey || undefined;
      case 'openai':
        return parsed?.openaiApiKey || parsed?.aiApiKey || undefined;
      case 'huggingface':
        return parsed?.huggingfaceApiKey || parsed?.aiApiKey || undefined;
      case 'deepseek':
        return parsed?.deepseekApiKey || parsed?.aiApiKey || undefined;
      case 'ollama':
        return parsed?.ollamaApiKey || parsed?.aiApiKey || undefined;
      default:
        return parsed?.aiApiKey || undefined;
    }
  } catch {
    return undefined;
  }
};

// Generic function to call different AI providers
const callAIProvider = async (prompt: string, config: AIConfig): Promise<AIResponse> => {
  const { provider, model = 'default' } = config;
  const apiKey = config.apiKey || getApiKey(provider);

  if (!apiKey && provider !== 'ollama') {
    return {
      text: `AI provider ${provider} is not configured. Please add your API key in settings.`,
      success: false,
      error: 'Missing API key'
    };
  }

  try {
    switch (provider) {
      case 'gemini':
        return await callGemini(prompt, apiKey!, model);
      case 'openai':
        return await callOpenAI(prompt, apiKey!, model);
      case 'huggingface':
        return await callHuggingFace(prompt, apiKey!, model);
      case 'deepseek':
        return await callDeepSeek(prompt, apiKey!, model);
      case 'ollama':
        return await callOllama(prompt, model);
      default:
        return {
          text: 'Unsupported AI provider',
          success: false,
          error: 'Invalid provider'
        };
    }
  } catch (error) {
    console.error(`AI call failed for provider ${provider}:`, error);
    return {
      text: `Unable to get response from ${provider} at this moment.`,
      success: false,
      error: (error as Error).message
    };
  }
};

// Gemini API call
const callGemini = async (prompt: string, apiKey: string, model: string): Promise<AIResponse> => {
  // Dynamically import the module
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  
  const genModel = ai.models.get(model === 'default' ? 'gemini-2.5-flash' : model);
  const result = await genModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return { text, success: true };
};

// OpenAI API call
const callOpenAI = async (prompt: string, apiKey: string, model: string): Promise<AIResponse> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model === 'default' ? 'gpt-3.5-turbo' : model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    success: true
  };
};

// Hugging Face API call
const callHuggingFace = async (prompt: string, apiKey: string, model: string): Promise<AIResponse> => {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model === 'default' ? 'microsoft/DialoGPT-medium' : model}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : JSON.stringify(data),
    success: true
  };
};

// DeepSeek API call
const callDeepSeek = async (prompt: string, apiKey: string, model: string): Promise<AIResponse> => {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model === 'default' ? 'deepseek-chat' : model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    success: true
  };
};

// Ollama API call (local)
const callOllama = async (prompt: string, model: string): Promise<AIResponse> => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model === 'default' ? 'llama2' : model,
      prompt: prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.response,
    success: true
  };
};

// Main analysis function
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

  const provider = getUserProvider();
  const config: AIConfig = {
    provider,
    model: 'default' // Will use provider's default model
  };

  const result = await callAIProvider(prompt, config);
  return result.text;
};

// Journal reflection function
export const generateJournalReflection = async (events: PlanEvent[]): Promise<string> => {
  const recentEvents = events.slice(0, 5).map(e => `${e.title} (${e.category})`).join(', ');

  const prompt = `
    Based on these recent activities: ${recentEvents}, generate a short, thoughtful journal prompt for the user to reflect on their day.
    Keep it under 30 words.
  `;

  const provider = getUserProvider();
  const config: AIConfig = {
    provider,
    model: 'default'
  };

  const result = await callAIProvider(prompt, config);
  return result.text || "What are you grateful for today?";
};

// Function to get available providers
export const getAvailableProviders = (): AIProvider[] => {
  return ['gemini', 'openai', 'huggingface', 'deepseek', 'ollama'];
};

// Function to set user's preferred provider
export const setUserProvider = (provider: AIProvider): void => {
  try {
    const raw = localStorage.getItem('chronicle_user_profile');
    const profile = raw ? JSON.parse(raw) : {};
    profile.aiProvider = provider;
    localStorage.setItem('chronicle_user_profile', JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving provider preference:', error);
  }
};

// Function to save API key for a specific provider
export const saveProviderApiKey = (provider: AIProvider, apiKey: string): void => {
  try {
    const raw = localStorage.getItem('chronicle_user_profile');
    const profile = raw ? JSON.parse(raw) : {};
    
    switch (provider) {
      case 'gemini':
        profile.geminiApiKey = apiKey;
        break;
      case 'openai':
        profile.openaiApiKey = apiKey;
        break;
      case 'huggingface':
        profile.huggingfaceApiKey = apiKey;
        break;
      case 'deepseek':
        profile.deepseekApiKey = apiKey;
        break;
      case 'ollama':
        profile.ollamaApiKey = apiKey;
        break;
    }
    
    localStorage.setItem('chronicle_user_profile', JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving API key:', error);
  }
};