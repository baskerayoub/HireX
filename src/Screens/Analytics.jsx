import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { projectsApi, aiApi } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, ChartTooltip, Legend);

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
    <div className="flex items-end gap-1 h-[60px]">
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

/* ── Line colors for positions ────────────────── */
const LINE_COLORS = [
  '#F472B6',  // pink
  '#38BDF8',  // sky-blue
  '#FBBF24',  // amber/gold
  '#34D399',  // emerald
  '#A78BFA',  // violet
  '#FB923C',  // orange
  '#2DD4BF',  // teal
  '#F87171',  // red
];

/* ── Applications by Position — Line Chart ───── */
function PositionChart({ positionWeekly, weekLabels }) {
  const chartRef = useRef(null);

  const positions = useMemo(() => {
    const data = (positionWeekly || []).map(p => ({
      title: p.title || 'Untitled',
      weekdays: p.data || [0, 0, 0, 0, 0, 0, 0],
      total: (p.data || []).reduce((a, b) => a + b, 0),
    }));
    data.sort((a, b) => b.total - a.total);
    return data;
  }, [positionWeekly]);

  const totalApplications = useMemo(() => positions.reduce((s, p) => s + p.total, 0), [positions]);

  const labels = useMemo(() => weekLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [weekLabels]);

  /* Build Chart.js datasets — one line per position */
  const chartData = useMemo(() => ({
    labels,
    datasets: positions.map((pos, i) => {
      const color = LINE_COLORS[i % LINE_COLORS.length];
      return {
        label: pos.title,
        data: pos.weekdays,
        borderColor: color,
        backgroundColor: color + '18',
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
      };
    }),
  }), [positions, labels]);

  /* Apply gradient fills after chart renders */
  const applyGradients = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    if (!chartArea) return;

    chart.data.datasets.forEach((ds, i) => {
      const color = LINE_COLORS[i % LINE_COLORS.length];
      const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      grad.addColorStop(0, color + '30');
      grad.addColorStop(0.6, color + '08');
      grad.addColorStop(1, color + '00');
      ds.backgroundColor = grad;
    });
    chart.update('none');
  }, [positions]);

  useEffect(() => {
    const timer = setTimeout(applyGradients, 150);
    return () => clearTimeout(timer);
  }, [applyGradients, chartData]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    layout: { padding: { left: 4, right: 8, top: 8, bottom: 4 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)',
        titleFont: { family: 'Inter, system-ui, sans-serif', size: 12, weight: '600' },
        bodyFont: { family: 'Inter, system-ui, sans-serif', size: 11 },
        padding: { x: 14, y: 10 },
        cornerRadius: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (item) => ` ${item.dataset.label}: ${item.raw} application${item.raw !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148,163,184,0.06)', drawTicks: false },
        border: { display: false },
        ticks: {
          font: { family: 'Inter, system-ui, sans-serif', size: 11, weight: '500' },
          color: '#94A3B8',
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148,163,184,0.06)', drawTicks: false },
        border: { display: false },
        ticks: {
          font: { family: 'Inter, system-ui, sans-serif', size: 10, weight: '500' },
          color: '#94A3B8',
          padding: 8,
          stepSize: 1,
        },
      },
    },
  }), []);

  return (
    <div className="rounded-2xl surface-primary p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Applications by Position</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Weekly distribution per position</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-accent/8 dark:bg-accent/15 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-accent" />
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 dark:text-slate-500">No positions created yet</p>
        </div>
      ) : (
        <>
          {/* Color legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            {positions.map((pos, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }}
                />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                  {pos.title}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 260 }}>
            <Line ref={chartRef} data={chartData} options={options} />
          </div>

          <div className="pt-3 mt-1 border-t border-slate-200/40 dark:border-white/[0.04] flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">This week's applications</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              <AnimatedNumber value={totalApplications} />
            </span>
          </div>
        </>
      )}
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
    const funnel = stats?.funnelCounts || {};
    return {
      totalProjects: stats?.totalProjects || 0,
      activeProjects: stats?.activeProjects || 0,
      totalCandidates: tc,
      totalPositions,
      screened: (funnel.selected || 0) + (funnel.validated || 0) + (funnel.hired || 0),
      interviewed: stats?.totalInterviews || 0,
      offered: (funnel.validated || 0) + (funnel.hired || 0),
      hired: funnel.hired || 0,
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
  const funnel = stats?.funnelCounts || {};
  const screened = (funnel.selected || 0) + (funnel.validated || 0) + (funnel.hired || 0);
  const interviewed = stats?.totalInterviews ?? 0;
  const offered = (funnel.validated || 0) + (funnel.hired || 0);
  const hired = funnel.hired || 0;

  const weeklyApplications = stats?.weeklyApplications || [0, 0, 0, 0, 0, 0, 0];
  const weeklyInterviews = stats?.weeklyInterviews || [0, 0, 0, 0, 0, 0, 0];
  const weekLabels = stats?.weekLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

        {/* Applications by Position — Chart.js */}
        <PositionChart
          positionWeekly={stats?.positionWeekly}
          weekLabels={stats?.weekLabels}
        />
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
        {(() => {
          // ── Compute Pipeline Health from real data ──
          const totalInt = stats?.totalInterviews ?? 0;
          const rankedCount = projects.reduce((sum, p) =>
            sum + (p.Profiles || []).reduce((s2, pr) =>
              s2 + (pr.Candidates || []).filter(c => c.score_value != null).length, 0), 0);
          const respondedCount = projects.reduce((sum, p) =>
            sum + (p.Profiles || []).reduce((s2, pr) =>
              s2 + (pr.Candidates || []).filter(c => c.status !== 'received').length, 0), 0);
          const validatedCount = projects.reduce((sum, p) =>
            sum + (p.Profiles || []).reduce((s2, pr) =>
              s2 + (pr.Candidates || []).filter(c => c.status === 'validated').length, 0), 0);

          const responseRate = totalCandidates > 0 ? Math.round((respondedCount / totalCandidates) * 100) : 0;
          const screeningRate = totalCandidates > 0 ? Math.round((rankedCount / totalCandidates) * 100) : 0;
          const interviewRate = totalCandidates > 0 ? Math.round((totalInt / totalCandidates) * 100) : 0;
          const fillRate = totalPositions > 0 ? Math.round((validatedCount / totalPositions) * 100) : 0;

          // Weighted health score
          const healthScore = totalCandidates > 0
            ? Math.min(100, Math.round(responseRate * 0.3 + screeningRate * 0.3 + interviewRate * 0.2 + fillRate * 0.2))
            : 0;
          const healthFraction = healthScore / 100;

          const metrics = [
            { label: 'Response rate', value: `${responseRate}%`, good: responseRate >= 50 },
            { label: 'Screening rate', value: `${screeningRate}%`, good: screeningRate >= 40 },
            { label: 'Interview rate', value: `${interviewRate}%`, good: interviewRate >= 20 },
            { label: 'Fill rate', value: `${fillRate}%`, good: fillRate >= 30 },
          ];

          return (
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
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - healthFraction)}`}
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
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100"><AnimatedNumber value={healthScore} />%</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Health Score</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {metrics.map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className={`text-xs font-semibold ${item.good ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
