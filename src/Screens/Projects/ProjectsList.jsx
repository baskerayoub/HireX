import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { FolderKanban, Plus, Search, Users, Briefcase, MoreVertical, Trash2 } from 'lucide-react';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', department: '' });
  const [creating, setCreating] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.list({ search });
      setProjects(res.data.projects || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProjects(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await projectsApi.create(form);
      setShowCreate(false);
      setForm({ title: '', description: '', department: '' });
      loadProjects();
    } catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this project?')) return;
    try { await projectsApi.archive(id); loadProjects(); }
    catch (err) { console.error(err); }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your recruitment projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-prpl text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text" placeholder="Search projects..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition"
        />
      </div>

      {/* Content */}
      {loading ? <LoadingSpinner text="Loading projects..." /> : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban} title="No projects yet"
          description="Create your first recruitment project to start sourcing candidates."
          action={<button onClick={() => setShowCreate(true)} className="bg-prpl text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-prpl/90 transition">Create Project</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const candidateCount = proj.Profiles?.reduce((sum, p) => sum + (p.Candidates?.length || 0), 0) || 0;
            return (
              <div key={proj.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-prpl/8 text-prpl">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={proj.status || 'Active'} />
                    <button onClick={() => handleArchive(proj.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 mb-1">{proj.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{proj.description || 'No description'}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{proj.Profiles?.length || 0} positions</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{candidateCount} candidates</span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/projects/${proj.id}/candidates`} className="flex-1 text-center py-2 rounded-lg bg-prpl/8 text-prpl text-sm font-semibold hover:bg-prpl/15 transition">
                    Candidates
                  </Link>
                  <Link to={`/projects/${proj.id}/publication`} className="flex-1 text-center py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition">
                    Publish
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
              className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10" placeholder="e.g., Senior Developer Hiring Q2 2026" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 resize-none" rows={3} placeholder="Brief description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input type="text" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})}
              className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10" placeholder="e.g., Engineering" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button type="submit" disabled={creating} className="px-5 py-2 bg-prpl text-white text-sm font-semibold rounded-lg hover:bg-prpl/90 disabled:opacity-50 transition">
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
