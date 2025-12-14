import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Chronicle AI assistant. I can help you with planning, productivity tips, journaling prompts, or just chat. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const getLocalApiKey = () => {
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
      if (!apiKey) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'AI is not configured. Add VITE_GEMINI_API_KEY to .env.local and reload.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });

      const recentMessages = messages.slice(-6);
      let conversationHistory = '';
      recentMessages.forEach(m => {
        const speaker = m.role === 'user' ? 'User' : 'Assistant';
        conversationHistory += speaker + ': ' + m.content + '\n';
      });

      const systemPrompt = 'You are Chronicle AI, a helpful assistant integrated into a personal planning and journaling app called Chronicle. You help users with: Planning and scheduling advice, Productivity tips, Journaling prompts and reflection questions, General life advice and motivation, Answering questions about time management. Keep responses concise, friendly, and helpful. Max 150 words unless user asks for more detail.';

      const fullPrompt = systemPrompt + '\n\nPrevious conversation:\n' + conversationHistory + '\nUser: ' + userInput;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text || 'I apologize, I could not generate a response.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-[calc(100vh-200px)] flex flex-col">
      <div className="bg-charcoal/90 backdrop-blur-xl rounded-3xl p-6 mb-6 text-bone">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-peach/20 rounded-2xl">
            <Bot size={28} className="text-peach" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Chronicle AI</h2>
            <p className="text-bone/60 text-sm font-medium">Your personal planning assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-charcoal text-white' : 'bg-peach/80 text-charcoal'
                }`}>
                  {isUser ? <User size={20} /> : <Bot size={20} />}
                </div>

                <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    isUser
                      ? 'bg-charcoal text-white rounded-tr-sm'
                      : 'bg-white/70 text-charcoal rounded-tl-sm border border-white/50'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-charcoal/40 mt-1 ${isUser ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-peach/80 text-charcoal flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="bg-white/70 p-4 rounded-2xl rounded-tl-sm border border-white/50">
                <Loader2 size={20} className="animate-spin text-charcoal/50" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/30 bg-white/20">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-white/60 backdrop-blur-sm p-4 rounded-2xl text-charcoal placeholder-charcoal/40 outline-none focus:ring-2 focus:ring-peach/50 resize-none font-medium"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-4 bg-charcoal text-white rounded-2xl hover:bg-charcoal/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-charcoal/40 mt-2 text-center">
            Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
