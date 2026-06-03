import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Link2Off, Moon, Palette, Settings as SettingsIcon, Shield, Sun, Monitor, Sparkles } from 'lucide-react';
import { FaLinkedinIn } from 'react-icons/fa';
import { linkedinApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

function Toggle({ enabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-all duration-200 ${enabled ? 'bg-prpl shadow-[0_2px_8px_rgba(124,58,237,0.3)]' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { isDark, theme, setTheme } = useTheme();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('appearance');
  const [liLoading, setLiLoading] = useState(true);
  const [linkedinStatus, setLinkedinStatus] = useState({ connected: false });
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);


  // Handle LinkedIn OAuth callback redirect
  useEffect(() => {
    const liResult = searchParams.get('linkedin');
    if (liResult) {
      setActiveTab('linkedin'); // Switch to LinkedIn tab
      if (liResult === 'success') {
        toast.success('LinkedIn connected successfully! 🎉');
      } else if (liResult === 'error') {
        const reason = searchParams.get('reason') || 'unknown';
        toast.error(`LinkedIn connection failed: ${reason}`);
      }
      // Clean URL params
      searchParams.delete('linkedin');
      searchParams.delete('reason');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    async function run() {
      try {
        const res = await linkedinApi.status();
        setLinkedinStatus(res.data || { connected: false });
      } catch {
        setLinkedinStatus({ connected: false });
      } finally {
        setLiLoading(false);
      }
    }
    run();
  }, []);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const connectLinkedIn = async () => {
    setConnecting(true);
    try {
      const res = await linkedinApi.getAuthUrl();
      if (!res?.data?.url) {
        toast.error('Unable to start LinkedIn connection.');
        return;
      }
      window.location.href = res.data.url;
    } catch {
      toast.error('Failed to connect LinkedIn.');
      setConnecting(false);
    }
  };

  const disconnectLinkedIn = async () => {
    setDisconnecting(true);
    try {
      await linkedinApi.disconnect();
      setLinkedinStatus({ connected: false });
      toast.success('LinkedIn disconnected successfully.');
    } catch {
      toast.error('Could not disconnect LinkedIn right now.');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="animate-fade-in">
        <h1 className="text-[1.85rem] font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fine-tune your workspace experience and integrations.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Tab nav */}
        <aside className="rounded-2xl surface-primary p-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-prpl/8 dark:bg-prpl/12 text-prpl font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {activeTab === 'appearance' && (
            <article className="rounded-2xl surface-primary p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Appearance</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Balanced premium themes with soft contrast for extended sessions.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Light theme */}
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                    !isDark
                      ? 'border-prpl/40 bg-prpl/5 dark:bg-prpl/8 shadow-[0_0_0_1px_rgba(124,58,237,0.15)]'
                      : 'border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  {!isDark && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-prpl text-white flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div>}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-500 shadow-sm">
                      <Sun className="h-5 w-5" />
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Light</p>
                  </div>
                  <div className="h-16 rounded-xl border border-slate-200/60 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
                    <div className="h-3 bg-slate-100 border-b border-slate-200/50" />
                    <div className="flex gap-1.5 p-2">
                      <div className="w-6 h-6 rounded-md bg-slate-200/60" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-3/4 bg-slate-200/60 rounded" />
                        <div className="h-1.5 w-1/2 bg-slate-200/40 rounded" />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Dark theme */}
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                    isDark
                      ? 'border-prpl/40 bg-prpl/8 shadow-[0_0_0_1px_rgba(124,58,237,0.15)]'
                      : 'border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  {isDark && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-prpl text-white flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5" /></div>}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 dark:bg-slate-700 text-violet-300 shadow-sm">
                      <Moon className="h-5 w-5" />
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Dark</p>
                  </div>
                  <div className="h-16 rounded-xl border border-slate-700/50 bg-gradient-to-b from-[#111318] to-[#0A0B10] overflow-hidden">
                    <div className="h-3 bg-[#161922] border-b border-white/[0.04]" />
                    <div className="flex gap-1.5 p-2">
                      <div className="w-6 h-6 rounded-md bg-white/[0.06]" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-3/4 bg-white/[0.06] rounded" />
                        <div className="h-1.5 w-1/2 bg-white/[0.04] rounded" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
                Active: <span className="font-semibold text-prpl capitalize">{theme}</span>
              </p>
            </article>
          )}

          {activeTab === 'general' && (
            <article className="rounded-2xl surface-primary p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">General</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your account information.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'First Name', value: user?.firstName || user?.name?.split(' ')[0] || 'N/A' },
                  { label: 'Last Name', value: user?.lastName || 'N/A' },
                  { label: 'Email', value: user?.email || 'N/A', span: 2 },
                  { label: 'Role', value: user?.role || 'Member' },
                ].map(field => (
                  <div key={field.label} className={field.span === 2 ? 'sm:col-span-2' : ''}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium mb-1.5">{field.label}</p>
                    <p className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}



          {activeTab === 'linkedin' && (
            <article className="rounded-2xl surface-primary p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0077B5]/10 dark:bg-[#0077B5]/20 text-[#0077B5]">
                  <FaLinkedinIn className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">LinkedIn Integration</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Connect and publish hiring posts directly.</p>
                </div>
              </div>

              {liLoading ? (
                <LoadingSpinner size="sm" text="Checking LinkedIn status..." />
              ) : linkedinStatus.connected ? (
                <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-500/8 p-5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">LinkedIn connected</p>
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Your account is ready to publish jobs.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={disconnecting}
                    onClick={disconnectLinkedIn}
                    className="mt-4 btn-magnetic inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200/60 dark:border-rose-500/20 bg-rose-50/80 dark:bg-rose-500/8 px-4 text-sm font-medium text-rose-700 dark:text-rose-300 transition-all hover:bg-rose-100 dark:hover:bg-rose-500/15 disabled:opacity-60"
                  >
                    <Link2Off className="h-4 w-4" />
                    {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] p-5">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">LinkedIn is not connected yet. Connect to publish job postings directly.</p>
                  <button
                    type="button"
                    onClick={connectLinkedIn}
                    disabled={connecting}
                    className="btn-magnetic inline-flex h-10 items-center gap-2 rounded-xl bg-[#0077B5] px-5 text-sm font-semibold text-white transition-all hover:bg-[#00659c] shadow-[0_4px_12px_rgba(0,119,181,0.3)] disabled:opacity-70"
                  >
                    <FaLinkedinIn className="h-4 w-4" />
                    {connecting ? 'Redirecting...' : 'Connect LinkedIn'}
                  </button>
                </div>
              )}
            </article>
          )}

          {activeTab === 'security' && (
            <article className="rounded-2xl surface-primary p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Security</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your password and account security.</p>
              <Link
                to="/change-password"
                className="btn-magnetic mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-prpl to-purple-600 px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all"
              >
                <Shield className="w-4 h-4" />
                Change Password
              </Link>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
