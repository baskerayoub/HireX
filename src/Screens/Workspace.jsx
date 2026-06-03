import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsApi } from '../api';
import {
  Sparkles,
  FileText,
  Brain,
  Share2,
  ArrowRight,
  ArrowUpRight,
  FolderKanban,
  Users,
  Briefcase,
  Plus,
  Megaphone,
  CalendarCheck2,
  FileCheck2,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Target,
  BarChart3,
  Bot,
} from 'lucide-react';

/* ── Animated counter ─────────────────────────── */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span>{display}</span>;
}

/* ── Skeleton loader ──────────────────────────── */
function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl surface-primary p-5 ${className}`}>
      <div className="shimmer h-10 w-10 rounded-xl mb-4" />
      <div className="shimmer h-8 w-20 rounded-lg mb-2" />
      <div className="shimmer h-4 w-28 rounded-md" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-2xl surface-primary p-5 flex items-center gap-4">
      <div className="shimmer h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1">
        <div className="shimmer h-4 w-40 rounded-md mb-2" />
        <div className="shimmer h-3 w-24 rounded-md" />
      </div>
      <div className="shimmer h-4 w-16 rounded-md" />
    </div>
  );
}

function formatTrend(trend = {}) {
  const current = Number(trend.current) || 0;
  const previous = Number(trend.previous) || 0;
  const diff = current - previous;

  if (previous === 0) {
    return {
      label: current > 0 ? `+${current}` : '0%',
      trendUp: diff >= 0,
    };
  }

  const percent = Math.round((diff / previous) * 100);
  return {
    label: `${percent > 0 ? '+' : ''}${percent}%`,
    trendUp: percent >= 0,
  };
}

/* AI Features data */
const aiFeatures = [
  {
    icon: FileText,
    title: 'Generate Job Description',
    description: 'Create compelling, AI-written job descriptions in seconds.',
    gradient: 'from-violet-500/10 to-purple-500/10 dark:from-violet-500/15 dark:to-purple-500/15',
    iconColor: 'text-violet-500',
    link: '/posts',
  },
  {
    icon: Brain,
    title: 'Parse & Score CVs',
    description: 'Extract key information and score candidates against the role.',
    gradient: 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/15 dark:to-cyan-500/15',
    iconColor: 'text-blue-500',
    link: '/candidates',
  },
  {
    icon: Share2,
    title: 'Publish to LinkedIn',
    description: 'Share job postings to LinkedIn with a single click.',
    gradient: 'from-sky-500/10 to-blue-500/10 dark:from-sky-500/15 dark:to-blue-500/15',
    iconColor: 'text-sky-500',
    link: '/posts',
  },
];

/* ── Quick actions data ───────────────────────── */
const quickActions = [
  { label: 'New Project', to: '/projects', icon: FolderKanban, gradient: 'from-violet-500 to-purple-600' },
  { label: 'New Position', to: '/positions', icon: Briefcase, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Create Post', to: '/posts', icon: Megaphone, gradient: 'from-amber-500 to-orange-600' },
  { label: 'AI Assistant', to: '/ai-assistant', icon: Bot, gradient: 'from-emerald-500 to-teal-600' },
];

export default function Workspace() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.firstName || user?.name?.trim()?.split(' ')[0] || 'there';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    Promise.all([
      projectsApi.stats().then(r => r.data.stats).catch(() => null),
      projectsApi.list({ status: 'all' }).then(r => r.data.projects || []).catch(() => []),
    ])
      .then(([s, p]) => {
        setStats(s);
        setProjects(p);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-8">
          <div className="shimmer h-4 w-44 rounded-md mb-3" />
          <div className="shimmer h-10 w-80 rounded-lg mb-2" />
          <div className="shimmer h-4 w-56 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </>
    );
  }

  const projectTrend = formatTrend(stats?.trends?.totalProjects);
  const activeTrend = formatTrend(stats?.trends?.activeProjects);
  const candidateTrend = formatTrend(stats?.trends?.totalCandidates);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      trend: projectTrend.label,
      trendUp: projectTrend.trendUp,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/8 to-purple-500/8 dark:from-violet-500/12 dark:to-purple-500/12',
    },
    {
      label: 'Active Hiring',
      value: stats?.activeProjects ?? 0,
      icon: Target,
      trend: activeTrend.label,
      trendUp: activeTrend.trendUp,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/8 to-cyan-500/8 dark:from-blue-500/12 dark:to-cyan-500/12',
    },
    {
      label: 'Total Candidates',
      value: stats?.totalCandidates ?? 0,
      icon: Users,
      trend: candidateTrend.label,
      trendUp: candidateTrend.trendUp,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/8 to-teal-500/8 dark:from-emerald-500/12 dark:to-teal-500/12',
    },
  ];

  const recentProjects = projects.slice(0, 4);

  return (
    <>
      {/* Hero greeting section */}
      <div className="mb-10 animate-fade-in">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 mb-2">
          {dateStr}
        </p>
        <h1 className="text-[2rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
          {greeting},{' '}
          <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-lg">
          Your AI-powered recruitment workspace — manage projects, evaluate candidates, and hire smarter.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map((s, i) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden rounded-2xl surface-primary p-4 surface-hover animate-fade-in"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shrink-0 shadow-lg shadow-current/5`}>
                <s.icon className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-prpl transition truncate">
                  {s.label}
                </p>
              </div>
            </div>
            <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-prpl transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      {/* Stats row — premium animated cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl surface-primary p-6 surface-hover animate-fade-in"
            style={{ animationDelay: `${(i + 4) * 75}ms` }}
          >
            {/* Background gradient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-current/10`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'}`}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-[2rem] font-bold text-slate-900 dark:text-slate-50 leading-none tracking-tight">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#161a26] via-[#1B2030] to-[#0F1115]" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-prpl/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-accent/15 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-prpl/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-prpl" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-prpl">AI Insights</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Your hiring pipeline is performing well
              </h3>
              <p className="text-white/50 text-sm max-w-md leading-relaxed">
                {stats?.totalCandidates > 0
                  ? `You have ${stats.totalCandidates} candidates across ${stats.totalProjects || 0} projects. AI is ready to help you rank and evaluate them.`
                  : 'Start adding candidates to get AI-powered insights about your hiring pipeline.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/ai-assistant"
                className="btn-magnetic shrink-0 inline-flex items-center gap-2 bg-prpl text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-[0_4px_16px_rgba(124,58,237,0.4)]"
              >
                <Bot className="w-4 h-4" /> Ask AI
              </Link>
              <Link
                to="/analytics"
                className="btn-magnetic shrink-0 inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/15 transition backdrop-blur border border-white/10"
              >
                <BarChart3 className="w-4 h-4" /> Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-prpl" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            AI Capabilities
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiFeatures.map((feature, i) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group relative overflow-hidden rounded-2xl surface-primary p-6 surface-hover animate-fade-in"
              style={{ animationDelay: `${(i + 7) * 75}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-80 transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-11 h-11 rounded-xl bg-white dark:bg-white/10 ${feature.iconColor} flex items-center justify-center mb-4 shadow-sm`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-prpl transition">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-prpl font-semibold">
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Active Projects
            </h2>
            <Link to="/projects" className="text-xs font-semibold text-prpl hover:text-prpl/80 transition flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="rounded-2xl surface-primary p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-prpl/10 to-accent/10 dark:from-prpl/15 dark:to-accent/15 text-prpl flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">No projects yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 max-w-xs mx-auto">
                Create your first recruitment project and start building your hiring pipeline.
              </p>
              <Link to="/projects" className="btn-magnetic inline-flex items-center gap-2 bg-prpl text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.3)]">
                <Plus className="w-3.5 h-3.5" /> Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentProjects.map((p, i) => {
                const candidates = p.Profiles?.reduce((s, pr) => s + (pr.Candidates?.length || 0), 0) || 0;
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}/candidates`}
                    className="group rounded-2xl surface-primary p-5 surface-hover animate-fade-in"
                    style={{ animationDelay: `${(i + 10) * 75}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-prpl/10 to-purple-500/10 dark:from-prpl/15 dark:to-purple-500/15 text-prpl">
                        <FolderKanban className="w-4 h-4" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-prpl transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-prpl transition mb-1">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {p.Profiles?.length || 0} positions · {candidates} candidates
                    </p>
                    {/* Mini progress bar */}
                    <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-prpl to-accent transition-all duration-700"
                        style={{ width: `${Math.min(100, ((candidates / Math.max(1, (stats?.totalCandidates || 1))) * 100))}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity / What's new */}
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-5">
            What's New
          </h2>
          <div className="rounded-2xl surface-primary p-5 space-y-4">
            {[
              { icon: FileCheck2, title: 'CV Parsing', desc: 'Extract candidate info instantly with AI.', color: 'from-emerald-500 to-teal-600' },
              { icon: CalendarCheck2, title: 'Schedule Interviews', desc: 'Coordinate with candidates seamlessly.', color: 'from-blue-500 to-cyan-600' },
              { icon: Share2, title: 'LinkedIn OAuth', desc: 'Publish posts directly to your feed.', color: 'from-violet-500 to-purple-600' },
            ].map((item, i) => (
              <div key={item.title} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${(i + 13) * 75}ms` }}>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recruiter tip */}
          <div className="mt-4 rounded-2xl surface-primary p-5 border-l-2 border-prpl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-prpl" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-prpl">Pro Tip</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use the <strong className="text-prpl">AI Assistant</strong> to quickly find the best matching candidates for your open positions. Just ask naturally!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl animate-fade-in" style={{ animationDelay: '1000ms' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-prpl via-purple-600 to-violet-700 animate-gradient" />
        <div className="absolute inset-0 noise" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 p-6 lg:p-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight">
              Start a new recruitment project
            </h3>
            <p className="text-white/50 text-sm max-w-md">
              Create positions, generate AI job descriptions, and start hiring the best talent.
            </p>
          </div>
          <Link
            to="/projects"
            className="btn-magnetic shrink-0 inline-flex items-center gap-2 bg-white text-prpl font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition text-sm shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>
    </>
  );
}
