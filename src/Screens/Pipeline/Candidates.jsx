import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { candidatesApi, profilesApi, aiApi } from '../../api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Users, Search, Plus, Brain, ArrowUpDown, Eye, Sparkles, Download, FileText, Mail, Phone, MapPin, Briefcase, CheckCircle2, XCircle, Info, AlertCircle, ThumbsUp } from 'lucide-react';

export default function Candidates() {
  const { projectId } = useParams();
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

  const handleParseCV = async (candidateId) => {
    setAiLoading(prev => ({ ...prev, [candidateId]: true }));
    try {
      await aiApi.parseCv(candidateId);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to parse CV'); }
    finally { setAiLoading(prev => ({ ...prev, [candidateId]: false })); }
  };

  const handleMatchScore = async (candidateId, profileId) => {
    setAiLoading(prev => ({ ...prev, [`match-${candidateId}`]: true }));
    try {
      await aiApi.matchScore(candidateId, profileId);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to calculate score'); }
    finally { setAiLoading(prev => ({ ...prev, [`match-${candidateId}`]: false })); }
  };

  const handleRank = async (profileId) => {
    setAiLoading(prev => ({ ...prev, ranking: true }));
    try {
      await aiApi.rankCandidates(profileId);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to rank'); }
    finally { setAiLoading(prev => ({ ...prev, ranking: false })); }
  };

  const showCandidateInfo = async (candidateId) => {
    setDetailsLoading(true);
    setSelectedCandidate(null);
    try {
      const res = await candidatesApi.getById(candidateId);
      setSelectedCandidate(res.data.candidate);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load candidate information');
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
      alert(err.response?.data?.error || 'Failed to download CV');
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

  const parseScoreDetails = (value) => {
    const labels = {
      'Recommendation': 'Recommendation',
      'Why score is lower': 'Why Score Is Lower',
      'Critical missing skills': 'Critical Missing Skills',
      'Missing skills': 'Missing Skills',
      'Weaknesses': 'Weaknesses',
      'Strengths': 'Strengths',
      'Matched skills': 'Matched Skills',
    };

    return String(value || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const match = line.match(/^([^:]+):\s*(.*)$/);
        let label = 'Detail';
        let content = line;

        if (match && labels[match[1]]) {
          label = labels[match[1]];
          content = match[2];
        } else if (index === 0) {
          label = 'Summary';
          content = line.replace(/^(Match Summary|Summary):\s*/i, '');
        } else if (match) {
          label = match[1];
          content = match[2];
        }

        let items = [];
        if (label === 'Summary' || label === 'Recommendation') {
          // split by sentences
          items = content.split(/\.\s+/).map(item => {
            let trimmed = item.trim();
            if (trimmed && !trimmed.endsWith('.')) trimmed += '.';
            return trimmed;
          }).filter(Boolean);
        } else {
          // split by semicolon or comma
          items = content.split(/[;,]\s*/).map(item => item.trim()).filter(Boolean);
        }

        return { label, items: items.length ? items : [content] };
      });
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await candidatesApi.updateStatus(id, newStatus); load(); }
    catch (err) { console.error(err); }
  };

  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingSpinner text="Loading candidates..." />;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500 text-sm mt-1">{candidates.length} total · {profiles.length} position(s)</p>
        </div>
        <div className="flex gap-2">
          {profiles.length > 0 && (
            <button onClick={() => handleRank(profiles[0].id)} disabled={aiLoading.ranking}
              className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-semibold px-4 py-2.5 rounded-xl text-sm border border-amber-200 hover:bg-amber-100 transition disabled:opacity-50">
              <ArrowUpDown className="w-4 h-4" /> {aiLoading.ranking ? 'Ranking...' : 'AI Rank All'}
            </button>
          )}
          <button onClick={() => setShowAddProfile(true)}
            className="inline-flex items-center gap-2 bg-prpl text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md text-sm">
            <Plus className="w-4 h-4" /> Add Position
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-prpl transition" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-prpl">
          <option value="all">All Status</option>
          <option value="received">Received</option>
          <option value="selected">Selected</option>
          <option value="validated">Validated</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      {/* Profiles overview */}
      {profiles.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {profiles.map(p => (
            <div key={p.id} className="shrink-0 bg-white rounded-xl border border-slate-200 px-4 py-3 min-w-[200px]">
              <p className="font-semibold text-sm text-slate-800">{p.title}</p>
              <p className="text-xs text-slate-400 mt-1">{p.Candidates?.length || 0} candidates</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {p.technicalSkills?.split(',').slice(0, 3).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-prpl/8 text-prpl text-[10px] font-medium rounded-full">{s.trim()}</span>
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
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Candidate</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Position</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase">AI Score</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{c.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{c.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-600">{c.Profile?.title || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select value={c.status} onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white outline-none focus:border-prpl cursor-pointer">
                      <option value="received">Received</option>
                      <option value="selected">Selected</option>
                      <option value="validated">Validated</option>
                      <option value="Declined">Declined</option>
                      <option value="discarded">Discarded</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {c.score_value != null ? (
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-10 h-10 rounded-full border-3 border-prpl/20 flex items-center justify-center relative">
                          <span className="text-xs font-bold text-prpl">{c.score_value}</span>
                          <svg className="absolute inset-0 w-10 h-10 -rotate-90">
                            <circle cx="20" cy="20" r="17" fill="none" stroke="#5523e9" strokeWidth="3"
                              strokeDasharray={`${(c.score_value / 100) * 106.8} 106.8`} strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleParseCV(c.id)} disabled={aiLoading[c.id] || c.technical_skills}
                        className={`p-2 rounded-lg transition ${c.technical_skills ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-prpl hover:bg-prpl/8 disabled:opacity-50'}`} 
                        title={c.technical_skills ? 'CV already parsed' : 'Parse CV with AI'}>
                        <Brain className="w-4 h-4" />
                      </button>
                      {c.fk_profile && (
                        <button onClick={() => handleMatchScore(c.id, c.fk_profile)} disabled={aiLoading[`match-${c.id}`] || c.score_value != null}
                          className={`p-2 rounded-lg transition ${c.score_value != null ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-50'}`} 
                          title={c.score_value != null ? 'Score already calculated' : 'Calculate AI Match Score'}>
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => showCandidateInfo(c.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Show candidate information">
                        <Eye className="w-4 h-4" />
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
        <div className="mt-6 bg-prpl/5 rounded-xl border border-prpl/10 p-4">
          <p className="text-sm font-medium text-prpl mb-1">📎 Public Apply Link</p>
          <p className="text-xs text-slate-500">Share this link with candidates:</p>
          <code className="block mt-2 text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-700 select-all">
            {window.location.origin}/apply/{profiles[0].id}
          </code>
        </div>
      )}

      {/* Candidate information */}
      <Modal
        isOpen={detailsLoading || !!selectedCandidate}
        onClose={() => { setSelectedCandidate(null); setDetailsLoading(false); }}
        title="Candidate Information"
        size="xl"
      >
        {detailsLoading ? (
          <LoadingSpinner text="Loading candidate information..." />
        ) : selectedCandidate && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.name || 'Unknown candidate'}</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedCandidate.Profile?.title || 'No position'}</p>
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
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Contact</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {selectedCandidate.email || 'No email'}</p>
                  <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selectedCandidate.phone || 'No phone'}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selectedCandidate.location || 'No location'}</p>
                  <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {selectedCandidate.current_position || 'No current position'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3">CV</h4>
                {selectedCandidate.cv_s3_path && selectedCandidate.cv_s3_path !== 'no-cv' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{selectedCandidate.cv_s3_path}</span>
                    </div>
                    <button
                      onClick={() => downloadCandidateCv(selectedCandidate)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                    >
                      <Download className="w-4 h-4" /> Download CV
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No CV uploaded</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Profile Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Education</p>
                  <p className="text-slate-700">{selectedCandidate.education || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Experience</p>
                  <p className="text-slate-700">{selectedCandidate.years_of_experience ?? 'Not provided'} years</p>
                </div>
              </div>

              {selectedCandidate.summary && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-slate-400 mb-1">Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedCandidate.summary}</p>
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
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Skills & Extras</h4>
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
                          <span key={`${label}-${index}`} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
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
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3">Experiences</h4>
                <div className="space-y-3">
                  {parseExperiences(selectedCandidate.experiences).map((exp, index) => (
                    <div key={index} className="border-l-2 border-prpl/20 pl-3">
                      <p className="text-sm font-semibold text-slate-800">{exp.title || 'Experience'} {exp.company ? `at ${exp.company}` : ''}</p>
                      {exp.duration && <p className="text-xs text-slate-400 mt-0.5">{exp.duration}</p>}
                      {exp.description && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedCandidate.score_description || selectedCandidate.AiAnalyses?.length > 0) && (
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-prpl" />
                  <h4 className="text-sm font-bold text-slate-800">AI Analysis & Scoring</h4>
                </div>
                
                {selectedCandidate.score_description && (
                  <div className="space-y-4">
                    {parseScoreDetails(selectedCandidate.score_description).map((section, sectionIndex) => {
                      
                      let Icon = Info;
                      let iconColor = "text-blue-500";
                      let bgColor = "bg-blue-50";
                      
                      if (section.label === 'Strengths' || section.label === 'Matched Skills') {
                        Icon = CheckCircle2; iconColor = "text-emerald-500"; bgColor = "bg-emerald-50";
                      } else if (section.label === 'Weaknesses' || section.label.includes('Missing') || section.label.includes('Why Score')) {
                        Icon = XCircle; iconColor = "text-rose-500"; bgColor = "bg-rose-50";
                      } else if (section.label === 'Recommendation') {
                        Icon = ThumbsUp; iconColor = "text-prpl"; bgColor = "bg-prpl/10";
                      }

                      return (
                        <div key={`${section.label}-${sectionIndex}`} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 rounded-lg ${bgColor}`}>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                            <p className="text-sm font-bold uppercase text-slate-800">{section.label}</p>
                          </div>
                          <ul className="space-y-2.5">
                            {section.items.map((item, itemIndex) => (
                              <li key={`${section.label}-${itemIndex}`} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                                <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${iconColor.replace('text-', 'bg-')}`} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )}
                {selectedCandidate.AiAnalyses?.length > 0 && (
                  <p className="text-xs text-slate-400 mt-4 text-center">Based on {selectedCandidate.AiAnalyses.length} AI analysis record(s)</p>
                )}
              </div>
            )}
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
    </>
  );
}
