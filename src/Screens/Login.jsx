import { useEffect, useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff, Mail, UserRound } from 'lucide-react'
import { FaApple, FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'
import Balatro from '../components/Background';


const emptyLoginForm = {
  email: '',
  password: '',
}

const emptySignupForm = {
  name: '',
  email: '',
  password: '',
}

const brandName = 'HireX'

const socialProviders = [
  {
    label: 'Facebook',
    icon: FaFacebookF,
    className: 'text-prpl',
  },
  {
    label: 'Google',
    icon: FcGoogle,
    className: '',
  },
  {
    label: 'Apple',
    icon: FaApple,
    className: 'text-slate-900',
  },
]

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function SocialButton({ label, Icon, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-14 w-full place-items-center rounded-xl border border-slate-200 bg-white text-slate-900 transition hover:-translate-y-0.5 hover:border-prpl/40 hover:shadow-[0_14px_24px_rgba(85,35,233,0.10)]"
    >
      <Icon className={cn('h-7 w-7', className)} />
    </button>
  )
}

function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  Icon,
  autoFocus = false,
  trailingAction = null,
}) {
  return (
    <div className="group relative overflow-y-hidden">
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-[0.95rem] font-medium text-slate-400 transition group-focus-within:text-prpl"
      >
        {label}
      </label>

      <div className="relative rounded-lg border border-slate-200 transition group-focus-within:border-prpl group-focus-within:shadow-[0_0_0_2px_rgba(85,35,233,0.10)]">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-[62px] w-full rounded-lg bg-white px-5 pr-14 text-[1.02rem] text-slate-800 outline-none placeholder:text-slate-400"
          required
        />

        {Icon ? (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-300">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}

        {trailingAction ? (
          <div className="absolute inset-y-0 right-3 flex items-center">{trailingAction}</div>
        ) : null}
      </div>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [signupForm, setSignupForm] = useState(emptySignupForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({
    type: '',
    text: '',
  })

  const currentForm = mode === 'login' ? loginForm : signupForm

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  function switchMode(nextMode) {
    setMode(nextMode)
    setMessage({ type: '', text: '' })
  }

  function handleChange(event) {
    const { name, value } = event.target

    if (mode === 'login') {
      setLoginForm((current) => ({
        ...current,
        [name]: value,
      }))
      return
    }

    setSignupForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (mode === 'login') {
        const response = await axios.post('/api/login', loginForm)

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          setMessage({
            type: 'success',
            text: 'Login successful.',
          })
          navigate('/dashboard', { replace: true })
        }

        return
      }

      const response = await axios.post('/api/signup', signupForm)

      setMessage({
        type: 'success',
        text: response.data.message,
      })
      setLoginForm({
        email: signupForm.email,
        password: signupForm.password,
      })
      setSignupForm(emptySignupForm)
      setMode('login')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Something went wrong. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const isSignup = mode === 'signup'
  const PasswordIcon = showPassword ? EyeOff : Eye
  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      className="rounded-full p-1 text-slate-300 transition hover:text-prpl"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      <PasswordIcon className="h-5 w-5" />
    </button>
  )

  return (
    <main className="min-h-screen bg-[#f5f7fb] font-[Aptos,Segoe_UI,Trebuchet_MS,sans-serif] text-slate-900">
      <section className="grid min-h-screen lg:grid-cols-2">
        <div className="flex min-h-screen flex-col bg-white px-6 py-8 sm:px-10 lg:px-12 xl:px-14">
          <div className="flex items-center">
            <div className="font-splatink text-[2.8rem] leading-none text-prpl sm:text-[2.5rem]">
              {brandName}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-10 lg:py-14">
            <div className="w-full max-w-[388px]">
              <p className="text-[1.08rem] font-medium text-slate-600">
                {isSignup ? 'Start your journey' : 'Welcome back'}
              </p>

              <h1 className="mt-3 text-[2.55rem] font-semibold leading-tight tracking-[-0.04em] text-slate-900">
                {isSignup ? `Sign Up to ${brandName}` : `Sign In to ${brandName}`}
              </h1>

              <form className="mt-16 space-y-9" onSubmit={handleSubmit}>
                {isSignup ? (
                  <AuthField
                    id="name"
                    label="Full name"
                    type="text"
                    value={signupForm.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    Icon={UserRound}
                    autoFocus
                  />
                ) : null}

                <AuthField
                  id="email"
                  label="E-mail"
                  type="email"
                  value={currentForm.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  Icon={Mail}
                  autoFocus={!isSignup}
                />

                <AuthField
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={currentForm.password}
                  onChange={handleChange}
                  placeholder={showPassword ? 'yourpassword' : 'Enter your password'}
                  trailingAction={eyeButton}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="h-[58px] w-full rounded-lg bg-prpl text-[1.2rem] font-semibold text-white shadow-[0_18px_30px_rgba(85,35,233,0.22)] transition hover:bg-prpl/95 disabled:cursor-wait disabled:opacity-75"
                >
                  {loading
                    ? isSignup
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isSignup
                      ? 'Sign Up'
                      : 'Sign In'}
                </button>
              </form>

              {message.text ? (
                <div
                  className={cn(
                    'mt-5 rounded-lg border px-4 py-3 text-[0.98rem] leading-7',
                    message.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-red-200 bg-red-50 text-red-600',
                  )}
                >
                  {message.text}
                </div>
              ) : null}
                    
              <div className="pt-8 text-[1.05rem] text-slate-500 text-center">
                <span>{isSignup ? 'Have an account? ' : "Don't have an account? "}</span>
                <button
                  type="button"
                  onClick={() => switchMode(isSignup ? 'login' : 'signup')}
                  className="font-semibold text-prpl transition hover:text-prpl/90"
                >
                  {isSignup ? 'Sign in' : 'Sign up'}
                </button>
              </div>



              <div className="mt-12 flex items-center gap-3 text-[1rem] text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>{isSignup ? 'or sign up with' : 'or sign in with'}</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {socialProviders.map((provider) => (
                  <SocialButton
                    key={provider.label}
                    label={provider.label}
                    Icon={provider.icon}
                    className={provider.className}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="relative hidden min-h-screen overflow-hidden border-l border-[#162325] lg:block">
                <Balatro
                isRotate={false}
                mouseInteraction
                pixelFilter={1500}
                color1="#5523e9"
                color2="#162325"
                color3=""
              />
        </div>
      </section>
    </main>
  )
}
