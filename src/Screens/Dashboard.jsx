import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ArrowRight, Briefcase, Users, FileCheck2, TrendingUp, Clock, CheckCircle, FolderKanban, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          projectsApi.stats(),
          projectsApi.list({ status: 'all' }),
        ]);
        setStats(statsRes.data.stats);
        setRecentProjects(projectsRes.data.projects?.slice(0, 5) || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!user) return null;
  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const firstName = user?.firstName || user?.name?.trim()?.split(' ')[0] || 'there';

  const pipelineStages = [
    { title: 'Total Projects', value: stats?.totalProjects || 0, detail: 'Recruitment projects created.', icon: FolderKanban, color: 'bg-purple-50 text-prpl' },
    { title: 'Active Projects', value: stats?.activeProjects || 0, detail: 'Currently hiring.', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    { title: 'Candidates', value: stats?.totalCandidates || 0, detail: 'Total applications received.', icon: Users, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your hiring pipeline today.</p>
        </div>
        <Link to="/projects" className="inline-flex items-center gap-2 bg-prpl text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          New Project <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {pipelineStages.map((stage) => (
          <div key={stage.title} className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stage.color}`}>
                <stage.icon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-bold text-slate-900">{stage.value}</span>
            </div>
            <h3 className="text-[0.95rem] font-semibold text-slate-800">{stage.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{stage.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Recent Projects</h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
            {recentProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No projects yet. Create your first!</p>
              </div>
            ) : (
              recentProjects.map((proj) => {
                const candidateCount = proj.Profiles?.reduce((sum, p) => sum + (p.Candidates?.length || 0), 0) || 0;
                return (
                  <Link
                    key={proj.id}
                    to={`/projects/${proj.id}/candidates`}
                    className="p-5 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 transition block"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-prpl transition">{proj.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {proj.Profiles?.length || 0} position{proj.Profiles?.length !== 1 ? 's' : ''} · {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-prpl transition shrink-0 ml-4" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
            {[
              { text: 'Create a new recruitment project', icon: FolderKanban, link: '/projects' },
              { text: 'Generate AI job description', icon: TrendingUp, link: '/projects' },
              { text: 'View your profile', icon: CheckCircle, link: '/profile' },
              { text: 'Manage settings', icon: Clock, link: '/settings' },
            ].map((action, i) => (
              <Link key={i} to={action.link} className="flex gap-3 items-center group p-2 rounded-lg hover:bg-slate-50 transition">
                <div className="p-1.5 bg-prpl/8 text-prpl rounded-lg shrink-0">
                  <action.icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-slate-600 group-hover:text-prpl transition">{action.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
