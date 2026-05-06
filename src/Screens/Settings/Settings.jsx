import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { linkedinApi } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Settings as SettingsIcon, Shield, Bell, CheckCircle, XCircle, Unlink } from 'lucide-react';
import { FaLinkedinIn } from 'react-icons/fa';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [linkedinStatus, setLinkedinStatus] = useState(null);
  const [liLoading, setLiLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    async function checkLinkedIn() {
      try {
        const res = await linkedinApi.status();
        setLinkedinStatus(res.data);
      } catch {
        setLinkedinStatus({ connected: false });
      } finally { setLiLoading(false); }
    }
    checkLinkedIn();

    // Handle LinkedIn OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state) {
      handleLinkedInCallback(code, state);
    }
  }, []);

  const handleLinkedInCallback = async (code, state) => {
    try {
      await linkedinApi.callback(code, state);
      const res = await linkedinApi.status();
      setLinkedinStatus(res.data);
      // Clean URL
      window.history.replaceState({}, '', '/settings');
    } catch (err) {
      console.error('LinkedIn callback error:', err);
    }
  };

  const handleConnectLinkedIn = async () => {
    setConnecting(true);
    try {
      const res = await linkedinApi.getAuthUrl();
      window.location.href = res.data.url;
    } catch {
      alert('Failed to start LinkedIn connection');
      setConnecting(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!confirm('Disconnect LinkedIn? You will need to reconnect to publish jobs.')) return;
    setDisconnecting(true);
    try {
      await linkedinApi.disconnect();
      setLinkedinStatus({ connected: false });
    } catch (err) { console.error(err); }
    finally { setDisconnecting(false); }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-prpl/8 text-prpl font-semibold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">General Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" defaultValue={user?.firstName || ''} readOnly
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" defaultValue={user?.lastName || ''} readOnly
                      className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" defaultValue={user?.email || ''} readOnly
                    className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input type="text" defaultValue={user?.role || 'User'} readOnly
                    className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'linkedin' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-[#0077B5]/10">
                    <FaLinkedinIn className="w-6 h-6 text-[#0077B5]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">LinkedIn Integration</h2>
                    <p className="text-sm text-slate-500">Connect your LinkedIn account to publish job posts directly</p>
                  </div>
                </div>

                {liLoading ? (
                  <LoadingSpinner size="sm" />
                ) : linkedinStatus?.connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-800">LinkedIn Connected</p>
                        <p className="text-xs text-emerald-600">
                          Token expires: {new Date(linkedinStatus.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button onClick={handleDisconnectLinkedIn} disabled={disconnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50">
                      <Unlink className="w-4 h-4" />
                      {disconnecting ? 'Disconnecting...' : 'Disconnect LinkedIn'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <XCircle className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Not Connected</p>
                        <p className="text-xs text-slate-500">Connect to publish jobs to your LinkedIn feed</p>
                      </div>
                    </div>
                    <button onClick={handleConnectLinkedIn} disabled={connecting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#0077B5] text-white rounded-xl text-sm font-semibold hover:bg-[#006396] transition disabled:opacity-50">
                      <FaLinkedinIn className="w-4 h-4" />
                      {connecting ? 'Redirecting...' : 'Connect LinkedIn'}
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">How it works</h3>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Connect your LinkedIn account via OAuth 2.0' },
                    { step: '2', text: 'Generate an AI-powered job description for your position' },
                    { step: '3', text: 'Publish directly to your LinkedIn feed with one click' },
                    { step: '4', text: 'Candidates apply via the shared link and land in your pipeline' },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-prpl/10 text-prpl text-xs font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <p className="text-sm text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: 'New candidate applications', desc: 'Get notified when someone applies', enabled: true },
                  { label: 'Interview reminders', desc: 'Reminder 1 hour before interviews', enabled: true },
                  { label: 'AI analysis complete', desc: 'When CV parsing or scoring finishes', enabled: false },
                  { label: 'Weekly pipeline report', desc: 'Summary of hiring activity', enabled: false },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{pref.label}</p>
                      <p className="text-xs text-slate-500">{pref.desc}</p>
                    </div>
                    <button className={`w-11 h-6 rounded-full transition-colors ${pref.enabled ? 'bg-prpl' : 'bg-slate-200'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input type="password" className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input type="password" className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input type="password" className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm outline-none focus:border-prpl" />
                </div>
                <button className="px-5 py-2 bg-prpl text-white text-sm font-semibold rounded-lg hover:bg-prpl/90 transition">
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
