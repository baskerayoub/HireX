import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi, profilesApi } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import {
  Briefcase, Plus, Search, MapPin, Users, Building2, ArrowRight, GraduationCap, ArrowUpRight, Trash2, PowerOff, Power,
} from 'lucide-react';

export default function AllPositions() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    projectId: '', title: '', location: '', typeContract: 'Full-time',
    yearsOfExperience: '', education: '', technicalSkills: '', description: '', mainMissions: '',
  });
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const loadProjects = () => {
    setLoading(true);
    projectsApi
      .list({ status: 'all' })
      .then(res => setProjects(res.data.projects || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const allPositions = useMemo(() => {
    const list = [];
    projects.forEach(project => {
      (project.Profiles || []).forEach(profile => {
        list.push({
          ...profile, projectId: project.id, projectTitle: project.title,
          projectStatus: project.status, candidatesCount: profile.Candidates?.length || 0,
        });
      });
    });
    return list;
  }, [projects]);

  const filtered = useMemo(() => {
    if (!search) return allPositions;
    const q = search.toLowerCase();
    return allPositions.filter(
      p => (p.title || '').toLowerCase().includes(q) ||
        (p.projectTitle || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q),
    );
  }, [allPositions, search]);

  // Only allow creating positions in active projects
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'Active'), [projects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.projectId || !form.title.trim()) return;
    setCreating(true);
    try {
      const { projectId, ...payload } = form;
      await profilesApi.create(projectId, payload);
      setShowCreate(false);
      setForm({ projectId: '', title: '', location: '', typeContract: 'Full-time', yearsOfExperience: '', education: '', technicalSkills: '', description: '', mainMissions: '' });
      loadProjects();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create position');
    } finally { setCreating(false); }
  };

  const handleDeletePosition = async (positionId, title) => {
    const ok = await confirm({
      title: 'Delete Position',
      message: `Delete "${title || 'Untitled'}"? This will remove the position and all associated data. This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await profilesApi.delete(positionId);
      toast.success('Position deleted');
      loadProjects();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to delete position');
    }
  };

  if (loading) return <LoadingSpinner text="Loading positions..." />;

  const inputClass = "w-full h-11 px-4 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Positions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All open positions across your recruitment projects.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={activeProjects.length === 0}
          className="btn-magnetic inline-flex items-center gap-2 bg-gradient-to-r from-prpl to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={activeProjects.length === 0 ? 'You need at least one active project to create a position' : ''}
        >
          <Plus className="w-4 h-4" /> New Position
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-in" style={{ animationDelay: '75ms' }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input type="text" placeholder="Search positions, projects, locations..." value={search}
          onChange={e => setSearch(e.target.value)} className={`${inputClass} !pl-11`} />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        projects.length === 0 ? (
          <EmptyState icon={Briefcase} title="No projects yet" description="You need to create a project first before adding positions."
            action={<Link to="/projects" className="btn-magnetic inline-flex items-center gap-2 bg-prpl text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.3)]">Create Project <ArrowRight className="w-4 h-4" /></Link>} />
        ) : (
          <EmptyState icon={Briefcase} title={search ? 'No positions found' : 'No positions yet'}
            description={search ? 'Try a different search query.' : 'Add your first position to start receiving applications.'}
            action={!search && <button onClick={() => setShowCreate(true)} className="btn-magnetic inline-flex items-center gap-2 bg-prpl text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.3)]"><Plus className="w-4 h-4" /> Create Position</button>} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((position, i) => {
            const isProjectInactive = position.projectStatus === 'Inactive';
            return (
              <div key={position.id} className={`rounded-2xl surface-primary p-5 surface-hover group animate-fade-in ${isProjectInactive ? 'opacity-60 grayscale-[30%]' : ''}`} style={{ animationDelay: `${(i + 2) * 60}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${isProjectInactive ? 'from-slate-400/10 to-slate-500/10 dark:from-slate-400/15 dark:to-slate-500/15 text-slate-400' : 'from-blue-500/10 to-cyan-500/10 dark:from-blue-500/15 dark:to-cyan-500/15 text-blue-500'}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                      isProjectInactive
                        ? 'bg-amber-500/8 dark:bg-amber-500/12 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/8 dark:bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {isProjectInactive ? 'Inactive' : (position.typeContract || 'Full-time')}
                    </span>
                    <button
                      onClick={() => handleDeletePosition(position.id, position.title)}
                      title="Delete position"
                      className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate mb-1 group-hover:text-prpl transition">{position.title}</h3>
                <p className="text-xs text-prpl font-semibold mb-3 truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 shrink-0" /> {position.projectTitle}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {position.description || 'No description provided yet.'}
                </p>

                {/* Inactive banner */}
                {isProjectInactive && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/15">
                    <PowerOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      Project is inactive — position disabled
                    </p>
                  </div>
                )}

                <div className="space-y-1.5 mb-4">
                  {position.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{position.location}</span>
                    </div>
                  )}
                  {position.education && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{position.education}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{position.candidatesCount} candidate{position.candidatesCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isProjectInactive ? (
                    <>
                      <button disabled className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-400 dark:text-slate-600 text-sm font-semibold cursor-not-allowed">
                        Candidates
                      </button>
                      <button disabled className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-400 dark:text-slate-600 text-sm font-semibold cursor-not-allowed border border-slate-200/50 dark:border-white/[0.04]">
                        Publish
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to={`/projects/${position.projectId}/candidates`}
                        className="btn-magnetic flex-1 text-center py-2.5 rounded-xl bg-prpl/8 dark:bg-prpl/12 text-prpl text-sm font-semibold hover:bg-prpl/15 dark:hover:bg-prpl/20 transition">
                        Candidates
                      </Link>
                      <Link to={`/projects/${position.projectId}/publication`}
                        className="btn-magnetic flex-1 text-center py-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] transition border border-slate-200/50 dark:border-white/[0.04]">
                        Publish
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Position" size="lg">
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project <span className="text-red-500">*</span></label>
              <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className={inputClass} required>
                <option value="">Select an active project</option>
                {activeProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              {activeProjects.length === 0 && projects.length > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">No active projects. Activate a project first.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Position Title <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g., Senior Frontend Engineer" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="e.g., Remote / Berlin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contract Type</label>
              <select value={form.typeContract} onChange={e => setForm({ ...form, typeContract: e.target.value })} className={inputClass}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Years of Experience</label>
              <input type="number" value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })} className={inputClass} placeholder="e.g., 3" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Education</label>
              <input type="text" value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className={inputClass} placeholder="e.g., Bachelor's in CS" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Technical Skills</label>
            <input type="text" value={form.technicalSkills} onChange={e => setForm({ ...form, technicalSkills: e.target.value })} className={inputClass} placeholder="e.g., React, TypeScript, Node.js" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Brief overview of the position..." />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl transition">Cancel</button>
            <button type="submit" disabled={creating} className="btn-magnetic px-5 py-2.5 bg-gradient-to-r from-prpl to-purple-600 text-white text-sm font-semibold rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.3)] disabled:opacity-50 transition-all">
              {creating ? 'Creating...' : 'Create Position'}
            </button>
          </div>
        </form>
      </Modal>
      {ConfirmDialog}
    </>
  );
}
