import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profilesApi, aiApi, linkedinApi } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import { Share2, Sparkles, Copy, CheckCircle, ExternalLink, FileText } from 'lucide-react';
import { FaLinkedinIn } from 'react-icons/fa';

export default function JobPosting() {
  const { projectId } = useParams();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [aiDescription, setAiDescription] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [linkedinStatus, setLinkedinStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, liRes] = await Promise.all([
          profilesApi.listByProject(projectId),
          linkedinApi.status().catch(() => ({ data: { connected: false } })),
        ]);
        setProfiles(profRes.data.profiles || []);
        setLinkedinStatus(liRes.data);
        if (profRes.data.profiles?.length > 0) {
          setSelectedProfile(profRes.data.profiles[0]);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [projectId]);

  const handleGenerate = async () => {
    if (!selectedProfile) return;
    setGenerating(true);
    setAiDescription(null);
    try {
      const skills = selectedProfile.technicalSkills?.split(',').map(s => s.trim()).filter(Boolean) || [];
      const res = await aiApi.generateDescription({
        title: selectedProfile.title,
        skills,
        location: selectedProfile.location,
        experienceYears: selectedProfile.yearsOfExperience,
        contractType: selectedProfile.typeContract,
      });
      setAiDescription(res.data.description);
      setEditForm({
        title: res.data.description.title || '',
        summary: res.data.description.summary || '',
        responsibilities: res.data.description.responsibilities?.join('\n') || '',
        requirements: res.data.description.requirements?.join('\n') || '',
        benefits: res.data.description.benefits?.join('\n') || '',
        fullDescription: res.data.description.fullDescription || '',
      });
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate description');
    } finally { setGenerating(false); }
  };

  const handlePublishLinkedIn = async () => {
    if (!selectedProfile || !aiDescription) return;
    setPublishing(true);
    setPublishMsg('');
    try {
      const applyLink = `${window.location.origin}/apply/${selectedProfile.id}`;
      const text = `🚀 We're Hiring: ${selectedProfile.title}\n\n${aiDescription.summary || aiDescription.fullDescription || ''}\n\n📋 Key Skills: ${selectedProfile.technicalSkills || ''}\n\n👉 Apply now: ${applyLink}\n\n#hiring #jobs #recruitment`;
      await linkedinApi.publish({ profileId: selectedProfile.id, text, applyLink });
      setPublishMsg('Successfully published to LinkedIn!');
    } catch (err) {
      setPublishMsg(err.response?.data?.error || 'Failed to publish');
    } finally { setPublishing(false); }
  };

  const copyApplyLink = () => {
    if (!selectedProfile) return;
    navigator.clipboard.writeText(`${window.location.origin}/apply/${selectedProfile.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner text="Loading..." />;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Publication</h1>
          <p className="text-slate-500 text-sm mt-1">Generate AI descriptions & publish to platforms</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <EmptyState icon={FileText} title="No positions defined" description="Create a job position first in the Candidates tab." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile selector + AI Generator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile selector */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Select Position</label>
              <div className="flex gap-2 flex-wrap">
                {profiles.map(p => (
                  <button key={p.id} onClick={() => { setSelectedProfile(p); setAiDescription(null); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedProfile?.id === p.id ? 'bg-prpl text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {p.title}
                  </button>
                ))}
              </div>
              {selectedProfile && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-prpl/8 text-prpl rounded-full font-medium">📍 {selectedProfile.location || 'Remote'}</span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">💼 {selectedProfile.yearsOfExperience || '0'}+ years</span>
                    {selectedProfile.technicalSkills?.split(',').slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Generator */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-prpl" /> AI Job Description Generator
                </h2>
                <div className="flex items-center gap-3">

                  {aiDescription && !generating && (
                    <button onClick={() => {
                      if (isEditing) {
                        setAiDescription({
                          ...aiDescription,
                          title: editForm.title,
                          summary: editForm.summary,
                          responsibilities: editForm.responsibilities.split('\n').filter(Boolean),
                          requirements: editForm.requirements.split('\n').filter(Boolean),
                          benefits: editForm.benefits.split('\n').filter(Boolean),
                          fullDescription: editForm.fullDescription
                        });
                        setIsEditing(false);
                      } else {
                        setIsEditing(true);
                      }
                    }} className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm">
                      {isEditing ? 'Save Changes' : 'Edit Description'}
                    </button>
                  )}
                  <button onClick={handleGenerate} disabled={generating || !selectedProfile}
                    className="inline-flex items-center gap-2 bg-prpl text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-prpl/90 disabled:opacity-50 transition shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              </div>

              {generating && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-prpl/20 border-t-prpl rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">AI is crafting your job description...</p>
                  </div>
                </div>
              )}

              {aiDescription && !generating && (
                isEditing ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                      <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prpl/30 transition shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
                      <textarea value={editForm.summary} onChange={e => setEditForm({...editForm, summary: e.target.value})} rows="3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prpl/30 transition shadow-sm resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Responsibilities (One per line)</label>
                      <textarea value={editForm.responsibilities} onChange={e => setEditForm({...editForm, responsibilities: e.target.value})} rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prpl/30 transition shadow-sm resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements (One per line)</label>
                      <textarea value={editForm.requirements} onChange={e => setEditForm({...editForm, requirements: e.target.value})} rows="4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prpl/30 transition shadow-sm resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Benefits (One per line)</label>
                      <textarea value={editForm.benefits} onChange={e => setEditForm({...editForm, benefits: e.target.value})} rows="3" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prpl/30 transition shadow-sm resize-none" />
                    </div>
                  </div>
                ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-prpl/5 rounded-xl border border-prpl/10">
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">{aiDescription.title}</h3>
                    <p className="text-sm text-slate-600">{aiDescription.summary}</p>
                  </div>

                  {aiDescription.responsibilities?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">Responsibilities</h4>
                      <ul className="space-y-1.5">
                        {aiDescription.responsibilities.map((r, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-prpl mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiDescription.requirements?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">Requirements</h4>
                      <ul className="space-y-1.5">
                        {aiDescription.requirements.map((r, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiDescription.benefits?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">Benefits</h4>
                      <ul className="space-y-1.5">
                        {aiDescription.benefits.map((b, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">⭐</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                )
              )}
            </div>
          </div>

          {/* Right sidebar: Publish actions */}
          <div className="space-y-5">
            {/* Apply Link */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Apply Link</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-600 truncate">
                  /apply/{selectedProfile?.id || '...'}
                </code>
                <button onClick={copyApplyLink} className="p-2 rounded-lg bg-prpl/8 text-prpl hover:bg-prpl/15 transition">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LinkedIn Publish */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">LinkedIn</h3>
              <div className="flex items-center gap-2 mb-3">
                <FaLinkedinIn className="w-5 h-5 text-[#0077B5]" />
                <span className="text-sm text-slate-600">
                  {linkedinStatus?.connected ? 'Connected' : 'Not connected'}
                </span>
                <StatusBadge status={linkedinStatus?.connected ? 'Active' : 'Draft'} />
              </div>

              {linkedinStatus?.connected ? (
                <button onClick={handlePublishLinkedIn} disabled={publishing || !aiDescription}
                  className="w-full py-2.5 bg-[#0077B5] text-white rounded-xl text-sm font-semibold hover:bg-[#006396] disabled:opacity-50 transition flex items-center justify-center gap-2">
                  <FaLinkedinIn className="w-4 h-4" />
                  {publishing ? 'Publishing...' : 'Publish to LinkedIn'}
                </button>
              ) : (
                <a href="/settings" className="block w-full text-center py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
                  Connect LinkedIn in Settings
                </a>
              )}

              {publishMsg && (
                <p className={`text-xs mt-2 ${publishMsg.includes('Success') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {publishMsg}
                </p>
              )}
            </div>

            {/* Share Options */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Share</h3>
              <div className="space-y-2">
                <button onClick={copyApplyLink} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                  <Copy className="w-4 h-4" /> Copy apply link
                </button>
                <button onClick={() => { if(aiDescription) navigator.clipboard.writeText(aiDescription.fullDescription || ''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                  <FileText className="w-4 h-4" /> Copy description
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
