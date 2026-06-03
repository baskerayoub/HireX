import { useEffect, useState } from 'react';
import {
  Award, Briefcase, Calendar, Mail, MapPin, PencilLine, Save, Shield, User, Users,
  X, Sparkles, CheckCircle2, AlertCircle, MessageSquare,
  Loader2, Link2, Camera, Globe, TrendingUp,
} from 'lucide-react';
import { projectsApi, linkedinApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function formatJoinDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', bio: '', location: '' });
  const [linkedinStatus, setLinkedinStatus] = useState(null);
  const [linkedinLoading, setLinkedinLoading] = useState(true);

  useEffect(() => {
    projectsApi.stats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
    linkedinApi.status()
      .then((res) => setLinkedinStatus(res.data))
      .catch(() => setLinkedinStatus({ connected: false }))
      .finally(() => setLinkedinLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || '',
      email: user.email || '',
      bio: user.bio || '',
      location: user.location || '',
    });
  }, [user]);

  if (!user) return null;
  if (loadingStats) return <LoadingSpinner text="Loading profile..." />;

  const fullName = `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() || 'HireX User';
  const memberSince = formatJoinDate(user.createdAt || user.joinDate);
  const initials = user?.firstName
    ? (user.firstName[0] + (user.lastName?.[0] || '')).toUpperCase()
    : user?.name
      ? user.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
      : 'HX';

  // LinkedIn avatar
  const avatarUrl = linkedinStatus?.picture || user.avatarUrl || null;

  // Profile completion
  const completionChecks = [
    { label: 'Name added', done: !!(user.firstName && user.lastName), icon: User },
    { label: 'Email verified', done: !!user.email, icon: Mail },
    { label: 'LinkedIn connected', done: !!linkedinStatus?.connected, icon: Link2 },
    { label: 'Location added', done: !!(user.location || form.location), icon: MapPin },
    { label: 'Bio completed', done: !!(user.bio || form.bio), icon: MessageSquare },
  ];
  const completedCount = completionChecks.filter(c => c.done).length;
  const completion = Math.round((completedCount / completionChecks.length) * 100);

  const statCards = [
    { label: 'Projects', value: stats?.totalProjects ?? 0, icon: Briefcase, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Candidates', value: stats?.totalCandidates ?? 0, icon: Users, gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Interviews', value: stats?.totalInterviews ?? 0, icon: Calendar, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Active Roles', value: stats?.activeProjects ?? 0, icon: Award, gradient: 'from-amber-500 to-orange-500' },
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
        bio: form.bio.trim(),
        location: form.location.trim(),
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

  const inputClass = "h-11 w-full rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-prpl focus:ring-2 focus:ring-prpl/20 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── LinkedIn-style Hero Card ────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl surface-primary animate-fade-in shadow-lg shadow-black/[0.04] dark:shadow-black/20">
        {/* Banner / Cover Image — LinkedIn style */}
        <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
          {/* Layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700" />
          {/* Abstract geometric decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-400/40 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
            <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          </div>
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          {/* Bottom gradient fade into card body */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 dark:from-black/20 to-transparent" />
          {/* Wave decoration at bottom */}
          <svg className="absolute bottom-0 left-0 right-0 text-white dark:text-[#1a1a2e]" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '30px', width: '100%' }}>
            <path d="M0,40 C360,80 720,0 1440,40 L1440,60 L0,60 Z" fill="currentColor" opacity="0.5" />
            <path d="M0,48 C480,20 960,70 1440,48 L1440,60 L0,60 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Profile info section */}
        <div className="relative px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20">
            {/* Avatar — Large LinkedIn style */}
            <div className="shrink-0 relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-[5px] border-white dark:border-[#1a1a2e] shadow-2xl object-cover bg-slate-200 ring-2 ring-white/20"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-[5px] border-white dark:border-[#1a1a2e] shadow-2xl bg-gradient-to-br from-prpl via-purple-600 to-indigo-700 text-white text-3xl sm:text-4xl font-bold items-center justify-center select-none ring-2 ring-white/20 ${avatarUrl ? 'hidden' : 'flex'}`}>
                {initials}
              </div>
              {/* Online indicator dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white dark:border-[#1a1a2e] shadow-sm" />
            </div>

            {/* Name + role + meta */}
            <div className="flex-1 min-w-0 pb-1 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">{fullName}</h1>
              {(user.bio || form.bio) && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 max-w-xl">{user.bio || form.bio}</p>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-prpl/10 dark:bg-prpl/20 px-3.5 py-1.5 text-xs font-bold text-prpl border border-prpl/10">
                  <Sparkles className="w-3.5 h-3.5" /> {user.role || 'Member'}
                </span>
                {linkedinStatus?.connected && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a66c2]/10 dark:bg-[#0a66c2]/20 px-3.5 py-1.5 text-xs font-bold text-[#0a66c2] dark:text-[#5bb5f8] border border-[#0a66c2]/10">
                    <Link2 className="w-3.5 h-3.5" /> LinkedIn
                  </span>
                )}
                {(user.location || form.location) && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {user.location || form.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Calendar className="w-3.5 h-3.5" /> Joined {memberSince}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <button type="button" onClick={() => setEditing((v) => !v)}
              className={`btn-magnetic inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all shrink-0 shadow-sm ${
                editing
                  ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                  : 'bg-gradient-to-r from-prpl to-purple-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)]'
              }`}>
              <PencilLine className="h-4 w-4" />
              {editing ? 'Close Editor' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Row ───────────────────── */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <article key={card.label}
            className="group relative overflow-hidden rounded-2xl surface-primary p-5 surface-hover animate-fade-in border border-transparent hover:border-slate-200/50 dark:hover:border-white/[0.06] transition-all"
            style={{ animationDelay: `${(i + 1) * 75}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`} />
            <div className="relative z-10 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md shadow-black/10`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{card.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── Main Grid: Edit + Completion ─── */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Edit Profile Card */}
        <article className="rounded-2xl surface-primary p-6 animate-fade-in border border-slate-100 dark:border-white/[0.04]" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prpl to-purple-600 flex items-center justify-center shadow-sm">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Personal Information</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Update your details below</p>
            </div>
            {editing && (
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <PencilLine className="w-3 h-3" /> Editing
              </span>
            )}
          </div>

          <form className="space-y-4" onSubmit={onSave}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">First name</label>
                <input disabled={!editing || saving} value={form.firstName}
                  onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  className={inputClass} placeholder="John" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Last name</label>
                <input disabled={!editing || saving} value={form.lastName}
                  onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  className={inputClass} placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input disabled={!editing || saving} value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputClass + ' pl-10'} placeholder="john@example.com" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input disabled={!editing || saving} value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  className={inputClass + ' pl-10'} placeholder="e.g., New York, USA" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Bio</label>
              <textarea disabled={!editing || saving} value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-prpl focus:ring-2 focus:ring-prpl/20 resize-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                rows={3} placeholder="Tell us about yourself..." />
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
              <button type="submit" disabled={!editing || saving}
                className="btn-magnetic inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-prpl to-purple-600 px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
              </button>
              <button type="button" disabled={!editing || saving}
                onClick={() => {
                  setForm({ firstName: user.firstName || user.name?.split(' ')[0] || '', lastName: user.lastName || '', email: user.email || '', bio: user.bio || '', location: user.location || '' });
                  setEditing(false);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200/70 dark:border-white/[0.08] px-5 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          </form>
        </article>

        {/* Profile Completion Card */}
        <article className="rounded-2xl surface-primary p-6 animate-fade-in border border-slate-100 dark:border-white/[0.04]" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
              completion === 100
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-amber-500 to-orange-500'
            }`}>
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Profile Strength</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Complete your profile</p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-white/[0.06]" />
                <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" strokeLinecap="round"
                  className={completion === 100 ? 'text-emerald-500' : completion >= 60 ? 'text-amber-500' : 'text-red-500'}
                  style={{ strokeDasharray: `${2 * Math.PI * 24}`, strokeDashoffset: `${2 * Math.PI * 24 * (1 - completion / 100)}`, transition: 'stroke-dashoffset 1s ease-out', stroke: 'currentColor' }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-700 dark:text-white">{completion}%</span>
            </div>
          </div>

          {/* Linear progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] mb-5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                completion === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-prpl to-blue-500'
              }`}
              style={{ width: `${completion}%` }}
            />
          </div>

          {completion < 100 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-3 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-500/5 border border-amber-200/40 dark:border-amber-500/10">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1.5 text-amber-500 -translate-y-px" />
              Complete all items below to unlock your full profile.
            </p>
          )}

          {/* Checklist */}
          <div className="space-y-2">
            {completionChecks.map((check) => (
              <div key={check.label} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
                check.done
                  ? 'bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-200/30 dark:border-emerald-500/10'
                  : 'bg-slate-50/60 dark:bg-white/[0.02] border border-transparent hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  check.done
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200/70 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                }`}>
                  <check.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium flex-1 ${
                  check.done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {check.label}
                </span>
                {check.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-white/10 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ── Account Details ────────────── */}
      <section className="rounded-2xl surface-primary p-6 animate-fade-in border border-slate-100 dark:border-white/[0.04]" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Account Overview</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Your account information at a glance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: User, label: 'Full Name', value: fullName, color: 'from-violet-500 to-purple-600' },
            { icon: Mail, label: 'Email', value: user.email || 'Unknown', color: 'from-blue-500 to-cyan-600' },
            { icon: Shield, label: 'Role', value: user.role || 'Member', color: 'from-emerald-500 to-teal-600' },
            { icon: Calendar, label: 'Member Since', value: memberSince, color: 'from-amber-500 to-orange-500' },
            { icon: MapPin, label: 'Location', value: user.location || form.location || 'Not set', color: 'from-pink-500 to-rose-500' },
            { icon: Link2, label: 'LinkedIn', value: linkedinStatus?.connected ? (linkedinStatus.name || 'Connected') : 'Not connected', color: 'from-blue-600 to-blue-700' },
          ].map((item) => (
            <div key={item.label} className="group flex items-center gap-3.5 rounded-xl p-3.5 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/[0.04]">
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${item.color} shadow-sm`}>
                <item.icon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
