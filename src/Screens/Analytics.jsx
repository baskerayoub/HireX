import { useEffect, useState, useRef } from 'react';
import { projectsApi, aiApi } from '../api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  FolderKanban,
  Target,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bot,
  Brain,
  RefreshCw,
  AlertTriangle,
  Search,
  CheckCircle,
  Calendar,
} from 'lucide-react';

/* ── Icon map for dynamic recommendations ───── */
const CATEGORY_ICONS = {
  screening: Zap,
  interviews: Calendar,
  sourcing: Search,
  pipeline: TrendingUp,
  descriptions: Brain,
};
const PRIORITY_COLORS = {
  high: 'from-rose-500 to-red-600',
  medium: 'from-amber-500 to-orange-600',
  low: 'from-blue-500 to-cyan-600',
};

/* ── Animated counter ─────────────────────────── */
function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }
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

/* ── Skeleton ─────────────────────────────────── */
function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

/* ── Mini chart (CSS-only bar chart) ──────────── */
function MiniBarChart({ data, color = 'bg-prpl' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((val, i) => (
        <div
          key={i}
          className={`flex-1 ${color} rounded-sm opacity-60 hover:opacity-100 transition-all duration-300 animate-slide-up`}
          style={{
            height: `${(val / max) * 100}%`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Funnel step ──────────────────────────────── */
function FunnelStep({ label, value, total, color, delay }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{percent}% conversion</p>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [cacheMeta, setCacheMeta] = useState(null); // { cached, generatedAt, expiresAt }
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    Promise.all([
      projectsApi.stats().then(r => r.data.stats).catch(() => null),
      projectsApi.list({ status: 'all' }).then(r => r.data.projects || []).catch(() => []),
    ])
      .then(([s, p]) => { setStats(s); setProjects(p); })
      .finally(() => setLoading(false));
  }, []);

  // Build the analytics payload from current stats
  const buildPayload = () => {
    const totalPositions = projects.reduce((sum, p) => sum + (p.Profiles?.length || 0), 0);
    const tc = stats?.totalCandidates || 0;
    return {
      totalProjects: stats?.totalProjects || 0,
      activeProjects: stats?.activeProjects || 0,
      totalCandidates: tc,
      totalPositions,
      screened: Math.round(tc * 0.72),
      interviewed: Math.round(tc * 0.35),
      offered: Math.round(tc * 0.15),
      hired: Math.round(tc * 0.08),
    };
  };

  // Fetch recommendations — uses cache by default, force=true bypasses cache
  const fetchRecommendations = async (force = false) => {
    if (!stats) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await aiApi.recommendations(buildPayload(), force);
      setRecommendations(res.data?.recommendations || []);
      setCacheMeta({
        cached: res.data?.cached ?? false,
        generatedAt: res.data?.generatedAt,
        expiresAt: res.data?.expiresAt,
      });
    } catch (err) {
      console.error('AI recommendations error:', err);
      setAiError(err.response?.data?.error || 'Failed to get AI recommendations');
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-fetch once when stats load (will use cache if available)
  useEffect(() => {
    if (stats && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchRecommendations(false);
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl surface-primary p-5">
              <Skeleton className="h-10 w-10 rounded-xl mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl surface-primary p-6">
            <Skeleton className="h-5 w-32 mb-6" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="rounded-2xl surface-primary p-6">
            <Skeleton className="h-5 w-32 mb-6" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const totalCandidates = stats?.totalCandidates ?? 0;
  const totalProjects = stats?.totalProjects ?? 0;
  const activeProjects = stats?.activeProjects ?? 0;
  const totalPositions = projects.reduce((sum, p) => sum + (p.Profiles?.length || 0), 0);

  const applied = totalCandidates;
  const screened = Math.round(totalCandidates * 0.72);
  const interviewed = Math.round(totalCandidates * 0.35);
  const offered = Math.round(totalCandidates * 0.15);
  const hired = Math.round(totalCandidates * 0.08);

  const weeklyApplications = [3, 5, 2, 8, 4, 7, 6];
  const weeklyInterviews = [1, 2, 1, 3, 2, 4, 2];

  const metricCards = [
    {
      label: 'Total Candidates',
      value: totalCandidates,
      icon: Users,
      trend: '+24%',
      trendUp: true,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/8 to-teal-500/8 dark:from-emerald-500/12 dark:to-teal-500/12',
    },
    {
      label: 'Open Positions',
      value: totalPositions,
      icon: Briefcase,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/8 to-cyan-500/8 dark:from-blue-500/12 dark:to-cyan-500/12',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: FolderKanban,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-500/8 to-purple-500/8 dark:from-violet-500/12 dark:to-purple-500/12',
    },
    {
      label: 'Avg. Time to Hire',
      value: 18,
      suffix: 'd',
      icon: Clock,
      trend: '-15%',
      trendUp: false,
      isGood: true,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/8 to-orange-500/8 dark:from-amber-500/12 dark:to-orange-500/12',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hiring performance, pipeline health, and predictive insights.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, i) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl surface-primary p-5 surface-hover animate-fade-in"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-40`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-current/10`}>
                  <card.icon className="w-[18px] h-[18px] text-white" />
                </div>
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  (card.trendUp && !card.isGood) || (!card.trendUp && card.isGood)
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : card.trendUp
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                      : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                }`}>
                  {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.trend}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                <AnimatedNumber value={card.value} />{card.suffix || ''}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring funnel */}
        <div className="rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Hiring Funnel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Candidate conversion pipeline</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-prpl/8 dark:bg-prpl/15 flex items-center justify-center">
              <Target className="w-4 h-4 text-prpl" />
            </div>
          </div>
          <div className="space-y-5">
            <FunnelStep label="Applied" value={applied} total={applied} color="bg-gradient-to-r from-blue-500 to-blue-400" delay={400} />
            <FunnelStep label="Screened" value={screened} total={applied} color="bg-gradient-to-r from-cyan-500 to-cyan-400" delay={500} />
            <FunnelStep label="Interviewed" value={interviewed} total={applied} color="bg-gradient-to-r from-violet-500 to-violet-400" delay={600} />
            <FunnelStep label="Offered" value={offered} total={applied} color="bg-gradient-to-r from-amber-500 to-amber-400" delay={700} />
            <FunnelStep label="Hired" value={hired} total={applied} color="bg-gradient-to-r from-emerald-500 to-emerald-400" delay={800} />
          </div>
        </div>

        {/* Weekly activity */}
        <div className="rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Weekly Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Applications & interviews this week</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-accent/8 dark:bg-accent/15 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-prpl" />
                  Applications
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {weeklyApplications.reduce((a, b) => a + b, 0)} total
                </span>
              </div>
              <MiniBarChart data={weeklyApplications} color="bg-prpl" />
              <div className="flex justify-between mt-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-[9px] text-slate-400 dark:text-slate-500 flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Interviews
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {weeklyInterviews.reduce((a, b) => a + b, 0)} total
                </span>
              </div>
              <MiniBarChart data={weeklyInterviews} color="bg-accent" />
              <div className="flex justify-between mt-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-[9px] text-slate-400 dark:text-slate-500 flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations — Cached + Smart */}
        <div className="lg:col-span-2 rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-prpl/10 dark:bg-prpl/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-prpl" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Recommendations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cacheMeta?.cached
                    ? <><CheckCircle className="w-3 h-3 inline text-emerald-500 mr-1" />Cached · generated {new Date(cacheMeta.generatedAt).toLocaleString()}</>
                    : 'Powered by OpenAI · data-driven insights'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cacheMeta?.cached && (
                <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Cached
                </span>
              )}
              <button
                onClick={() => fetchRecommendations(true)}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-prpl bg-prpl/8 dark:bg-prpl/15 rounded-lg hover:bg-prpl/15 dark:hover:bg-prpl/25 transition disabled:opacity-50"
                title="Force regenerate from OpenAI (ignores cache)"
              >
                <RefreshCw className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiLoading ? 'Analyzing...' : 'Regenerate AI Insights'}
              </button>
            </div>
          </div>

          {cacheMeta?.expiresAt && !aiLoading && (
            <div className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {cacheMeta.cached ? 'Loaded from cache' : 'Freshly generated'} · Expires {new Date(cacheMeta.expiresAt).toLocaleString()}
              </span>
            </div>
          )}

          {aiError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">{aiError}</p>
            </div>
          )}

          <div className="space-y-3">
            {aiLoading && !recommendations.length ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl p-3">
                  <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : recommendations.length > 0 ? (
              recommendations.map((tip, i) => {
                const IconComp = CATEGORY_ICONS[tip.category] || Sparkles;
                const colorGrad = PRIORITY_COLORS[tip.priority] || 'from-violet-500 to-purple-600';
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorGrad} flex items-center justify-center shrink-0 shadow-sm`}>
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tip.title}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          tip.priority === 'high' ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400' :
                          tip.priority === 'medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' :
                          'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400'
                        }`}>{tip.priority}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                );
              })
            ) : !aiLoading && !aiError ? (
              <div className="text-center py-6">
                <Bot className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500">No recommendations yet. Click "Regenerate AI Insights" to generate.</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Performance score */}
        <div className="rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-5">Pipeline Health</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100 dark:text-slate-800" />
                <circle
                  cx="60" cy="60" r="52"
                  stroke="url(#scoreGradient)" strokeWidth="8" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.78)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">78%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Health Score</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Response rate', value: '92%', good: true },
              { label: 'Fill rate', value: '45%', good: false },
              { label: 'Candidate satisfaction', value: '88%', good: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className={`text-xs font-semibold ${item.good ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
