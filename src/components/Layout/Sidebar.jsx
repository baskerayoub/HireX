import { NavLink, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  UserCircle,
  Settings,
  ShieldCheck,
  LogOut,
  LayoutGrid,
  Users,
  Briefcase,
  Megaphone,
  Sparkles,
  Bot,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      label: null,
      items: [
        { name: 'Workspace', path: '/workspace', icon: LayoutGrid },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Recruitment',
      items: [
        { name: 'Projects', path: '/projects', icon: FolderKanban },
        { name: 'Positions', path: '/positions', icon: Briefcase },
        { name: 'Candidates', path: '/candidates', icon: Users },
        { name: 'Interviews', path: '/interviews', icon: CalendarDays },
        { name: 'Posts', path: '/posts', icon: Megaphone },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
      ],
    },
    {
      label: 'Account',
      items: [
        { name: 'My Profile', path: '/profile', icon: UserCircle },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  if (user?.role === 'Admin') {
    navGroups.push({
      label: 'Admin',
      items: [{ name: 'User Management', path: '/users', icon: ShieldCheck }],
    });
  }

  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'bg-white/80 dark:bg-[#0D0F14]/90 backdrop-blur-xl',
        'border-r border-slate-200/50 dark:border-white/[0.04]',
        collapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-[64px] border-b border-slate-200/50 dark:border-white/[0.04] shrink-0',
        collapsed ? 'justify-center px-3' : 'px-6 gap-3',
      )}>
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-prpl to-purple-600 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
          <span className="text-white font-bold text-sm">H</span>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0D0F14]" />
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-splatink text-[1.7rem] text-prpl leading-none tracking-tight">HireX</h2>
            <span className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-prpl/10 to-accent/10 dark:from-prpl/20 dark:to-accent/20 text-prpl text-[8px] font-bold rounded-md uppercase tracking-widest border border-prpl/10 dark:border-prpl/20">
              Beta
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-6' : ''}>
            {group.label && !collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400/80 dark:text-slate-500/70 select-none">
                {group.label}
              </p>
            )}
            {group.label && collapsed && (
              <div className="w-full flex justify-center mb-2">
                <div className="w-5 h-px bg-slate-200 dark:bg-slate-700/50 rounded-full" />
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/workspace' && item.path !== '/analytics' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl text-[0.82rem] font-medium transition-all duration-200',
                      collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                      isActive
                        ? 'bg-prpl/8 text-prpl font-semibold dark:bg-prpl/12'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.03]',
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-prpl rounded-r-full" />
                    )}
                    <item.icon className={cn('shrink-0', collapsed ? 'w-[20px] h-[20px]' : 'w-[17px] h-[17px]')} />
                    {!collapsed && item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI promo card */}
      {!collapsed && (
        <div className="px-3 mb-3">
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-prpl/8 via-purple-50/50 to-accent/5 dark:from-prpl/15 dark:via-prpl/8 dark:to-accent/5 border border-prpl/8 dark:border-prpl/12">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-prpl/10 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-prpl/15 dark:bg-prpl/25 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-prpl" />
                </div>
                <span className="text-[10px] font-bold text-prpl uppercase tracking-widest">AI Powered</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Generate descriptions, parse CVs, and rank candidates with AI intelligence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className={cn('px-3 mb-2', collapsed && 'flex justify-center')}>
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'flex items-center gap-2 rounded-xl text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all',
            collapsed ? 'p-2' : 'px-3 py-2 w-full',
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User footer */}
      <div className="border-t border-slate-200/50 dark:border-white/[0.04] px-3 py-3">
        <div className={cn(
          'group flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all',
          collapsed ? 'justify-center p-2' : 'px-3 py-2.5',
        )}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-prpl to-purple-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 select-none shadow-[0_2px_8px_rgba(124,58,237,0.25)]">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[0.82rem] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                  {user?.firstName || user?.name || 'User'}
                </p>
                <p className="text-[0.7rem] text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
