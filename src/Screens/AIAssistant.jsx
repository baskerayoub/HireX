import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiApi } from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ArrowRight,
  Lightbulb,
  Users,
  FileText,
  Target,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  MessageSquarePlus,
  History,
  Trash2,
  ChevronLeft,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  BrainCircuit,
  Briefcase,
  BarChart3,
  Calendar,
} from 'lucide-react';

/* ── Suggestion Chips ──────────────────────── */
const suggestions = [
  { label: 'Top candidates overview', icon: Users, prompt: 'Give me an overview of my top candidates and their scores.' },
  { label: 'AI CV ranking explained', icon: Target, prompt: 'How does the AI CV ranking system work in HireX?' },
  { label: 'Publish on LinkedIn', icon: Briefcase, prompt: 'How can I create and publish a job post on LinkedIn from HireX?' },
  { label: 'Interview best practices', icon: Calendar, prompt: 'What are best practices for scheduling and conducting interviews in HireX?' },
  { label: 'Analytics dashboard', icon: BarChart3, prompt: 'How can I use the Analytics dashboard to improve my recruitment pipeline?' },
  { label: 'Platform quick start', icon: BrainCircuit, prompt: 'Give me a quick-start guide on using HireX as a recruiter.' },
];

/* ── Typing Indicator ──────────────────────── */
function TypingIndicator() {
  return (
    <div className="ai-typing-indicator">
      <div className="ai-typing-dot" style={{ animationDelay: '0ms' }} />
      <div className="ai-typing-dot" style={{ animationDelay: '150ms' }} />
      <div className="ai-typing-dot" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/* ── Markdown Renderer ─────────────────────── */
function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="ai-md-p">{children}</p>,
        strong: ({ children }) => <strong className="ai-md-strong">{children}</strong>,
        em: ({ children }) => <em className="ai-md-em">{children}</em>,
        ul: ({ children }) => <ul className="ai-md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="ai-md-ol">{children}</ol>,
        li: ({ children }) => <li className="ai-md-li">{children}</li>,
        h1: ({ children }) => <h3 className="ai-md-h">{children}</h3>,
        h2: ({ children }) => <h3 className="ai-md-h">{children}</h3>,
        h3: ({ children }) => <h3 className="ai-md-h">{children}</h3>,
        code: ({ inline, className, children }) => {
          if (inline) return <code className="ai-md-code-inline">{children}</code>;
          return (
            <div className="ai-md-code-block">
              <pre><code className={className}>{children}</code></pre>
            </div>
          );
        },
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="ai-md-link">{children}</a>
        ),
        blockquote: ({ children }) => <blockquote className="ai-md-blockquote">{children}</blockquote>,
        table: ({ children }) => (
          <div className="ai-md-table-wrap"><table className="ai-md-table">{children}</table></div>
        ),
        th: ({ children }) => <th className="ai-md-th">{children}</th>,
        td: ({ children }) => <td className="ai-md-td">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ── Message Bubble ────────────────────────── */
function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isAI = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`ai-message-row ${isAI ? 'ai-message-row--ai' : 'ai-message-row--user'}`}>
      {/* Avatar */}
      <div className={`ai-avatar ${isAI ? 'ai-avatar--bot' : 'ai-avatar--user'}`}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="ai-message-content">
        <div className={`ai-bubble ${isAI ? 'ai-bubble--ai' : 'ai-bubble--user'}`}>
          {isAI ? (
            <MarkdownContent content={message.content} />
          ) : (
            <p className="ai-user-text">{message.content}</p>
          )}
        </div>

        {/* Actions (AI only) */}
        {isAI && (
          <div className="ai-message-actions">
            <button onClick={handleCopy} className="ai-action-btn">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton Loader ───────────────────────── */
function ThinkingSkeleton() {
  return (
    <div className="ai-message-row ai-message-row--ai">
      <div className="ai-avatar ai-avatar--bot">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="ai-message-content">
        <div className="ai-bubble ai-bubble--ai">
          <div className="ai-thinking">
            <div className="ai-thinking-label">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>HireX AI is thinking...</span>
            </div>
            <TypingIndicator />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Conversation History Item ─────────────── */
function getAiErrorMessage(err) {
  if (err.response?.status === 404) {
    return 'AI endpoint was not found. Make sure the backend server is running and updated, then try again.';
  }
  return err.response?.data?.error || 'Failed to get a response. Please try again.';
}

function ConversationItem({ conv, isActive, onSelect, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <button
      onClick={() => onSelect(conv.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={`ai-conv-item ${isActive ? 'ai-conv-item--active' : ''}`}
    >
      <MessageSquarePlus className="w-4 h-4 shrink-0 opacity-50" />
      <span className="ai-conv-title">{conv.title}</span>
      {showDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
          className="ai-conv-delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   ██  MAIN AI ASSISTANT COMPONENT  ██
   ═══════════════════════════════════════════════ */
export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const saveTimerRef = useRef(null);

  /* ── Auto scroll to bottom ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Load conversation list ── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await aiApi.listConversations();
      setConversations(res.data || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  /* ── Auto-save conversation (debounced) ── */
  const autoSave = useCallback(async (msgs, convId) => {
    if (msgs.length === 0) return;
    try {
      // Generate title from first user message
      const firstUserMsg = msgs.find(m => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '') : 'New conversation';

      const res = await aiApi.saveConversation({
        id: convId || undefined,
        title,
        messages: msgs,
      });

      if (res.data?.id && !convId) {
        setActiveConvId(res.data.id);
      }
      loadConversations();
    } catch { /* silent */ }
  }, [loadConversations]);

  /* ── Send message ── */
  const sendMessage = async (text) => {
    const query = text || input.trim();
    if (!query || isTyping) return;

    const userMsg = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    setError('');

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await aiApi.chat(updatedMessages);
      const reply = res.data?.reply || "I couldn't process that. Please try again.";
      const finalMessages = [...updatedMessages, { role: 'assistant', content: reply }];
      setMessages(finalMessages);

      // Debounced auto-save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => autoSave(finalMessages, activeConvId), 1000);
    } catch (err) {
      console.error('AI Chat error:', err);
      const errMsg = getAiErrorMessage(err);
      setError(errMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  /* ── Handle keyboard ── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── New chat ── */
  const startNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setError('');
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  /* ── Load conversation ── */
  const loadConversation = async (id) => {
    setLoadingHistory(true);
    try {
      const res = await aiApi.getConversation(id);
      setMessages(res.data?.messages || []);
      setActiveConvId(id);
      setError('');
      setSidebarOpen(false);
    } catch {
      setError('Failed to load conversation');
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ── Delete conversation ── */
  const deleteConversation = async (id) => {
    try {
      await aiApi.deleteConversation(id);
      if (activeConvId === id) {
        setMessages([]);
        setActiveConvId(null);
      }
      loadConversations();
    } catch { /* silent */ }
  };

  const greeting = user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back';

  return (
    <div className="ai-chat-container">
      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div className="ai-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`ai-sidebar ${sidebarOpen ? 'ai-sidebar--open' : ''}`}>
        <div className="ai-sidebar-header">
          <h3 className="ai-sidebar-title">
            <History className="w-4 h-4" />
            Chat History
          </h3>
          <button onClick={() => setSidebarOpen(false)} className="ai-sidebar-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <button onClick={startNewChat} className="ai-new-chat-btn">
          <MessageSquarePlus className="w-4 h-4" />
          New Conversation
        </button>

        <div className="ai-conv-list">
          {conversations.length === 0 ? (
            <p className="ai-conv-empty">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onSelect={loadConversation}
                onDelete={deleteConversation}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="ai-main">
        {/* Header */}
        <header className="ai-header">
          <div className="ai-header-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ai-header-btn"
              title="Toggle history"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <div className="ai-header-brand">
              <div className="ai-header-logo">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="ai-header-title">HireX AI</h1>
                <p className="ai-header-subtitle">
                  <span className="ai-status-dot" />
                  Recruitment Assistant
                </p>
              </div>
            </div>
          </div>
          <div className="ai-header-right">
            {messages.length > 0 && (
              <button onClick={startNewChat} className="ai-header-btn ai-header-btn--clear" title="New chat">
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="ai-messages-area">
          {loadingHistory ? (
            <div className="ai-messages-loading">
              <Loader2 className="w-6 h-6 animate-spin text-prpl" />
              <p>Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            /* ── Empty State ── */
            <div className="ai-empty-state">
              <div className="ai-empty-glow">
                <div className="ai-empty-icon">
                  <Sparkles className="w-8 h-8 text-prpl" />
                </div>
              </div>
              <h2 className="ai-empty-title">{greeting}</h2>
              <p className="ai-empty-desc">
                I'm your HireX AI assistant. Ask me anything about recruitment, candidates, interviews, or platform features.
              </p>

              <div className="ai-suggestions-grid">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.prompt)}
                    className="ai-suggestion-card"
                  >
                    <div className="ai-suggestion-icon">
                      <s.icon className="w-4 h-4 text-prpl" />
                    </div>
                    <span className="ai-suggestion-label">{s.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-30 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Chat Messages ── */
            <div className="ai-messages-list">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isTyping && <ThinkingSkeleton />}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="ai-input-area">
          <div className="ai-input-container">
            <textarea
              ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about candidates, positions, interviews, or any HireX feature..."
              rows={1}
              className="ai-input-textarea"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="ai-send-btn"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="ai-input-footer">
            HireX AI · Specialized in recruitment platform assistance
          </p>
        </div>
      </main>
    </div>
  );
}
