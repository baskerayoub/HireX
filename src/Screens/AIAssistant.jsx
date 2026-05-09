import { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Search,
  ArrowRight,
  Lightbulb,
  Users,
  FileText,
  Target,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

const suggestions = [
  { label: 'Best frontend candidates', icon: Users, prompt: 'Who is the best frontend candidate?' },
  { label: 'How to rank CVs', icon: Target, prompt: 'How do I use AI to rank candidate CVs?' },
  { label: 'Create a job post', icon: Sparkles, prompt: 'How can I create and publish a job post on LinkedIn?' },
  { label: 'Interview tips', icon: FileText, prompt: 'What are best practices for conducting interviews?' },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-prpl/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-prpl/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-prpl/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function MessageBubble({ message, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const isAI = message.role === 'assistant';

  return (
    <div className={`flex gap-3 animate-fade-in ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
        isAI
          ? 'bg-gradient-to-br from-prpl to-purple-600 shadow-[0_2px_8px_rgba(124,58,237,0.25)]'
          : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600'
      }`}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
      </div>
      <div className={`max-w-[80%] ${isAI ? '' : 'text-right'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAI
            ? 'surface-primary text-slate-700 dark:text-slate-200'
            : 'bg-prpl text-white'
        }`}>
          {message.content.split('\n').map((line, i) => {
            const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <p key={i} className={i > 0 ? 'mt-1.5' : ''} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />;
          })}
        </div>
        {isAI && (
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 hover:text-prpl transition"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const query = text || input.trim();
    if (!query || isTyping) return;

    const userMsg = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError('');

    try {
      const res = await aiApi.chat(updatedMessages);
      const reply = res.data?.reply || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('AI Chat error:', err);
      const errMsg = err.response?.data?.error || 'Failed to get a response. Please try again.';
      setError(errMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-prpl to-purple-600 flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI Assistant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by AI · Recruitment only
              </p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl surface-primary p-6">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-prpl/10 to-accent/10 dark:from-prpl/15 dark:to-accent/15 flex items-center justify-center mb-5 animate-pulse-glow">
              <Sparkles className="w-7 h-7 text-prpl" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Your HireX Recruitment Assistant
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
              Ask me about candidates, interviews, job posts, CV analysis, and any HireX recruitment features.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.prompt)}
                  className="group flex items-center gap-3 rounded-xl surface-elevated p-3.5 text-left hover:border-prpl/20 dark:hover:border-prpl/15 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-prpl/8 dark:bg-prpl/15 flex items-center justify-center shrink-0 group-hover:bg-prpl/15 dark:group-hover:bg-prpl/25 transition">
                    <s.icon className="w-4 h-4 text-prpl" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.label}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-prpl transition" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-prpl to-purple-600 flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(124,58,237,0.25)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl surface-elevated px-4 py-2.5">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4">
        <div className="relative glass-panel rounded-2xl shadow-lg">
          <div className="flex items-end gap-3 p-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about candidates, positions, or hiring pipeline..."
                rows={1}
                className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none py-2 px-1 max-h-32"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="btn-magnetic w-10 h-10 rounded-xl bg-gradient-to-br from-prpl to-purple-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          HireX AI — specialized in recruitment features only.
        </p>
      </div>
    </div>
  );
}
