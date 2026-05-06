import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, UserCircle, Settings, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const { logout, user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'My Profile', path: '/profile', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'User Management', path: '/users', icon: ShieldCheck });
  }

  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  return (
    <aside className="w-[260px] shrink-0 flex flex-col h-screen bg-white border-r border-slate-200/80">
      {/* Logo */}
      <div className="px-7 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <h2 className="font-splatink text-[2rem] text-prpl leading-none">HireX</h2>
          <span className="px-1.5 py-0.5 bg-prpl/10 text-prpl text-[9px] font-bold rounded uppercase tracking-wider">AI</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-[0.92rem] font-medium transition-all duration-150',
                isActive 
                  ? 'bg-prpl/8 text-prpl font-semibold' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* AI Badge */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-prpl/8 to-purple-50 rounded-xl p-4 border border-prpl/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-prpl" />
            <span className="text-xs font-bold text-prpl">AI Features</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Generate descriptions, parse CVs, and rank candidates with Gemini AI.
          </p>
        </div>
      </div>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-prpl/10 text-prpl text-sm font-bold flex items-center justify-center">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.firstName || user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-400 rounded-xl text-[0.92rem] font-medium transition-all hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </aside>
  );
}
