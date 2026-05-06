import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profilesApi, candidatesApi } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Upload, CheckCircle, User, Mail, Phone, MapPin, FileText, Briefcase, GraduationCap } from 'lucide-react';

export default function PublicApply() {
  const { profileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '', education: '', currentPosition: '',
  });
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await profilesApi.getById(profileId);
        setProfile(res.data.profile);
      } catch {
        setError('This job position is no longer available.');
      } finally { setLoading(false); }
    }
    load();
  }, [profileId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError('Name and email are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (cvFile) formData.append('cv', cvFile);
      await candidatesApi.apply(profileId, formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
      <LoadingSpinner text="Loading position..." />
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
        <p className="text-slate-500 mb-6">
          Thank you for applying for <strong>{profile?.title}</strong>. We will review your application and get back to you soon.
        </p>
        <div className="bg-prpl/5 rounded-xl p-4 text-sm text-prpl">
          Keep an eye on your inbox for updates from our team.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="font-splatink text-2xl text-prpl">HireX</div>
            <span className="text-xs bg-prpl/8 text-prpl px-2 py-0.5 rounded-full font-medium">Careers</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {error && !profile ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Job Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sticky top-6">
                <h1 className="text-xl font-bold text-slate-900 mb-2">{profile?.title}</h1>

                <div className="space-y-3 text-sm text-slate-600 mb-5">
                  {profile?.location && (
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-prpl" />{profile.location}</div>
                  )}
                  {profile?.yearsOfExperience && (
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-500" />{profile.yearsOfExperience}+ years experience</div>
                  )}
                  {profile?.education && (
                    <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-amber-500" />{profile.education}</div>
                  )}
                  {profile?.typeContract && (
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" />{profile.typeContract}</div>
                  )}
                </div>

                {profile?.description && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{profile.description}</p>
                  </div>
                )}

                {profile?.technicalSkills && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.technicalSkills.split(',').map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-prpl/8 text-prpl text-xs font-medium rounded-full">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.mainMissions && (
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Main Missions</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{profile.mainMissions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5">Apply for this position</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition" placeholder="John Doe" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition" placeholder="john@email.com" required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition" placeholder="+1 234 567 890" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                          className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition" placeholder="City, Country" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
                      <input type="text" value={form.education} onChange={e => setForm({...form, education: e.target.value})}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition" placeholder="Master's in CS" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current Position</label>
                      <input type="text" value={form.currentPosition} onChange={e => setForm({...form, currentPosition: e.target.value})}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-prpl focus:ring-2 focus:ring-prpl/10 transition" placeholder="Software Engineer" />
                    </div>
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resume / CV</label>
                    <label className="flex items-center justify-center gap-3 w-full h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-prpl hover:bg-prpl/5 transition cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files[0])} className="hidden" />
                      {cvFile ? (
                        <div className="flex items-center gap-2 text-prpl">
                          <FileText className="w-5 h-5" />
                          <span className="text-sm font-medium">{cvFile.name}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                          <p className="text-sm text-slate-500">Drop your CV here or click to browse</p>
                          <p className="text-xs text-slate-400 mt-0.5">PDF or Word (max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full h-12 bg-prpl text-white font-semibold rounded-xl shadow-[0_12px_24px_rgba(85,35,233,0.2)] hover:shadow-[0_16px_32px_rgba(85,35,233,0.25)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait transition">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
          Powered by <span className="font-splatink text-prpl">HireX</span> · AI-Powered Recruitment Platform
        </div>
      </footer>
    </div>
  );
}
