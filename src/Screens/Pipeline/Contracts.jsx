import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { candidatesApi } from '../../api';
import { FileSignature, Download, Eye } from 'lucide-react';

export default function Contracts() {
  const { projectId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await candidatesApi.listByProject(projectId);
        // Only show validated/selected candidates eligible for contracts
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage contracts for validated candidates</p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState icon={FileSignature} title="No contract-ready candidates"
          description="Validate candidates from the pipeline to start the contract process." />
      ) : (
        <div className="space-y-4">
          {candidates.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-prpl/10 text-prpl text-sm font-bold flex items-center justify-center">
                    {(c.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.name || 'Unknown'}</h3>
                    <p className="text-sm text-slate-500">{c.email || 'No email'} · {c.Profile?.title || 'Position'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Score: {c.score_value || '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
