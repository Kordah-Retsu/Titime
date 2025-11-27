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
    <div className="fixed bottom-6 right-6 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
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
      <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] bg-slate-50 dark:bg-slate-950">
        {!result ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Need to send a message to your members? I can help draft it for you.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Topic</label>
              <select 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Payment Reminder">Payment Reminder</option>
                <option value="Event Announcement">Event Announcement</option>
                <option value="Welcome Message">Welcome Message</option>
                <option value="Fundraising Update">Fundraising Update</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tone</label>
              <div className="flex gap-2">
                {['Polite', 'Urgent', 'Casual'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      tone === t 
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Key Details</label>
              <textarea
                value={promptDetails}
                onChange={(e) => setPromptDetails(e.target.value)}
                placeholder="E.g., Dues of GHS 50 are due this Friday for the Annual Gala."
                className="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {navigator.clipboard.writeText(result)}}
                className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Copy Text
              </button>
              <button 
                onClick={() => setResult('')}
                className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!result && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={!promptDetails || isLoading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isLoading ? 'Drafting...' : 'Generate Draft'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;