import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { candidatesApi } from '../../api';
import { FileSignature, Download, CheckCircle2, Clock, Mail, User } from 'lucide-react';

export default function Contracts() {
  const { projectId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await candidatesApi.listByProject(projectId);
        const eligible = (res.data.candidates || []).filter(c => ['validated', 'selected'].includes(c.status));
        setCandidates(eligible);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [projectId]);

  if (loading) return <LoadingSpinner text="Loading contracts..." />;

  return (
    <>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Contracts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {candidates.length} contract-ready · Manage contracts for validated candidates
          </p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState icon={FileSignature} title="No contract-ready candidates"
          description="Validate candidates from the pipeline to start the contract process." />
      ) : (
        <div className="space-y-3">
          {candidates.map((c, i) => (
            <div
              key={c.id}
              className="rounded-2xl surface-primary p-5 surface-hover animate-fade-in group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-prpl/15 to-purple-500/15 dark:from-prpl/25 dark:to-purple-500/25 text-prpl text-sm font-bold flex items-center justify-center">
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{c.name || 'Unknown'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <Mail className="w-3 h-3" /> {c.email || 'No email'}
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      {c.Profile?.title || 'Position'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  {c.score_value && (
                    <span className="text-xs font-bold text-prpl bg-prpl/8 dark:bg-prpl/15 px-2.5 py-1 rounded-lg">
                      Score: {c.score_value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
