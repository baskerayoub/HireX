import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, candidatesApi, aiApi } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import ProgressRing from '../components/ui/ProgressRing';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import { Search, Filter, Users, ArrowRight, Mail, Briefcase, Sparkles, Trash2, Eye, Loader2, CalendarDays } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';

export default function AllCandidates() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [rankingInline, setRankingInline] = useState({});
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const loadData = () => {
    projectsApi
      .list({ status: 'all' })
      .then(res => setProjects(res.data.projects || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const allCandidates = useMemo(() => {
    const list = [];
    projects.forEach(project => {
      (project.Profiles || []).forEach(profile => {
        (profile.Candidates || []).forEach(candidate => {
          list.push({
            ...candidate,
            projectId: project.id,
            projectTitle: project.title,
            profileId: profile.id,
            profileTitle: profile.title,
          });
        });
      });
    });
    return list;
  }, [projects]);

  const filtered = useMemo(() => {
    return allCandidates.filter(c => {
      if (projectFilter !== 'all' && c.projectId !== Number(projectFilter)) return false;
      if (statusFilter !== 'all' && (c.status || 'received') !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${c.name || ''} ${c.email || ''} ${c.profileTitle || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (scoreFilter !== 'all') {
        const score = c.score_value;
        if (scoreFilter === 'none' && score != null) return false;
        if (scoreFilter === '80+' && (score == null || score < 80)) return false;
        if (scoreFilter === '60+' && (score == null || score < 60)) return false;
        if (scoreFilter === '40+' && (score == null || score < 40)) return false;
        if (scoreFilter === '<40' && (score == null || score >= 40)) return false;
      }
      return true;
    });
  }, [allCandidates, search, statusFilter, projectFilter, scoreFilter]);

  const stats = useMemo(() => {
    const g = { all: allCandidates.length, received: 0, selected: 0, validated: 0, Declined: 0 };
    allCandidates.forEach(c => { const s = c.status || 'received'; if (g[s] != null) g[s]++; });
    return g;
  }, [allCandidates]);

  const handleStatusChange = async (id, newStatus) => {
    try { await candidatesApi.updateStatus(id, newStatus); loadData(); }
    catch (err) { console.error(err); }
  };

  const handleRankInline = async (candidateId) => {
    setRankingInline(prev => ({ ...prev, [candidateId]: true }));
    try { await aiApi.rankCV(candidateId); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to rank CV'); }
    finally { setRankingInline(prev => ({ ...prev, [candidateId]: false })); }
  };

  const handleDelete = async (candidateId, name) => {
    const ok = await confirm({ title: 'Delete Candidate', message: `Delete "${name || 'Unknown'}"? This action cannot be undone.`, confirmText: 'Delete', variant: 'danger' });
    if (!ok) return;
    try { await candidatesApi.delete(candidateId); toast.success('Candidate deleted'); loadData(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to delete candidate'); }
  };

  if (loading) return <LoadingSpinner text="Loading candidates..." />;

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Candidates</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage every candidate across all your recruitment projects.</p>
        </div>
        <span className="px-3 py-1.5 bg-prpl/8 dark:bg-prpl/12 text-prpl text-xs font-bold rounded-full">
          {allCandidates.length} total
        </span>
      </div>

      {/* Stat tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 animate-fade-in" style={{ animationDelay: '75ms' }}>
        {[
          { key: 'all', label: 'All', count: stats.all },
          { key: 'received', label: 'Received', count: stats.received },
          { key: 'selected', label: 'Selected', count: stats.selected },
          { key: 'validated', label: 'Validated', count: stats.validated },
          { key: 'Declined', label: 'Declined', count: stats.Declined },
        ].map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`text-left px-4 py-3.5 rounded-xl border transition-all ${statusFilter === s.key
              ? 'surface-primary border-prpl/20 dark:border-prpl/15 shadow-sm'
              : 'surface-primary border-transparent hover:border-slate-200/50 dark:hover:border-white/[0.04]'
            }`}>
            <p className="text-[1.4rem] font-bold leading-none text-slate-900 dark:text-slate-100">{s.count}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input type="text" placeholder="Search by name, email, or position..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition placeholder:text-slate-400 dark:placeholder:text-slate-500" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
            className="h-11 pl-10 pr-8 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer">
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)}
          className="h-11 px-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer">
          <option value="all">All Scores</option>
          <option value="80+">Score ≥ 80</option>
          <option value="60+">Score ≥ 60</option>
          <option value="40+">Score ≥ 40</option>
          <option value="<40">Score &lt; 40</option>
          <option value="none">Not Ranked</option>
        </select>
      </div>

      {/* Candidates table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users}
          title={search ? 'No candidates found' : 'No candidates yet'}
          description={search ? 'Try a different search or adjust the filters.' : 'Candidates will appear here as people apply through your published positions.'}
          action={!search && (
            <Link to="/projects" className="btn-magnetic inline-flex items-center gap-2 bg-prpl text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.3)]">
              Go to Projects <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        />
      ) : (
        <div className="rounded-2xl surface-primary overflow-hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-white/[0.04]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Candidate</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Position</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Project</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">AI Score</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-white/[0.03]">
              {filtered.map((c, idx) => (
                <tr key={`${c.id}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={c.name || 'NA'} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-prpl transition">{c.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                          <Mail className="w-3 h-3 shrink-0" /> {c.email || 'no email'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{c.profileTitle || '—'}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 shrink-0" /> {c.current_position || c.currentPosition || 'Not specified'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/projects/${c.projectId}/candidates`} className="text-xs text-prpl hover:underline font-medium">{c.projectTitle}</Link>
                  </td>
                  <td className="px-5 py-4">
                    <select value={c.status || 'received'} onChange={(e) => handleStatusChange(c.id, e.target.value)}
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
                      <Link to={`/projects/${c.projectId}/candidates`}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-500/8 dark:hover:bg-blue-500/12 transition" title="View in Project">
                        <Eye className="w-4 h-4" />
                      </Link>
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
      {ConfirmDialog}
    </>
  );
}
