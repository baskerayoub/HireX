import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Briefcase } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = user.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user.name ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') : 'HX';

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-prpl/10 text-prpl text-2xl font-bold flex items-center justify-center mx-auto mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {user.firstName || user.name || 'User'} {user.lastName || ''}
          </h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <span className="inline-block mt-3 px-3 py-1 bg-prpl/8 text-prpl text-xs font-semibold rounded-full">
            {user.role || 'User'}
          </span>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Account Details</h3>
          <div className="space-y-4">
            {[
              { icon: User, label: 'Full Name', value: `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() || '—' },
              { icon: Mail, label: 'Email Address', value: user.email || '—' },
              { icon: Shield, label: 'Role', value: user.role || 'User' },
              { icon: Calendar, label: 'Joined', value: user.joinDate ? new Date(user.joinDate).toLocaleDateString() : '—' },
              { icon: Briefcase, label: 'Status', value: user.status || 'Active' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="p-2 rounded-lg bg-slate-50">
                  <item.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                  <p className="text-sm text-slate-800 font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
