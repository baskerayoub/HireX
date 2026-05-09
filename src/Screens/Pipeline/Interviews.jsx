import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { meetingsApi, candidatesApi } from '../../api';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  CalendarDays, Plus, Clock, User, Video, Mail, X, MapPin,
  ArrowUpRight, Sparkles, Timer,
} from 'lucide-react';

/* ── Countdown timer ──────────────────────────── */
function CountdownTimer({ targetDate }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setRemaining('Started'); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setRemaining(`${days}d ${hours}h`);
      else if (hours > 0) setRemaining(`${hours}h ${mins}m`);
      else setRemaining(`${mins}m`);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [targetDate]);

  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
      <Timer className="w-3 h-3" />
      {remaining}
    </span>
  );
}

export default function Interviews() {
  const { projectId } = useParams();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [meetings, setMeetings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fk_candidate: '', type: 'Interview', subject: '',
    content: '', start_date: '', end_date: '',
    other_participants: '', platform: 'Google Meet', link: '',
  });

  const load = async () => {
    try {
      const [mtgRes, candRes] = await Promise.all([
        meetingsApi.listByProject(projectId),
        candidatesApi.listByProject(projectId),
      ]);
      setMeetings(mtgRes.data.meetings || []);
      setCandidates(candRes.data.candidates || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.fk_candidate || !form.start_date || !form.end_date || !form.content) return;
    setCreating(true);
    try {
      await meetingsApi.create(form);
      setShowCreate(false);
      setForm({ fk_candidate: '', type: 'Interview', subject: '', content: '', start_date: '', end_date: '', other_participants: '', platform: 'Google Meet', link: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create interview'); }
    finally { setCreating(false); }
  };

  const handleCancel = async (id) => {
    const ok = await confirm({ title: 'Cancel Interview', message: 'Cancel this interview? The candidate will be notified.', confirmText: 'Cancel Interview', variant: 'warning' });
    if (!ok) return;
    try { await meetingsApi.cancel(id); toast.success('Interview cancelled'); load(); }
    catch (err) { console.error(err); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <LoadingSpinner text="Loading interviews..." />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Interviews</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {meetings.length} scheduled · Manage your interview pipeline
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-magnetic inline-flex items-center gap-2 bg-gradient-to-r from-prpl to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] text-sm"
        >
          <Plus className="w-4 h-4" /> Schedule Interview
        </button>
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No interviews scheduled"
          description="Schedule your first interview with a candidate to get started."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="btn-magnetic inline-flex items-center gap-2 bg-prpl text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-4 h-4" /> Schedule Interview
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {meetings.map((mtg, i) => {
            const isFuture = new Date(mtg.start_date) > new Date();
            return (
              <div
                key={mtg.id}
                className="rounded-2xl surface-primary p-5 surface-hover animate-fade-in group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                        {mtg.subject || 'Interview'}
                      </h3>
                      <StatusBadge status={mtg.status} />
                      {isFuture && mtg.status !== 'Cancelled' && (
                        <CountdownTimer targetDate={mtg.start_date} />
                      )}
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                        <div className="w-7 h-7 rounded-lg bg-prpl/8 dark:bg-prpl/15 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-prpl" />
                        </div>
                        <span className="truncate">{mtg.Candidate?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/8 dark:bg-blue-500/15 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span>{formatDate(mtg.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/8 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span>{formatTime(mtg.start_date)} – {formatTime(mtg.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/8 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <Video className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span>{mtg.platform || 'Not set'}</span>
                      </div>
                    </div>

                    {mtg.content && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">{mtg.content}</p>
                    )}

                    {mtg.status_message && (
                      <p className={`text-xs mt-3 flex items-center gap-1.5 ${mtg.status_message.includes('failed') ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <Mail className="w-3 h-3" />
                        {mtg.status_message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {mtg.link && (
                      <a
                        href={mtg.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-magnetic p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                      >
                        <Video className="w-4 h-4" />
                      </a>
                    )}
                    {mtg.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleCancel(mtg.id)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Interview Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Interview" size="lg">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Candidate *</label>
            <select
              value={form.fk_candidate}
              onChange={e => setForm({...form, fk_candidate: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
              required
            >
              <option value="">Select a candidate</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.email || `Candidate #${c.id}`}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                placeholder="e.g., Technical Round 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
              >
                <option value="Interview">Interview</option>
                <option value="Technical Test">Technical Test</option>
                <option value="HR Screen">HR Screen</option>
                <option value="Final Round">Final Round</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start *</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={e => setForm({...form, start_date: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End *</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={e => setForm({...form, end_date: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Platform</label>
              <select
                value={form.platform}
                onChange={e => setForm({...form, platform: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Meeting Link</label>
              <input
                type="url"
                value={form.link}
                onChange={e => setForm({...form, link: e.target.value})}
                className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes *</label>
            <textarea
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 resize-none transition"
              rows={3}
              placeholder="Interview details, topics to cover..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Other Participants</label>
            <input
              type="text"
              value={form.other_participants}
              onChange={e => setForm({...form, other_participants: e.target.value})}
              className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
              placeholder="colleague@company.com, another@company.com"
            />
          </div>

          {/* Info notice */}
          <div className="rounded-xl bg-blue-50/80 dark:bg-blue-500/8 border border-blue-200/50 dark:border-blue-500/10 p-3.5 flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              An email invitation will be automatically sent to the candidate if they have an email address on file.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-magnetic px-5 py-2.5 bg-gradient-to-r from-prpl to-purple-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.3)] disabled:opacity-50 transition-all"
            >
              {creating ? 'Scheduling...' : 'Schedule & Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
      {ConfirmDialog}
    </>
  );
}
