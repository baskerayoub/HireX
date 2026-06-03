import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { meetingsApi, candidatesApi } from '../api';
import Modal from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import {
  CalendarDays, Clock, User, Video, Mail, Search,
  Filter, ChevronLeft, ChevronRight, Timer, ArrowUpRight,
  X, CheckCircle2, AlertCircle, Loader2, Eye, LayoutGrid,
  List, CalendarCheck2, XCircle, Play, BarChart3, Trash2,
} from 'lucide-react';

/* ── Countdown timer ──────────────────────────── */
function CountdownTimer({ targetDate }) {
  const [remaining, setRemaining] = useState('');
  const [urgency, setUrgency] = useState('normal'); // normal | soon | now

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setRemaining('Now'); setUrgency('now'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) { setRemaining(`${days}d ${hours}h`); setUrgency('normal'); }
      else if (hours > 0) { setRemaining(`${hours}h ${mins}m`); setUrgency(hours <= 2 ? 'soon' : 'normal'); }
      else { setRemaining(`${mins}m`); setUrgency('soon'); }
    };
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, [targetDate]);

  const colors = {
    normal: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50',
    soon: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    now: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[urgency]}`}>
      <Timer className="w-3 h-3" />
      {remaining}
    </span>
  );
}

/* ── Calendar Grid ────────────────────────────── */
function CalendarGrid({ meetings, selectedDate, onSelectDate, currentMonth, onChangeMonth }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build meetings map: date string -> count
  const meetingsByDay = useMemo(() => {
    const map = {};
    meetings.forEach((m) => {
      const d = new Date(m.start_date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [meetings]);

  const days = [];
  // Padding for first row
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="rounded-2xl surface-primary p-5">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {monthName}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeMonth(-1)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeMonth(1)}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          if (day === null) return <div key={`pad-${idx}`} />;
          const dateObj = new Date(year, month, day);
          const key = `${year}-${month}-${day}`;
          const count = meetingsByDay[key] || 0;
          const isToday = dateObj.getTime() === today.getTime();
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === day;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateObj)}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-lg text-sm transition-all ${
                isSelected
                  ? 'bg-prpl text-white font-bold shadow-[0_2px_8px_rgba(124,58,237,0.3)]'
                  : isToday
                  ? 'bg-prpl/8 dark:bg-prpl/15 text-prpl font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {day}
              {count > 0 && (
                <div className={`absolute bottom-0.5 flex gap-0.5 ${isSelected ? '' : ''}`}>
                  {[...Array(Math.min(count, 3))].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white/80' : 'bg-prpl'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Interview Card ───────────────────────────── */
function InterviewCard({ mtg, onCancel, onDelete, onHire, index = 0 }) {
  const now = new Date();
  const isFuture = new Date(mtg.start_date) > now;
  const isPast = new Date(mtg.end_date) < now;
  const isLive = new Date(mtg.start_date) <= now && new Date(mtg.end_date) >= now;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Date-based left border: green = reached/past, yellow = upcoming, red = cancelled
  const borderColor = mtg.status === 'Cancelled'
    ? 'border-l-red-500'
    : (isPast || isLive)
      ? 'border-l-emerald-500'
      : 'border-l-amber-400';

  const isHired = mtg.Candidate?.status === 'hired';

  return (
    <div
      className={`rounded-2xl surface-primary p-5 surface-hover animate-fade-in group border-l-[3px] ${borderColor} ${isLive ? 'ring-1 ring-emerald-500/30 dark:ring-emerald-400/20' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight text-sm">
              {mtg.subject || 'Interview'}
            </h3>
            <StatusBadge status={mtg.status} />
            {isHired && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" /> HIRED
              </span>
            )}
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Play className="w-2.5 h-2.5" /> LIVE
              </span>
            )}
            {isFuture && mtg.status !== 'Cancelled' && (
              <CountdownTimer targetDate={mtg.start_date} />
            )}
            {/* Date status indicator */}
            {mtg.status !== 'Cancelled' && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                (isPast || isLive)
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {isPast ? 'Completed' : isLive ? 'In Progress' : 'Upcoming'}
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-6 h-6 rounded-md bg-prpl/8 dark:bg-prpl/15 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-prpl" />
              </div>
              <span className="truncate text-xs">{mtg.Candidate?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-6 h-6 rounded-md bg-blue-500/8 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                <CalendarDays className="w-3 h-3 text-blue-500" />
              </div>
              <span className="text-xs">{formatDate(mtg.start_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-6 h-6 rounded-md bg-amber-500/8 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                <Clock className="w-3 h-3 text-amber-500" />
              </div>
              <span className="text-xs">
                {formatTime(mtg.start_date)} – {formatTime(mtg.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <div className="w-6 h-6 rounded-md bg-emerald-500/8 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Video className="w-3 h-3 text-emerald-500" />
              </div>
              <span className="text-xs">{mtg.platform || 'Not set'}</span>
            </div>
          </div>

          {/* Recruiter info */}
          {mtg.User && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5">
              Scheduled by {mtg.User.firstName} {mtg.User.lastName}
            </p>
          )}

          {/* Email status */}
          {mtg.status_message && (
            <p className={`text-[11px] mt-2 flex items-center gap-1.5 ${
                mtg.status_message.includes('failed') ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
              <Mail className="w-3 h-3" />
              {mtg.status_message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Hire button — show on past/live interviews for non-hired candidates */}
          {(isPast || isLive) && mtg.status !== 'Cancelled' && !isHired && mtg.Candidate?.id && (
            <button
              onClick={() => onHire?.(mtg.Candidate)}
              className="btn-magnetic p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
              title="Hire candidate"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          {mtg.link && (
            <a href={mtg.link} target="_blank" rel="noopener noreferrer"
              className="btn-magnetic p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
              title="Join meeting">
              <Video className="w-4 h-4" />
            </a>
          )}
          {mtg.status !== 'Cancelled' && isFuture && (
            <button onClick={() => onCancel?.(mtg.id)}
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-500 transition"
              title="Cancel interview">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete?.(mtg.id)}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition"
            title="Delete interview">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stats Card ───────────────────────────────── */
function StatCard({ icon: Icon, label, value, gradient, delay = 0 }) {
  return (
    <div
      className="rounded-2xl surface-primary p-4 animate-fade-in relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30`} />
      <div className="relative z-10 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-50 leading-none">
            {value}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Interviews Hub ──────────────────────── */
export default function InterviewsHub() {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list | timeline
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedInterview, setSelectedInterview] = useState(null);

  const load = async () => {
    try {
      const res = await meetingsApi.listAll();
      const all = (res.data.meetings || []).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      setAllMeetings(all);
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    const ok = await confirm({ title: 'Cancel Interview', message: 'Cancel this interview? Would you like to send a cancellation email to the candidate?', confirmText: 'Cancel & Send Email', cancelText: 'Cancel Without Email', variant: 'warning' });
    if (ok === false) return;
    // ok === true means send email
    try {
      await meetingsApi.cancel(id, true);
      toast.success('Interview cancelled — email sent');
      load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel interview');
    }
  };

  const handleDelete = async (id) => {
    const sendEmail = await confirm({
      title: 'Delete Interview',
      message: 'Delete this interview permanently? Do you want to send a cancellation email to the candidate?',
      confirmText: 'Delete & Send Email',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (sendEmail === false) {
      // User clicked cancel — ask if they want to delete without email
      const deleteOnly = await confirm({
        title: 'Delete Without Email?',
        message: 'Delete this interview without notifying the candidate?',
        confirmText: 'Delete Without Email',
        variant: 'danger',
      });
      if (!deleteOnly) return;
      try {
        await meetingsApi.delete(id, false);
        toast.success('Interview deleted');
        load();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete interview');
      }
      return;
    }
    try {
      await meetingsApi.delete(id, true);
      toast.success('Interview deleted — cancellation email sent');
      load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete interview');
    }
  };

  const handleChangeMonth = (delta) => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  const handleHire = async (candidate) => {
    const ok = await confirm({
      title: 'Hire Candidate',
      message: `Hire "${candidate.name || 'this candidate'}"? This will mark them as hired and complete all associated interviews.`,
      confirmText: 'Confirm Hire',
      variant: 'info',
    });
    if (!ok) return;
    try {
      await candidatesApi.hire(candidate.id);
      toast.success(`${candidate.name || 'Candidate'} has been hired! 🎉`);
      load();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to hire candidate');
    }
  };

  // Derived data
  const now = new Date();
  const upcoming = allMeetings.filter(
    (m) => new Date(m.start_date) > now && m.status !== 'Cancelled'
  );
  const completed = allMeetings.filter(
    (m) => new Date(m.end_date) < now && m.status !== 'Cancelled'
  );
  const cancelled = allMeetings.filter((m) => m.status === 'Cancelled');
  const todayMeetings = allMeetings.filter((m) => {
    const d = new Date(m.start_date);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      m.status !== 'Cancelled'
    );
  });

  // Filtered list
  const filtered = useMemo(() => {
    return allMeetings.filter((m) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchName = m.Candidate?.name?.toLowerCase().includes(q);
        const matchSubject = m.subject?.toLowerCase().includes(q);
        const matchEmail = m.Candidate?.email?.toLowerCase().includes(q);
        if (!matchName && !matchSubject && !matchEmail) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      // Type filter
      if (typeFilter === 'upcoming') return new Date(m.start_date) > now && m.status !== 'Cancelled';
      if (typeFilter === 'past') return new Date(m.end_date) < now;
      if (typeFilter === 'today') {
        const d = new Date(m.start_date);
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      // Date filter
      if (selectedDate) {
        const d = new Date(m.start_date);
        if (
          d.getDate() !== selectedDate.getDate() ||
          d.getMonth() !== selectedDate.getMonth() ||
          d.getFullYear() !== selectedDate.getFullYear()
        )
          return false;
      }
      return true;
    });
  }, [allMeetings, search, statusFilter, typeFilter, selectedDate]);

  if (loading) return <LoadingSpinner text="Loading interviews..." />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Interviews
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {allMeetings.length} total · Your central interview management hub
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-white/10 text-prpl shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-white/10 text-prpl shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title="Calendar view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={CalendarDays} label="Total" value={allMeetings.length} gradient="from-prpl to-purple-600" delay={0} />
        <StatCard icon={CalendarCheck2} label="Upcoming" value={upcoming.length} gradient="from-blue-500 to-cyan-600" delay={75} />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} gradient="from-emerald-500 to-teal-600" delay={150} />
        <StatCard icon={Clock} label="Today" value={todayMeetings.length} gradient="from-amber-500 to-orange-500" delay={225} />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Quick filters */}
        <div className="flex items-center gap-1.5">
          {[
            { label: 'All', value: 'all' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Today', value: 'today' },
            { label: 'Past', value: 'past' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setSelectedDate(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === f.value
                  ? 'bg-prpl/10 dark:bg-prpl/20 text-prpl font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Created">Scheduled</option>
          <option value="Updated">Updated</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {selectedDate && (
          <button
            onClick={() => { setSelectedDate(null); setTypeFilter('all'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/15"
          >
            <CalendarDays className="w-3 h-3" />
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main content layout */}
      <div className={`grid gap-6 ${viewMode === 'timeline' ? 'grid-cols-1 lg:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>
        {/* Interviews list */}
        <div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={search || statusFilter !== 'all' || typeFilter !== 'all' || selectedDate ? 'No matching interviews' : 'No interviews yet'}
              description={
                search || statusFilter !== 'all' || typeFilter !== 'all' || selectedDate
                  ? 'Try adjusting your filters or search query.'
                  : 'Schedule interviews from the Candidates page in any project.'
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((mtg, i) => (
                <InterviewCard
                  key={mtg.id}
                  mtg={mtg}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onHire={handleHire}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Calendar sidebar (timeline view) */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            <CalendarGrid
              meetings={allMeetings}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setTypeFilter('all');
              }}
              currentMonth={currentMonth}
              onChangeMonth={handleChangeMonth}
            />

            {/* Today's agenda */}
            {todayMeetings.length > 0 && (
              <div className="rounded-2xl surface-primary p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Today's Agenda
                </h3>
                <div className="space-y-2.5">
                  {todayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition"
                    >
                      <div className="w-1 h-8 rounded-full bg-prpl shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {m.subject || 'Interview'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {new Date(m.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          {m.Candidate?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {ConfirmDialog}
    </>
  );
}
