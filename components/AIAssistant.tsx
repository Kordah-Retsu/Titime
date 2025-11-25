import React, { useState } from 'react';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { generateAnnouncement } from '../services/geminiService';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [promptDetails, setPromptDetails] = useState('');
  const [topic, setTopic] = useState('Payment Reminder');
  const [tone, setTone] = useState('Polite');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!promptDetails) return;
    setIsLoading(true);
    const response = await generateAnnouncement(topic, tone, promptDetails);
    setResult(response);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">TitiMe Assistant</span>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] bg-slate-50">
        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-2">
              Need to send a message to your members? I can help draft it for you.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Topic</label>
              <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
              >
                <option value="Payment Reminder">Payment Reminder</option>
                <option value="Event Announcement">Event Announcement</option>
                <option value="Welcome Message">Welcome Message</option>
                <option value="Fundraising Update">Fundraising Update</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Tone</label>
              <div className="flex gap-2">
                {['Polite', 'Urgent', 'Casual'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      tone === t 
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Key Details</label>
              <textarea
                value={promptDetails}
                onChange={(e) => setPromptDetails(e.target.value)}
                placeholder="E.g., Dues of GHS 50 are due this Friday for the Annual Gala."
                className="w-full p-3 text-sm border border-slate-200 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {navigator.clipboard.writeText(result)}}
                className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Copy Text
              </button>
              <button 
                onClick={() => setResult('')}
                className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      