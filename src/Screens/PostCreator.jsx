import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { projectsApi, profilesApi, aiApi, linkedinApi } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import {
  Megaphone,
  Sparkles,
  Send,
  Copy,
  Link as LinkIcon,
  CheckCircle,
  ArrowRight,
  FileText,
  Briefcase,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  PartyPopper,
} from 'lucide-react';
import { FaLinkedinIn } from 'react-icons/fa';

export default function PostCreator() {
  const { projectId: routeProjectId } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedProfile = searchParams.get('profile');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkedinStatus, setLinkedinStatus] = useState(null);

  const [selectedProjectId, setSelectedProjectId] = useState(routeProjectId || '');
  const [selectedProfileId, setSelectedProfileId] = useState(preselectedProfile || '');

  const [postBody, setPostBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);
  const [publishResult, setPublishResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      projectsApi.list({ status: 'all' }).then(r => r.data.projects || []),
      linkedinApi.status().then(r => r.data).catch(() => ({ connected: false })),
    ])
      .then(([p, li]) => {
        setProjects(p);
        setLinkedinStatus(li);
        // Auto-select project from route
        if (routeProjectId && !selectedProjectId) setSelectedProjectId(routeProjectId);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const positions = useMemo(() => {
    const project = projects.find(p => String(p.id) === String(selectedProjectId));
    return project?.Profiles || [];
  }, [projects, selectedProjectId]);

  const selectedProfile = useMemo(
    () => positions.find(p => String(p.id) === String(selectedProfileId)) || null,
    [positions, selectedProfileId],
  );

  const applyLink =
    selectedProfileId && typeof window !== 'undefined'
      ? `${window.location.origin}/apply/${selectedProfileId}`
      : '';

  // Auto-select first profile when project changes
  useEffect(() => {
    if (positions.length > 0 && !selectedProfileId) {
      setSelectedProfileId(String(positions[0].id));
    }
  }, [positions]);

  const handleGenerate = async () => {
    if (!selectedProfile) return;
    setGenerating(true);
    setError('');
    try {
      const res = await aiApi.generatePost({
        title: selectedProfile.title,
        location: selectedProfile.location,
        typeContract: selectedProfile.typeContract,
        yearsOfExperience: selectedProfile.yearsOfExperience,
        education: selectedProfile.education,
        technicalSkills: selectedProfile.technicalSkills,
        softSkills: selectedProfile.softSkills,
        mainMissions: selectedProfile.mainMissions,
        description: selectedProfile.description,
      });
      setPostBody(res.data?.content || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate post.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!postBody.trim()) return setError('Post content is empty.');
    if (!linkedinStatus?.connected) return setError('Connect LinkedIn in Settings first.');
    setPublishing(true);
    setError('');
    try {
      const res = await linkedinApi.publish({
        text: postBody + (applyLink ? `\n\n👉 Apply: ${applyLink}` : ''),
        profileId: selectedProfileId || undefined,
        applyLink: applyLink || undefined,
      });
      setPublishedAt(new Date().toISOString());
      setPublishResult(res.data);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to publish.');
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = async () => {
    if (!applyLink) return;
    try { await navigator.clipboard.writeText(applyLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); } catch {}
  };
  const copyPost = async () => {
    if (!postBody) return;
    try { await navigator.clipboard.writeText(postBody); setCopiedDesc(true); setTimeout(() => setCopiedDesc(false), 2000); } catch {}
  };

  if (loading) return <LoadingSpinner text="Loading post creator..." />;

  if (projects.length === 0) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Posts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate AI job posts & publish to LinkedIn.</p>
        </div>
        <EmptyState
          icon={Megaphone}
          title="No projects yet"
          description="Create a project and add positions before posting."
          action={<Link to="/projects" className="inline-flex items-center gap-2 bg-prpl text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-prpl/90 transition">Create Project <ArrowRight className="w-4 h-4" /></Link>}
        />
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">Posts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate AI job posts & publish to LinkedIn.</p>
        </div>
        {linkedinStatus?.connected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">LinkedIn Connected</span>
          </div>
        ) : (
          <Link to="/settings" className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-full hover:bg-amber-100 dark:hover:bg-amber-500/20 transition">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Connect LinkedIn</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left: Editor */}
        <div className="space-y-5">
          {/* Step 1: Select position */}
          <div className="rounded-2xl surface-primary p-5 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-prpl/10 dark:bg-prpl/20 text-prpl text-[11px] font-bold flex items-center justify-center">1</span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Choose a position</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedProjectId}
                onChange={e => { setSelectedProjectId(e.target.value); setSelectedProfileId(''); setPostBody(''); }}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer"
              >
                <option value="">Select a project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <select
                value={selectedProfileId}
                onChange={e => { setSelectedProfileId(e.target.value); setPostBody(''); }}
                disabled={!selectedProjectId}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a position</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            {/* Position details chips */}
            {selectedProfile && (
              <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-white/[0.04] flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-prpl/8 dark:bg-prpl/12 text-prpl text-xs rounded-full font-medium">📍 {selectedProfile.location || 'Remote'}</span>
                <span className="px-2.5 py-1 bg-blue-500/8 dark:bg-blue-500/12 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium">💼 {selectedProfile.yearsOfExperience || '0'}+ yrs</span>
                {selectedProfile.typeContract && (
                  <span className="px-2.5 py-1 bg-emerald-500/8 dark:bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium">📄 {selectedProfile.typeContract}</span>
                )}
                {selectedProfile.technicalSkills?.split(',').slice(0, 4).map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 text-xs rounded-full border border-slate-200/40 dark:border-white/[0.04]">{s.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Generate & Edit */}
          <div className="rounded-2xl surface-primary p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-prpl/10 dark:bg-prpl/20 text-prpl text-[11px] font-bold flex items-center justify-center">2</span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Compose your post</h3>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!selectedProfile || generating}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-prpl to-purple-600 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(124,58,237,0.3)]"
              >
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            {generating && (
              <div className="flex items-center justify-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-[3px] border-prpl/20 border-t-prpl rounded-full animate-spin" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">AI is writing your job post...</p>
                </div>
              </div>
            )}

            {!generating && (
              <div className="space-y-3">
                <textarea
                  value={postBody}
                  onChange={e => setPostBody(e.target.value)}
                  placeholder="Write your job post here, or select a position and click 'Generate with AI'..."
                  rows={14}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/15 transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {postBody.length} chars · {postBody.split(/\s+/).filter(Boolean).length} words
                  </p>
                  {postBody && (
                    <button onClick={copyPost} className="text-xs text-prpl font-semibold hover:text-prpl/80 transition flex items-center gap-1">
                      {copiedDesc ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy text</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Step 3: Publish */}
          <div className="flex flex-wrap items-center justify-end gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <button
              onClick={handlePublish}
              disabled={!postBody.trim() || publishing || !linkedinStatus?.connected}
              className="inline-flex items-center gap-2 bg-[#0077B5] text-white font-semibold px-5 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(0,119,181,0.3)] hover:shadow-[0_6px_20px_rgba(0,119,181,0.4)] hover:-translate-y-px transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <FaLinkedinIn className="w-4 h-4" />
              {publishing ? 'Publishing...' : 'Publish to LinkedIn'}
            </button>
          </div>


        </div>

        {/* Right: Preview & Tools */}
        <div className="space-y-5">
          {/* LinkedIn Preview */}
          <div className="rounded-2xl surface-primary p-5 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Preview</h3>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                {linkedinStatus?.picture ? (
                  <img src={linkedinStatus.picture} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#0077B5] text-white flex items-center justify-center">
                    <FaLinkedinIn className="w-3.5 h-3.5" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{linkedinStatus?.name || 'Your Profile'}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Just now · <FaLinkedinIn className="w-2.5 h-2.5 inline -mt-px" /> LinkedIn</p>
                </div>
              </div>
              {postBody ? (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{postBody}</p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Your post preview will appear here...</p>
              )}
              {applyLink && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] text-prpl font-semibold truncate">{applyLink}</p>
                </div>
              )}
            </div>
          </div>

          {/* Apply Link */}
          {applyLink && (
            <div className="rounded-2xl surface-primary p-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Apply Link</h3>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 ml-1" />
                <p className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate font-mono">{applyLink}</p>
                <button onClick={copyLink} className="px-2.5 py-1 rounded-lg bg-prpl text-white text-xs font-semibold hover:bg-prpl/90 transition">
                  {copiedLink ? 'Copied!' : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Share this link with candidates. Applications go straight into your pipeline.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gradient-to-br from-prpl/8 via-purple-50 to-violet-50 dark:from-prpl/15 dark:via-prpl/10 dark:to-purple-900/20 rounded-2xl border border-prpl/10 dark:border-prpl/20 p-5 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-prpl" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-prpl">Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Briefcase className="w-3 h-3 mt-0.5 shrink-0 text-prpl" />
                <span>Lead with the role, then the impact</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-3 h-3 mt-0.5 shrink-0 text-prpl" />
                <span>Be specific about must-have skills</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 shrink-0 text-prpl" />
                <span>Include the apply link at the bottom</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Success Modal (Portal) ── */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowSuccessModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-fade-in"
            style={{ animationDelay: '50ms' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-6 pt-8 pb-10 text-center overflow-hidden">
              <div className="absolute inset-0 noise opacity-30" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <button onClick={() => setShowSuccessModal(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition text-white">
                <X className="w-4 h-4" />
              </button>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Post Published! 🎉</h2>
                <p className="text-white/70 text-sm mt-1.5">Your job post is now live on LinkedIn</p>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white dark:bg-[#1a1d28] px-6 py-6 space-y-5">
              {/* Post link */}
              {publishResult?.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0077B5]/8 dark:bg-[#0077B5]/15 border border-[#0077B5]/20 hover:border-[#0077B5]/40 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0077B5] flex items-center justify-center shrink-0 shadow-lg shadow-[#0077B5]/20">
                    <FaLinkedinIn className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#0077B5] transition">View on LinkedIn</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{publishResult.postUrl}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0077B5] transition shrink-0" />
                </a>
              )}

              {/* Mini preview */}
              <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  {linkedinStatus?.picture ? (
                    <img src={linkedinStatus.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0077B5] text-white flex items-center justify-center">
                      <FaLinkedinIn className="w-3 h-3" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{linkedinStatus?.name || 'Your Profile'}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Just now</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">{postBody}</p>
              </div>

              {/* Timestamp */}
              {publishedAt && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  Published at {new Date(publishedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div className="bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200/40 dark:border-white/[0.04] px-6 py-4 flex items-center justify-end gap-3">
              <button onClick={() => setShowSuccessModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition">
                Close
              </button>
              {publishResult?.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#0077B5] text-white text-sm font-semibold rounded-xl hover:bg-[#00659c] transition shadow-[0_4px_12px_rgba(0,119,181,0.3)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Post
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
