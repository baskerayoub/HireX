import { useEffect, useState } from 'react';
import {
  Award,
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  PencilLine,
  Save,
  Shield,
  User,
  Users,
  X,
  Sparkles,
  Activity,
} from 'lucide-react';
import { projectsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function formatJoinDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function profileCompletion(profile) {
  const checks = [profile.firstName || profile.name, profile.lastName, profile.email, profile.role];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    projectsApi
      .stats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });
  }, [user]);

  if (!user) return null;
  if (loadingStats) return <LoadingSpinner text="Loading profile..." />;

  const fullName = `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() || 'HireX User';
  const completion = profileCompletion(user);
  const memberSince = formatJoinDate(user.createdAt || user.joinDate);
  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  const cards = [
    { label: 'Projects', value: stats?.totalProjects ?? 0, icon: Briefcase, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Active Roles', value: stats?.activeProjects ?? 0, icon: Award, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Candidates', value: stats?.totalCandidates ?? 0, icon: Users, gradient: 'from-emerald-500 to-teal-600' },
  ];

  const details = [
    { icon: User, label: 'Name', value: fullName },
    { icon: Mail, label: 'Email', value: user.email || 'Unknown' },
    { icon: Shield, label: 'Role', value: user.role || 'Member' },
    { icon: Calendar, label: 'Member since', value: memberSince },
    { icon: MapPin, label: 'Workspace', value: 'HireX Platform' },
  ];

  const onSave = async (event) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) {
      toast.warning('First name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email.trim(),
      };

      const result = await updateProfile(payload);
      if (!result.success) {
        toast.error(result.error || 'Failed to save profile changes.');
        return;
      }

      if (result.warning) toast.info(result.warning);
      toast.success('Profile updated successfully.');
      setEditing(false);
    } catch {
      toast.error('An unexpected error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero profile card */}
      <section className="relative overflow-hidden rounded-2xl surface-primary p-6 sm:p-8 animate-fade-in">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-prpl/5 via-transparent to-accent/5 dark:from-prpl/8 dark:to-accent/5" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-prpl/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-prpl to-purple-600 text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-[0_8px_24px_-6px_rgba(124,58,237,0.4)] select-none">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{fullName}</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-prpl/8 dark:bg-prpl/15 px-3 py-1 text-xs font-semibold text-prpl">
                <Sparkles className="w-3 h-3" />
                {user.role || 'Member'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Completion ring */}
            <div className="rounded-2xl surface-elevated px-4 py-3 flex items-center gap-3">
              <div className="relative w-10 h-10">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-100 dark:text-slate-800" />
                  <circle cx="20" cy="20" r="16" stroke="url(#profileGrad)" strokeWidth="3" fill="none" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - completion / 100)}`}
                  />
                  <defs>
                    <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">{completion}%</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Profile</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Complete</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="btn-magnetic inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/60 dark:border-white/[0.06] px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-prpl/20 dark:hover:border-prpl/15 transition-all"
            >
              <PencilLine className="h-4 w-4" />
              {editing ? 'Close' : 'Edit'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-2xl surface-primary p-5 surface-hover animate-fade-in"
            style={{ animationDelay: `${(i + 1) * 75}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-current/10`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <Activity className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
          </article>
        ))}
      </section>

      {/* Details + Edit grid */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Account details */}
        <article className="rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-5">Account details</h2>
          <div className="space-y-2.5">
            {details.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100/80 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">{item.label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Edit profile */}
        <article className="rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-5">Edit profile</h2>
          <form className="space-y-4" onSubmit={onSave}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">First name</label>
              <input
                disabled={!editing || saving}
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-prpl focus:ring-2 focus:ring-prpl/15 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Last name</label>
              <input
                disabled={!editing || saving}
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-prpl focus:ring-2 focus:ring-prpl/15 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                disabled={!editing || saving}
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-prpl focus:ring-2 focus:ring-prpl/15 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={!editing || saving}
                className="btn-magnetic inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-prpl to-purple-600 px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                disabled={!editing || saving}
                onClick={() => {
                  setForm({
                    firstName: user.firstName || user.name?.split(' ')[0] || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                  });
                  setEditing(false);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/60 dark:border-white/[0.06] px-4 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:border-slate-300 dark:hover:border-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
