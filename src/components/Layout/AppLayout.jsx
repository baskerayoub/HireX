import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCircle,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Command,
  Sparkles,
} from 'lucide-react';
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
} from '../ui/Dropdown';
import { useState, useEffect, useRef } from 'react';

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Workspace';
  if (pathname === '/workspace') return 'Workspace';
  if (pathname === '/analytics') return 'Analytics';
  if (pathname === '/projects') return 'Projects';
  if (pathname === '/candidates') return 'Candidates';
  if (pathname === '/positions') return 'Positions';
  if (pathname === '/posts') return 'Posts';
  if (pathname === '/ai-assistant') return 'AI Assistant';
  if (pathname === '/interviews') return 'Interviews';
  if (pathname.includes('/candidates')) return 'Candidates';
  if (pathname.includes('/publication')) return 'Posts';
  if (pathname.includes('/interviews')) return 'Interviews';
  if (pathname.includes('/contracts')) return 'Contracts';
  if (pathname === '/profile') return 'My Profile';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/users') return 'User Management';
  return 'HireX';
}

function getPageDescription(pathname) {
  if (pathname === '/workspace') return 'Your AI-powered recruitment command center';
  if (pathname === '/analytics') return 'Insights and performance metrics';
  if (pathname === '/projects') return 'Manage your recruitment projects';
  if (pathname === '/candidates') return 'Track and evaluate candidates';
  if (pathname === '/positions') return 'Open positions and job roles';
  if (pathname === '/posts') return 'Create and publish job posts';
  if (pathname === '/ai-assistant') return 'Ask anything about your candidates';
  if (pathname === '/interviews') return 'Manage your interview pipeline';
  if (pathname === '/profile') return 'Manage your account details';
  if (pathname === '/settings') return 'Configure your workspace';
  return '';
}

// Command palette search (K shortcut)
function CommandSearch({ isOpen, onClose }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    setQuery('');
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const commands = [
    { label: 'Go to Workspace', path: '/workspace', icon: '🏠' },
    { label: 'View Projects', path: '/projects', icon: '📁' },
    { label: 'All Candidates', path: '/candidates', icon: '👥' },
    { label: 'Open Positions', path: '/positions', icon: '💼' },
    { label: 'AI Assistant', path: '/ai-assistant', icon: '🤖' },
    { label: 'Interviews', path: '/interviews', icon: '📅' },
    { label: 'Analytics', path: '/analytics', icon: '📊' },
    { label: 'Create Post', path: '/posts', icon: '📝' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
    { label: 'My Profile', path: '/profile', icon: '👤' },
  ].filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/50 dark:border-white/[0.04]">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search commands, pages..."
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-400 dark:text-slate-500 border border-slate-200/70 dark:border-slate-700/50">
              ESC
            </kbd>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-2 px-2">
            {commands.length === 0 ? (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">No results found</p>
            ) : (
              commands.map(cmd => (
                <button
                  key={cmd.path}
                  onClick={() => { navigate(cmd.path); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-prpl/8 dark:hover:bg-prpl/12 hover:text-prpl transition-all"
                >
                  <span className="text-base">{cmd.icon}</span>
                  <span className="font-medium">{cmd.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);

  const title = getPageTitle(location.pathname);
  const description = getPageDescription(location.pathname);
  const fullName = `${user?.firstName || user?.name || 'User'} ${user?.lastName || ''}`.trim();
  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  // Keyboard shortcut: Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAFBFD] dark:bg-[#0A0B10] transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header — premium glassmorphism */}
        <header className="h-[64px] glass-panel border-b border-slate-200/40 dark:border-white/[0.04] flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            <div>
              <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                {title}
              </h1>
              {description && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Command palette trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2.5 h-9 pl-3.5 pr-2.5 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02] text-xs text-slate-400 dark:text-slate-500 hover:border-prpl/30 dark:hover:border-prpl/20 hover:text-slate-600 dark:hover:text-slate-300 transition-all group"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="w-[120px] text-left">Search...</span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] font-medium text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/50 group-hover:border-prpl/20">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            <div className="h-5 w-px bg-slate-200/60 dark:bg-white/[0.04] hidden md:block" />

            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all"
            >
              {isDark ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
            </button>

            {/* Notifications */}
            <button
              title="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all"
            >
              <Bell className="w-[17px] h-[17px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-prpl rounded-full ring-2 ring-white dark:ring-[#111318]" />
            </button>

            <div className="h-5 w-px bg-slate-200/60 dark:bg-white/[0.04] hidden md:block" />

            {/* Profile dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all group">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-prpl to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 select-none shadow-[0_2px_6px_rgba(124,58,237,0.2)]">
                    {initials}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition" />
                </button>
              }
            >
              <DropdownHeader>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {fullName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
                <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-prpl/8 dark:bg-prpl/20 text-prpl text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {user?.role || 'User'}
                </span>
              </DropdownHeader>

              <div className="py-1">
                <DropdownItem icon={UserCircle} onClick={() => navigate('/profile')}>
                  My Profile
                </DropdownItem>
                <DropdownItem icon={SettingsIcon} onClick={() => navigate('/settings')}>
                  Settings
                </DropdownItem>
              </div>

              <DropdownDivider />

              <div className="py-1">
                <DropdownItem icon={LogOut} onClick={logout} danger>
                  Sign out
                </DropdownItem>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page content with premium transitions */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 lg:px-8 py-8 max-w-[1240px] mx-auto animate-fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Command palette */}
      <CommandSearch isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
