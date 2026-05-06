import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { meetingsApi, candidatesApi } from '../../api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { CalendarDays, Plus, Clock, User, Video, MapPin, Mail, X } from 'lucide-react';

export default function Interviews() {
  const { projectId } = useParams();
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
    } catch (err) { alert(err.response?.data?.error || 'Failed to create interview'); }
    finally { setCreating(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this interview?')) return;
    try { await meetingsApi.cancel(id); load(); }
    catch (err) { console.error(err); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <LoadingSpinner text="Loading interviews..." />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interviews</h1>
          <p className="text-slate-500 text-sm mt-1">{meetings.length} scheduled</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-prpl text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition text-sm">
          <Plus className="w-4 h-4" /> Schedule Interview
        </button>
      </div>

      {meetings.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No interviews scheduled" description="Schedule your first interview with a candidate."
          action={<button onClick={() => setShowCreate(true)} className="bg-prpl text-white px-4 py-2 rounded-xl text-sm font-semibold">Schedule Interview</button>} />
      ) : (
        <div className="space-y-4">
          {meetings.map((mtg) => (
            <div key={mtg.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{mtg.subject || 'Interview'}</h3>
                    <StatusBadge status={mtg.status} />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="w-4 h-4 text-prpl" />
                      <span>{mtg.Candidate?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span>{formatDate(mtg.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{formatTime(mtg.start_date)} – {formatTime(mtg.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Video className="w-4 h-4 text-emerald-500" />
                      <span>{mtg.platform || 'Not set'}</span>
                    </div>
                  </div>

                  {mtg.content && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">{mtg.content}</p>
                  )}

                  {mtg.status_message && (
                    <p className={`text-xs mt-2 ${mtg.status_message.includes('failed') ? 'text-red-500' : 'text-emerald-600'}`}>
                      📧 {mtg.status_message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {mtg.link && (
                    <a href={mtg.link} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                      <Video className="w-4 h-4" />
                    </a>
                  )}
                  {mtg.status !== 'Cancelled' && (
                    <button onClick={() => handleCancel(mtg.id)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Interview Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Interview" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Candidate *</label>
            <select value={form.fk_candidate} onChange={e => setForm({...form, fk_candidate: e.target.value})}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" required>
              <option value="">Select a candidate</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.email || `Candidate #${c.id}`}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" placeholder="e.g., Technical Interview Round 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl">
                <option value="Interview">Interview</option>
                <option value="Technical Test">Technical Test</option>
                <option value="HR Screen">HR Screen</option>
                <option value="Final Round">Final Round</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date & Time *</label>
              <input type="datetime-local" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date & Time *</label>
              <input type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
              <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl">
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link</label>
              <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" placeholder="https://meet.google.com/..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Description *</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl resize-none" rows={3}
              placeholder="Interview details, topics to cover..." required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Other Participants (emails, comma-separated)</label>
            <input type="text" value={form.other_participants} onChange={e => setForm({...form, other_participants: e.target.value})}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" placeholder="colleague@company.com" />
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
            <Mail className="w-4 h-4 shrink-0 mt-0.5" />
            <p>An email invitation will be automatically sent to the candidate if they have an email address on file.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2 bg-prpl text-white text-sm font-semibold rounded-lg hover:bg-prpl/90 disabled:opacity-50">
              {creating ? 'Scheduling...' : 'Schedule & Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
