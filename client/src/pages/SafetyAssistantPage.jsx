import React, { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/api';
import {
  Bot, Send, Sparkles, AlertTriangle, ShieldCheck,
  RefreshCw, User, HelpCircle, PhoneCall
} from 'lucide-react';

const QUICK_PROMPTS = [
  'What should I do during a flash flood?',
  'Drop, Cover, and Hold On rules for an earthquake',
  'How to safely evacuate a building during a fire?',
  'What belongs in an emergency go-bag survival kit?',
  'First aid for severe bleeding and fractures',
  'Cyclone precautions before and during the storm'
];

export default function SafetyAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am **ResQ AI Safety Advisor**. I provide immediate, step-by-step disaster preparedness and survival guidance.

You can ask me how to stay safe during floods, earthquakes, structural fires, cyclones, landslides, or first aid scenarios.

⚠️ *Advisory Disclaimer: ResQ AI provides automated safety guidance. For active life-threatening emergencies, dial 112 or local emergency services immediately.*`,
      source: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await aiService.getStatus();
        if (res.data) setAiStatus(res.data);
      } catch (e) {}
    }
    checkStatus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { role: 'user', content: textToSend.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(
        textToSend.trim(),
        newHistory.map((m) => ({ role: m.role, content: m.content }))
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.reply,
          source: res.data.source
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered a temporary connection issue. Please ensure your device is connected to the network or consult local emergency services at 112.',
          source: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full px-3 py-0.5 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Module 6: AI Assistance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center space-x-2">
            <span>ResQ AI Disaster Safety Advisor</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Trained on NDMA disaster protocols to deliver instant life-safety guidance and preparedness checklists.
          </p>
        </div>

        {/* Engine Status pill */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs flex flex-col items-start gap-1">
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white">Engine Mode:</span>
            <span className="text-indigo-300 font-mono capitalize">{aiStatus?.mode || 'Active'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {aiStatus?.mode === 'gemini' ? 'Google Gemini 1.5 Flash' : 'Intelligent Fallback Engine'}
          </div>
        </div>
      </div>

      {/* Mandatory Emergency Alert Callout */}
      <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span><strong>Emergency Notice:</strong> This AI tool provides advisory safety tips. In acute life danger, immediately dial <strong>112</strong>.</span>
        </div>
        <a href="tel:112" className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shrink-0 transition">
          Dial 112
        </a>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';

            return (
              <div key={idx} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                  {!isUser && m.source && m.source !== 'system' && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Source: {m.source === 'gemini' ? 'Google Gemini API' : 'Knowledge Base Fallback'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center space-x-2">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                </span>
                <span>Formulating disaster safety guidance...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Prompts:</span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-full text-xs text-slate-600 hover:text-indigo-700 whitespace-nowrap transition shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white rounded-b-3xl">
          <div className="flex items-center space-x-2">
            <textarea
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a disaster safety question (e.g., 'What to do during an earthquake?')..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
