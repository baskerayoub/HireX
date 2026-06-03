import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import {
  Sun,
  Moon,
  ChevronDown,
  UserCircle,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Command,
  Sparkles,
  LayoutGrid,
  BarChart3,
  FolderKanban,
  Briefcase,
  Users,
  CalendarDays,
  Megaphone,
  Bot,
  ShieldCheck,
  Menu,
  X,
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
  if (pathname === '/workspace') return 'Your smart recruitment center';
  if (pathname === '/analytics') return 'Insights and performance metrics';
  if (pathname === '/projects') return 'Manage your recruitment projects';
  if (pathname === '/candidates') return 'Track and evaluate candidates';
  if (pathname === '/positions') return 'Open positions and job roles';
  if (pathname === '/posts') return 'Create and publish job posts';
  if (pathname === '/ai-assistant') return 'Ask anything';
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
      <div className="relative w-full max-w-lg mx-4 animate-scale-in">
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

// ─── Mobile Bottom Navigation ────────────────────────────────────────────────
// The 5 main tabs shown in the bottom bar on mobile
const BOTTOM_NAV_ITEMS = [
  { name: 'Home', path: '/workspace', icon: LayoutGrid },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Candidates', path: '/candidates', icon: Users },
  { name: 'AI', path: '/ai-assistant', icon: Bot },
];

// Full menu items for the mobile slide-up panel
function getMobileMenuItems(userRole) {
  const items = [
    { label: 'Workspace', path: '/workspace', icon: LayoutGrid },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Positions', path: '/positions', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Interviews', path: '/interviews', icon: CalendarDays },
    { label: 'Posts', path: '/posts', icon: Megaphone },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'My Profile', path: '/profile', icon: UserCircle },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
  ];
  if (userRole === 'Admin') {
    items.push({ label: 'User Management', path: '/users', icon: ShieldCheck });
  }
  return items;
}

function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const items = getMobileMenuItems(user?.role);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fullName = `${user?.firstName || user?.name || 'User'} ${user?.lastName || ''}`.trim();
  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[80] transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="mobile-menu-panel bg-white/95 dark:bg-[#111318]/95 backdrop-blur-2xl rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.4)] border-t border-slate-200/30 dark:border-white/[0.06] max-h-[85vh] overflow-hidden flex flex-col">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prpl to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.25)]">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{fullName}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme toggle */}
          <div className="px-6 pb-2">
            <button
              onClick={toggle}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-sm font-medium text-slate-600 dark:text-slate-300 transition-all"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="h-px bg-slate-200/60 dark:bg-white/[0.04] mx-6" />

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              {items.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/workspace' && item.path !== '/analytics' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-prpl/10 dark:bg-prpl/15 text-prpl'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] active:scale-95'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="h-px bg-slate-200/60 dark:bg-white/[0.04] mx-6" />

          {/* Sign out */}
          <div className="px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-sm font-semibold transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const title = getPageTitle(location.pathname);
  const description = getPageDescription(location.pathname);
  const fullName = `${user?.firstName || user?.name || 'User'} ${user?.lastName || ''}`.trim();
  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
        <header className="h-[56px] md:h-[64px] glass-panel border-b border-slate-200/40 dark:border-white/[0.04] flex items-center justify-between px-4 md:px-6 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile title (visible only on mobile) */}
            <div className="flex md:hidden items-center">
              <h2 className="font-splatink text-[1.3rem] text-prpl leading-none tracking-tight">HireX</h2>
            </div>
            {/* Desktop page title */}
            <div className="hidden md:block">
              <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                {title}
              </h1>
              {description && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Command palette trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2.5 h-9 pl-3.5 pr-2.5 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.02] text-xs text-slate-400 dark:text-slate-500 hover:border-prpl/30 dark:hover:border-prpl/20 hover:text-slate-600 dark:hover:text-slate-300 transition-all group"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="w-[120px] text-left">Search...</span>
            </button>

            {/* Mobile search button */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex md:hidden w-8 h-8 items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all"
            >
              <Search className="w-[17px] h-[17px]" />
            </button>

            <div className="h-5 w-px bg-slate-200/60 dark:bg-white/[0.04] hidden md:block" />

            {/* Theme toggle - desktop only */}
            <button
              onClick={toggle}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all"
            >
              {isDark ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
            </button>

            {/* Profile dropdown - desktop */}
            <div className="hidden md:block">
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all group">
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

            {/* Mobile profile avatar — just visual (menu is bottom bar) */}
            <div className="flex md:hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-prpl to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 select-none shadow-[0_2px_6px_rgba(124,58,237,0.2)]">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        {location.pathname === '/ai-assistant' ? (
          <main className="flex-1 overflow-hidden pb-[calc(68px+env(safe-area-inset-bottom,0px))] md:pb-0">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto pb-[calc(72px+env(safe-area-inset-bottom,0px))] md:pb-0">
            <div className="px-4 md:px-6 lg:px-8 py-5 md:py-8 max-w-[1240px] mx-auto animate-fade-in" key={location.pathname}>
              <Outlet />
            </div>
          </main>
        )}
      </div>

      {/* ─── Mobile Bottom Navigation Bar ─────────────────────────────── */}
      <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 md:hidden">
        {/* Frosted glass background */}
        <div className="absolute inset-0 bg-white/80 dark:bg-[#111318]/85 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/[0.06]" />
        <div className="relative flex items-stretch justify-around px-2 h-[68px] pb-[env(safe-area-inset-bottom,0px)]">
          {BOTTOM_NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/workspace' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="mobile-nav-tab flex flex-col items-center justify-center flex-1 gap-1 pt-2 pb-1 transition-all duration-200"
              >
                <div className={`relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-prpl/12 dark:bg-prpl/20'
                    : ''
                }`}>
                  <item.icon
                    className={`w-[20px] h-[20px] transition-all duration-200 ${
                      isActive
                        ? 'text-prpl stroke-[2.5px]'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-prpl shadow-[0_0_6px_rgba(124,58,237,0.6)]" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                  isActive ? 'text-prpl' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {item.name}
                </span>
              </button>
            );
          })}

          {/* More/Menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-nav-tab flex flex-col items-center justify-center flex-1 gap-1 pt-2 pb-1 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-10 h-7 rounded-2xl">
              <Menu className="w-[20px] h-[20px] text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-[10px] font-semibold leading-none text-slate-400 dark:text-slate-500">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile slide-up full menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Command palette */}
      <CommandSearch isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
