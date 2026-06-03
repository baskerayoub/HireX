import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, UserRound, ArrowRight, Sun, Moon, Lock } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

function cn(...c) { return c.filter(Boolean).join(' '); }

export default function Login() {
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();
  const { isDark, toggle } = useTheme();
  const toast = useToast();

  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setTimeout(() => emailRef.current?.focus(), 350); }, [mode]);

  if (user) return <Navigate to="/workspace" replace />;

  const isSignup = mode === 'signup';
  const form = isSignup ? signupForm : loginForm;

  const validate = () => {
    const e = {};
    if (isSignup && !signupForm.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return toast.warning('Fix highlighted fields.');
    setLoading(true);
    try {
      if (isSignup) {
        const r = await signup({ name: signupForm.name.trim(), email: signupForm.email.trim(), password: signupForm.password });
        if (!r.success) { toast.error(r.error || 'Signup failed.'); return; }
        toast.success('Account created! Welcome.');
      } else {
        const r = await login(loginForm.email.trim(), loginForm.password);
        if (!r.success) { toast.error(r.error || 'Invalid credentials.'); return; }
        toast.success('Welcome back!');
      }
      navigate('/workspace', { replace: true });
    } catch { toast.error('Unexpected error.'); }
    finally { setLoading(false); }
  };

  const set = (k, v) => {
    setErrors(p => ({ ...p, [k]: '' }));
    if (isSignup) setSignupForm(p => ({ ...p, [k]: v }));
    else setLoginForm(p => ({ ...p, [k]: v }));
  };

  const inputCls = (field) => cn(
    'h-[52px] w-full rounded-2xl border bg-white dark:bg-white/[0.04] pl-12 pr-12 text-[15px] text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500',
    errors[field]
      ? 'border-rose-400 focus:ring-2 focus:ring-rose-300/30'
      : 'border-slate-200/70 dark:border-white/[0.08] focus:border-prpl focus:ring-[3px] focus:ring-prpl/15'
  );

  return (
    <main className="min-h-svh bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#08090E] dark:via-[#0C0D14] dark:to-[#0A0B12] transition-colors duration-500 relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Subtle ambient blurs */}
      <div className="absolute top-[-30%] left-[-15%] w-[500px] h-[500px] bg-prpl/[0.07] dark:bg-prpl/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[500px] h-[500px] bg-accent/[0.05] dark:bg-accent/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className={`relative z-10 w-full max-w-[440px] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        {/* Logo + theme toggle */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/NewLogo.png"
              alt="HireX logo"
              className="w-15 h-15 object-contain"
            />
            <div>
              <h1 className="font-splatink text-[1.6rem] text-prpl leading-none">HireX</h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] mt-0.5">Smart Recruitment</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-xl border border-slate-200/60 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-prpl dark:hover:text-prpl transition-all hover:border-prpl/30 backdrop-blur-sm"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* Glass card */}
        <div className="relative rounded-[28px] bg-white/80 dark:bg-[#12131A]/80 backdrop-blur-2xl border border-slate-200/60 dark:border-white/[0.06] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.4)] p-8 sm:p-10">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] rounded-full bg-gradient-to-r from-transparent via-prpl/60 to-transparent" />

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-[1.7rem] font-bold text-slate-900 dark:text-white tracking-tight">
              {isSignup ? 'Create account' : 'Welcome back'}
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {isSignup ? 'Start your recruitment journey.' : 'Sign in to your recruitment workspace.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] p-1.5 border border-slate-200/40 dark:border-white/[0.03] mb-8">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={cn(
                  'rounded-xl py-3 text-sm font-semibold transition-all duration-250',
                  mode === m
                    ? 'bg-white dark:bg-white/[0.08] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {isSignup && (
              <div className="animate-fade-in">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input value={signupForm.name} onChange={e => set('name', e.target.value)} className={inputCls('name')} placeholder="John Doe" />
                </div>
                {errors.name && <p className="mt-2 text-xs text-rose-500 font-medium">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input ref={emailRef} value={form.email} onChange={e => set('email', e.target.value)} className={inputCls('email')} placeholder="you@company.com" autoComplete="email" />
              </div>
              {errors.email && <p className="mt-2 text-xs text-rose-500 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input value={form.password} onChange={e => set('password', e.target.value)} type={showPw ? 'text' : 'password'} className={inputCls('password')} placeholder="••••••••" autoComplete={isSignup ? 'new-password' : 'current-password'} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition" aria-label="Toggle password">
                  {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-rose-500 font-medium">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-[52px] rounded-2xl bg-gradient-to-r from-prpl via-purple-600 to-violet-700 text-white font-semibold text-[15px] shadow-[0_8px_30px_-6px_rgba(124,58,237,0.5)] hover:shadow-[0_12px_40px_-6px_rgba(124,58,237,0.6)] disabled:opacity-60 disabled:cursor-wait transition-all overflow-hidden group mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.08] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isSignup ? 'Create account' : 'Sign in'}
                    <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200/60 dark:bg-white/[0.04]" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Secure</span>
            <div className="flex-1 h-px bg-slate-200/60 dark:bg-white/[0.04]" />
          </div>

          <p className="mt-4 text-center text-[12px] text-slate-400 dark:text-slate-500 leading-relaxed">
            By continuing, you agree to HireX's Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Branding footer */}
        <p className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} HireX · Recruitment
        </p>
      </div>
    </main>
  );
}
