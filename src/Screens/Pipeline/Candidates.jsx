import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { candidatesApi, profilesApi, aiApi, meetingsApi } from '../../api';
import Modal from '../../components/ui/Modal';
import EmailPreview from '../../components/ui/EmailPreview';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressRing from '../../components/ui/ProgressRing';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { Users, Search, Plus, Brain, Eye, Sparkles, Download, FileText, Mail, Phone, MapPin, Briefcase, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, CalendarDays, Loader2, Shield, TrendingUp, Zap, ListChecks, Trash2 } from 'lucide-react';

export default function Candidates() {
  const { projectId } = useParams();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [candidates, setCandidates] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ title: '', description: '', technicalSkills: '', yearsOfExperience: '', education: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiLoading, setAiLoading] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [rankingResult, setRankingResult] = useState(null);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankAllLoading, setRankAllLoading] = useState(false);
  const [rankingInline, setRankingInline] = useState({});
  const [scoreFilter, setScoreFilter] = useState('all');

  // Schedule Interview state
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleStep, setScheduleStep] = useState('form'); // form | preview
  const [scheduling, setScheduling] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    type: 'Interview', subject: '', start_date: '', end_date: '',
    platform: 'Google Meet', link: '', content: '',
  });

  const load = async () => {
    try {
      const [candRes, profRes] = await Promise.all([
        candidatesApi.listByProject(projectId),
        profilesApi.listByProject(projectId),
      ]);
      setCandidates(candRes.data.candidates || []);
      setProfiles(profRes.data.profiles || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const data = { ...profileForm, skills: profileForm.technicalSkills.split(',').map(s => s.trim()).filter(Boolean) };
      await profilesApi.create(projectId, data);
      setShowAddProfile(false);
      setProfileForm({ title: '', description: '', technicalSkills: '', yearsOfExperience: '', education: '', location: '' });
      load();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const handleRankCV = async (candidateId) => {
    setRankingLoading(true);
    try {
      const res = await aiApi.rankCV(candidateId);
      setRankingResult(res.data);
      load(); // refresh table scores
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to rank CV'); }
    finally { setRankingLoading(false); }
  };

  const handleRankAll = async () => {
    if (rankAllLoading) return;
    const unranked = candidates.filter(c => !c.is_ranked && c.cv_s3_path && c.cv_s3_path !== 'no-cv');
    if (unranked.length === 0) {
      toast.info('All candidates with CVs are already ranked!');
      return;
    }
    const ok = await confirm({ title: 'Rank All Candidates', message: `This will rank ${unranked.length} unranked candidate(s) using AI. Continue?`, confirmText: 'Rank All', variant: 'warning' });
    if (!ok) return;
    setRankAllLoading(true);
    try {
      const res = await aiApi.rankAll(projectId);
      const { totalRanked, totalSkipped, totalFailed } = res.data;
      load(); // refresh table
      toast.success(`Rank complete — ${totalRanked} ranked, ${totalSkipped || 0} skipped, ${totalFailed || 0} failed`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to rank candidates');
    } finally {
      setRankAllLoading(false);
    }
  };

  const handleRankInline = async (candidateId) => {
    setRankingInline(prev => ({ ...prev, [candidateId]: true }));
    try {
      await aiApi.rankCV(candidateId);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to rank CV');
    } finally {
      setRankingInline(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  const handleDelete = async (candidateId, name) => {
    const ok = await confirm({ title: 'Delete Candidate', message: `Delete "${name || 'Unknown'}"? This action cannot be undone.`, confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    try {
      await candidatesApi.delete(candidateId);
      toast.success('Candidate deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete candidate');
    }
  };

  const showCandidateInfo = async (candidateId) => {
    setDetailsLoading(true);
    setSelectedCandidate(null);
    setRankingResult(null);
    try {
      const res = await candidatesApi.getById(candidateId);
      const cand = res.data.candidate;
      setSelectedCandidate(cand);
      // Load cached ranking if exists
      if (cand.ai_response_cache) {
        try { setRankingResult({ ranking: JSON.parse(cand.ai_response_cache), cached: true }); } catch {}
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load candidate information');
    } finally {
      setDetailsLoading(false);
    }
  };

  const downloadCandidateCv = async (candidate) => {
    try {
      const res = await candidatesApi.downloadCv(candidate.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = candidate.cv_s3_path || `${candidate.name || 'candidate'}-cv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to download CV');
    }
  };

  const parseList = (value) => String(value || '').split(',').map(item => item.trim()).filter(Boolean);

  const parseExperiences = (value) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [{ description: value }];
    }
  };



  const handleStatusChange = async (id, newStatus) => {
    try { await candidatesApi.updateStatus(id, newStatus); load(); }
    catch (err) { console.error(err); }
  };

  // Schedule interview
  const openSchedule = (candidate) => {
    setScheduleTarget(candidate);
    setScheduleStep('form');
    setScheduleForm({
      type: 'Interview', subject: `Interview - ${candidate.name || 'Candidate'}`,
      start_date: '', end_date: '', platform: 'Google Meet', link: '', content: '',
    });
  };

  const goToPreview = () => {
    if (!scheduleForm.start_date || !scheduleForm.end_date || !scheduleForm.content) return;
    setScheduleStep('preview');
  };

  const handleScheduleSend = async (finalNotes) => {
    if (!scheduleTarget) return;
    setScheduling(true);
    try {
      await meetingsApi.create({
        fk_candidate: scheduleTarget.id,
        ...scheduleForm,
        content: finalNotes || scheduleForm.content,
      });
      setScheduleTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    let matchScore = true;
    if (scoreFilter !== 'all') {
      const score = c.score_value;
      if (scoreFilter === 'none') matchScore = score == null;
      else if (scoreFilter === '80+') matchScore = score != null && score >= 80;
      else if (scoreFilter === '60+') matchScore = score != null && score >= 60;
      else if (scoreFilter === '40+') matchScore = score != null && score >= 40;
      else if (scoreFilter === '<40') matchScore = score != null && score < 40;
    }
    return matchSearch && matchStatus && matchScore;
  });

  if (loading) return <LoadingSpinner text="Loading candidates..." />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Candidates</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{candidates.length} total · {profiles.length} position(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRankAll} disabled={rankAllLoading || candidates.length === 0}
            className="btn-magnetic inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {rankAllLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ranking...</> : <><ListChecks className="w-4 h-4" /> Rank All</>}
          </button>
          <button onClick={() => setShowAddProfile(true)}
            className="btn-magnetic inline-flex items-center gap-2 bg-gradient-to-r from-prpl to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] text-sm">
            <Plus className="w-4 h-4" /> Add Position
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: '75ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer">
          <option value="all">All Status</option>
          <option value="received">Received</option>
          <option value="selected">Selected</option>
          <option value="validated">Validated</option>
          <option value="Declined">Declined</option>
        </select>
        <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}
          className="h-11 px-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer">
          <option value="all">All Scores</option>
          <option value="80+">Score ≥ 80</option>
          <option value="60+">Score ≥ 60</option>
          <option value="40+">Score ≥ 40</option>
          <option value="<40">Score &lt; 40</option>
          <option value="none">Not Ranked</option>
        </select>
      </div>

      {/* Profiles overview */}
      {profiles.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {profiles.map(p => (
            <div key={p.id} className="shrink-0 rounded-xl surface-primary px-4 py-3 min-w-[200px]">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{p.title}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{p.Candidates?.length || 0} candidates</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {p.technicalSkills?.split(',').slice(0, 3).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-prpl/8 dark:bg-prpl/15 text-prpl text-[10px] font-medium rounded-full">{s.trim()}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidates Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No candidates yet" description="Share the apply link to start receiving applications." />
      ) : (
        <div className="rounded-2xl surface-primary overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-white/[0.04]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Candidate</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Position</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">AI Score</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.03]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition group">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-prpl transition">{c.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{c.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{c.Profile?.title || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 outline-none focus:border-prpl cursor-pointer">
                      <option value="received">Received</option>
                      <option value="selected">Selected</option>
                      <option value="validated">Validated</option>
                      <option value="Declined">Declined</option>
                      <option value="discarded">Discarded</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {c.score_value != null ? (
                      <ProgressRing value={c.score_value} size={40} strokeWidth={3} showValue={true} label="" className="" />
                    ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.cv_s3_path && c.cv_s3_path !== 'no-cv' && (
                        <button onClick={() => handleRankInline(c.id)} disabled={rankingInline[c.id]}
                          className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-prpl hover:bg-prpl/8 dark:hover:bg-prpl/12 transition disabled:opacity-50" title="Rank with AI">
                          {rankingInline[c.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                      )}
                      <button onClick={() => openSchedule(c)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-500/8 dark:hover:bg-emerald-500/12 transition" title="Schedule Interview">
                        <CalendarDays className="w-4 h-4" />
                      </button>
                      <button onClick={() => showCandidateInfo(c.id)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-500/8 dark:hover:bg-blue-500/12 transition" title="View & Rank">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/8 dark:hover:bg-red-500/12 transition" title="Delete Candidate">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply link */}
      {profiles.length > 0 && (
        <div className="mt-6 rounded-2xl surface-primary p-5 border-l-2 border-prpl">
          <p className="text-sm font-semibold text-prpl mb-1 flex items-center gap-2">📎 Public Apply Link</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Share this link with candidates:</p>
          <code className="block mt-2 text-xs bg-slate-50/80 dark:bg-white/[0.03] px-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/[0.06] text-slate-700 dark:text-slate-200 select-all">
            {window.location.origin}/apply/{profiles[0].id}
          </code>
        </div>
      )}

      {/* Candidate information */}
      <Modal
        isOpen={detailsLoading || !!selectedCandidate}
        onClose={() => { setSelectedCandidate(null); setDetailsLoading(false); }}
        title="Candidate Information"
        subtitle={selectedCandidate ? (selectedCandidate.Profile?.title || 'Candidate details') : ''}
        icon={Eye}
        size="xl"
      >
        {detailsLoading ? (
          <LoadingSpinner text="Loading candidate information..." />
        ) : selectedCandidate && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{selectedCandidate.name || 'Unknown candidate'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedCandidate.Profile?.title || 'No position'}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedCandidate.status} />
                {selectedCandidate.score_value != null && (
                  <span className="px-3 py-1 rounded-full bg-prpl/8 text-prpl text-xs font-bold">
                    AI Score {selectedCandidate.score_value}/100
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] p-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Contact</h4>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {selectedCandidate.email || 'No email'}</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selectedCandidate.phone || 'No phone'}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selectedCandidate.location || 'No location'}</p>
                  <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {selectedCandidate.current_position || 'No current position'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] p-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">CV</h4>
                {selectedCandidate.cv_s3_path && selectedCandidate.cv_s3_path !== 'no-cv' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{selectedCandidate.cv_s3_path}</span>
                    </div>
                    <button
                      onClick={() => downloadCandidateCv(selectedCandidate)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white/10 text-white text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white/15 transition"
                    >
                      <Download className="w-4 h-4" /> Download CV
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No CV uploaded</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] p-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Profile Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Education</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedCandidate.education || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Experience</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedCandidate.years_of_experience ?? 'Not provided'} years</p>
                </div>
              </div>

              {selectedCandidate.summary && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Summary</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedCandidate.summary}</p>
                </div>
              )}
            </div>

            {[
              ['Technical Skills', parseList(selectedCandidate.technical_skills)],
              ['Soft Skills', parseList(selectedCandidate.soft_skills)],
              ['Languages', parseList(selectedCandidate.languages)],
              ['Certifications', parseList(selectedCandidate.certifications)],
              ['Hobbies', parseList(selectedCandidate.hobbies)],
            ].some(([, items]) => items.length > 0) && (
              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] p-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Skills & Extras</h4>
                <div className="space-y-3">
                  {[
                    ['Technical Skills', parseList(selectedCandidate.technical_skills)],
                    ['Soft Skills', parseList(selectedCandidate.soft_skills)],
                    ['Languages', parseList(selectedCandidate.languages)],
                    ['Certifications', parseList(selectedCandidate.certifications)],
                    ['Hobbies', parseList(selectedCandidate.hobbies)],
                  ].map(([label, items]) => items.length > 0 && (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase text-slate-400 mb-2">{label}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, index) => (
                          <span key={`${label}-${index}`} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-xs font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parseExperiences(selectedCandidate.experiences).length > 0 && (
              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] p-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Experiences</h4>
                <div className="space-y-3">
                  {parseExperiences(selectedCandidate.experiences).map((exp, index) => (
                    <div key={index} className="border-l-2 border-prpl/20 pl-3">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{exp.title || 'Experience'} {exp.company ? `at ${exp.company}` : ''}</p>
                      {exp.duration && <p className="text-xs text-slate-400 mt-0.5">{exp.duration}</p>}
                      {exp.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Dynamic AI Ranking Panel ── */}
            <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] p-5 bg-gradient-to-br from-slate-50/80 to-purple-50/30 dark:from-white/[0.02] dark:to-prpl/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-prpl" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Analysis & Ranking</h4>
                </div>
                {(!rankingResult || rankingResult.cached) && selectedCandidate.cv_s3_path && selectedCandidate.cv_s3_path !== 'no-cv' && (
                  <button onClick={() => handleRankCV(selectedCandidate.id)} disabled={rankingLoading}
                    className="btn-magnetic inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-prpl to-purple-600 text-white text-xs font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.25)] disabled:opacity-50 transition-all">
                    {rankingLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-3.5 h-3.5" /> {rankingResult ? 'Re-rank' : 'Rank with AI'}</>}
                  </button>
                )}
              </div>

              {rankingLoading && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="relative"><div className="w-14 h-14 rounded-full border-3 border-prpl/20 border-t-prpl animate-spin" /></div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">AI is analyzing the CV...</p>
                </div>
              )}

              {!rankingLoading && !rankingResult && (
                <div className="text-center py-8">
                  <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Click <strong>"Rank with AI"</strong> to analyze this CV</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">One-time analysis · Results are cached</p>
                </div>
              )}

              {!rankingLoading && rankingResult?.ranking && (() => {
                const r = rankingResult.ranking;
                const scoreColor = r.score >= 70 ? 'text-emerald-500' : r.score >= 40 ? 'text-amber-500' : 'text-rose-500';
                const scoreBg = r.score >= 70 ? 'from-emerald-500' : r.score >= 40 ? 'from-amber-500' : 'from-rose-500';
                const recColor = r.recommendation === 'hire' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : r.recommendation === 'consider' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                const RecIcon = r.recommendation === 'hire' ? ThumbsUp : r.recommendation === 'consider' ? TrendingUp : ThumbsDown;
                return (
                  <div className="space-y-4">
                    {/* Score + Match + Recommendation row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] p-4 text-center">
                        <div className="mx-auto mb-2 flex justify-center">
                          <ProgressRing value={r.score} size={64} strokeWidth={4} label="" />
                        </div>
                        <p className="text-[10px] font-semibold uppercase text-slate-400">AI Score</p>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] p-4 text-center">
                        <p className={`text-3xl font-bold bg-gradient-to-r ${scoreBg} to-blue-500 bg-clip-text text-transparent mt-3`}>{r.matchPercent}%</p>
                        <p className="text-[10px] font-semibold uppercase text-slate-400 mt-2">Job Match</p>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] p-4 text-center flex flex-col items-center justify-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${recColor}`}>
                          <RecIcon className="w-3.5 h-3.5" /> {(r.recommendation || '').toUpperCase()}
                        </div>
                        <p className="text-[10px] font-semibold uppercase text-slate-400 mt-2">Recommendation</p>
                      </div>
                    </div>

                    {/* Summary */}
                    {r.summary && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-white/[0.03] rounded-xl p-4 border border-slate-200/50 dark:border-white/[0.06] italic">"{r.summary}"</p>}

                    {/* Strengths + Weaknesses */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-emerald-200/50 dark:border-emerald-500/10 p-4">
                        <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Strengths</p>
                        <ul className="space-y-1.5">{(r.strengths||[]).map((s,i) => <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />{s}</li>)}</ul>
                      </div>
                      <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-rose-200/50 dark:border-rose-500/10 p-4">
                        <p className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Weaknesses</p>
                        <ul className="space-y-1.5">{(r.weaknesses||[]).map((w,i) => <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />{w}</li>)}</ul>
                      </div>
                    </div>

                    {/* Detailed eval */}
                    <div className="grid grid-cols-3 gap-3">
                      {[['Technical Fit', r.technicalFit, Zap, 'text-blue-500'], ['Experience', r.experienceEval, Shield, 'text-amber-500'], ['Communication', r.communicationQuality, TrendingUp, 'text-emerald-500']].map(([label, val, Icon, color]) => val && (
                        <div key={label} className="rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06] p-3">
                          <p className={`text-[10px] font-bold uppercase ${color} mb-1.5 flex items-center gap-1`}><Icon className="w-3 h-3" /> {label}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Seniority badge */}
                    {r.seniorityLevel && <p className="text-center"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-prpl/8 text-prpl text-xs font-bold"><Shield className="w-3 h-3" /> {r.seniorityLevel.charAt(0).toUpperCase() + r.seniorityLevel.slice(1)} Level</span></p>}

                    {rankingResult.cached && <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">Cached result · Click "Re-rank" to refresh</p>}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Position Modal */}
      <Modal isOpen={showAddProfile} onClose={() => setShowAddProfile(false)} title="Add Job Position" size="lg">
        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Position Title *</label>
              <input type="text" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" placeholder="e.g., Full Stack Developer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" placeholder="e.g., Remote" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={profileForm.description} onChange={e => setProfileForm({...profileForm, description: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Technical Skills (comma-separated)</label>
              <input type="text" value={profileForm.technicalSkills} onChange={e => setProfileForm({...profileForm, technicalSkills: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
              <input type="number" value={profileForm.yearsOfExperience} onChange={e => setProfileForm({...profileForm, yearsOfExperience: e.target.value})}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" min="0" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddProfile(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2 bg-prpl text-white text-sm font-semibold rounded-lg hover:bg-prpl/90 disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Position'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal — two-step flow */}
      <Modal
        isOpen={!!scheduleTarget}
        onClose={() => setScheduleTarget(null)}
        title={scheduleStep === 'form' ? 'Schedule Interview' : 'Preview Email'}
        subtitle={scheduleTarget ? `${scheduleTarget.name || 'Candidate'} · ${scheduleTarget.Profile?.title || 'Position'}` : ''}
        icon={CalendarDays}
        iconColor="text-emerald-500"
        iconBg="bg-emerald-500/10 dark:bg-emerald-500/20"
        size="lg"
      >
        {scheduleStep === 'form' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                <input type="text" value={scheduleForm.subject}
                  onChange={e => setScheduleForm({...scheduleForm, subject: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                  placeholder="e.g., Technical Round 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                <select value={scheduleForm.type}
                  onChange={e => setScheduleForm({...scheduleForm, type: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition">
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
                <input type="datetime-local" value={scheduleForm.start_date}
                  onChange={e => setScheduleForm({...scheduleForm, start_date: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                  required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End *</label>
                <input type="datetime-local" value={scheduleForm.end_date}
                  onChange={e => setScheduleForm({...scheduleForm, end_date: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                  required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Platform</label>
                <select value={scheduleForm.platform}
                  onChange={e => setScheduleForm({...scheduleForm, platform: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition">
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="In-Person">In-Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Meeting Link</label>
                <input type="url" value={scheduleForm.link}
                  onChange={e => setScheduleForm({...scheduleForm, link: e.target.value})}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
                  placeholder="https://meet.google.com/..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes / Message *</label>
              <textarea value={scheduleForm.content}
                onChange={e => setScheduleForm({...scheduleForm, content: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 resize-none transition"
                rows={3} placeholder="Interview details, topics to cover..." required />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setScheduleTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl transition">
                Cancel
              </button>
              <button onClick={goToPreview}
                disabled={!scheduleForm.start_date || !scheduleForm.end_date || !scheduleForm.content}
                className="btn-magnetic px-5 py-2.5 bg-gradient-to-r from-prpl to-purple-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.3)] disabled:opacity-50 transition-all">
                Preview Email →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setScheduleStep('form')}
              className="text-xs font-medium text-prpl hover:text-prpl/80 transition flex items-center gap-1 mb-2">
              ← Back to form
            </button>
            <EmailPreview
              candidateName={scheduleTarget?.name || 'Candidate'}
              jobTitle={scheduleTarget?.Profile?.title || 'Position'}
              date={scheduleForm.start_date}
              startTime={scheduleForm.start_date ? new Date(scheduleForm.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
              endTime={scheduleForm.end_date ? new Date(scheduleForm.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
              platform={scheduleForm.platform}
              meetingLink={scheduleForm.link}
              interviewerName="HR Team"
              notes={scheduleForm.content}
              onSend={handleScheduleSend}
              sending={scheduling}
            />
          </div>
        )}
      </Modal>
      {ConfirmDialog}
    </>
  );
}
