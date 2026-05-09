import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { FolderKanban, Plus, Search, Users, Briefcase, Trash2, ArrowUpRight, Power, PowerOff } from 'lucide-react';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', department: '' });
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const loadProjects = async () => {
    try {
      const res = await projectsApi.list({ search, status: 'all' });
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await projectsApi.create(form);
      setShowCreate(false);
      setForm({ title: '', description: '', department: '' });
      loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleArchive = async (id) => {
    const ok = await confirm({ title: 'Delete Project', message: 'Delete this project? It will be moved out of active projects.', confirmText: 'Delete', variant: 'warning' });
    if (!ok) return;
    try {
      await projectsApi.archive(id);
      toast.success('Project Deleted');
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (proj) => {
    const isActive = proj.status === 'Active';
    const ok = await confirm({
      title: isActive ? 'Deactivate Project' : 'Activate Project',
      message: isActive
        ? 'Deactivating this project will disable all its links, positions, and prevent new candidate applications. Continue?'
        : 'Reactivate this project? All links and positions will become functional again.',
      confirmText: isActive ? 'Deactivate' : 'Activate',
      variant: isActive ? 'warning' : 'info',
    });
    if (!ok) return;
    try {
      await projectsApi.toggleStatus(proj.id);
      toast.success(isActive ? 'Project deactivated' : 'Project activated');
      loadProjects();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle project status');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your recruitment projects
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-magnetic inline-flex items-center gap-2 bg-gradient-to-r from-prpl to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] text-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first recruitment project to start sourcing candidates."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="btn-magnetic inline-flex items-center gap-2 bg-prpl text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-4 h-4" /> Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj, i) => {
            const candidateCount =
              proj.Profiles?.reduce((sum, p) => sum + (p.Candidates?.length || 0), 0) || 0;
            const isInactive = proj.status === 'Inactive';
            return (
              <div
                key={proj.id}
                className={`rounded-2xl surface-primary p-5 surface-hover group animate-fade-in ${isInactive ? 'opacity-60 grayscale-[30%]' : ''}`}
                style={{ animationDelay: `${(i + 2) * 60}ms` }}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${isInactive ? 'from-slate-400/10 to-slate-500/10 dark:from-slate-400/15 dark:to-slate-500/15 text-slate-400' : 'from-prpl/10 to-purple-500/10 dark:from-prpl/15 dark:to-purple-500/15 text-prpl'}`}>
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={proj.status || 'Active'} />
                    <button
                      onClick={() => handleToggleStatus(proj)}
                      title={isInactive ? 'Activate project' : 'Deactivate project'}
                      className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                        isInactive
                          ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                          : 'text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                      }`}
                    >
                      {isInactive ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleArchive(proj.id)}
                      title="Delete project"
                      className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & description */}
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate group-hover:text-prpl transition">
                  {proj.title}
                </h3>
                {proj.department && (
                  <p className="text-xs text-prpl font-semibold mb-1">{proj.department}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {proj.description || 'No description provided.'}
                </p>

                {/* Inactive banner */}
                {isInactive && (
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/15">
                    <PowerOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                      Project is inactive — links and positions are disabled
                    </p>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {proj.Profiles?.length || 0} position{proj.Profiles?.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {isInactive ? (
                    <>
                      <button
                        disabled
                        className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-400 dark:text-slate-600 text-sm font-semibold cursor-not-allowed"
                      >
                        Candidates
                      </button>
                      <button
                        disabled
                        className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-400 dark:text-slate-600 text-sm font-semibold cursor-not-allowed border border-slate-200/50 dark:border-white/[0.04]"
                      >
                        Publish
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/projects/${proj.id}/candidates`}
                        className="btn-magnetic flex-1 text-center py-2.5 rounded-xl bg-prpl/8 dark:bg-prpl/12 text-prpl text-sm font-semibold hover:bg-prpl/15 dark:hover:bg-prpl/20 transition"
                      >
                        Candidates
                      </Link>
                      <Link
                        to={`/projects/${proj.id}/publication`}
                        className="btn-magnetic flex-1 text-center py-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] transition border border-slate-200/50 dark:border-white/[0.04]"
                      >
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
              placeholder="e.g., Senior Developer Hiring Q2 2026"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 resize-none transition"
              rows={3}
              placeholder="Brief project description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full h-11 px-4 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition"
              placeholder="e.g., Engineering"
            />
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
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
      {ConfirmDialog}
    </>
  );
}
