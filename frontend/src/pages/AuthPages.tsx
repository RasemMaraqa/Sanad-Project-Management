import { ArrowRight, CheckCircle2, Compass, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { LanguageToggle } from '../components/LanguageToggle'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

function AuthLayout({ children, mode }: { children: React.ReactNode; mode: 'login' | 'register' }) {
  const { t } = useLanguage()
  const benefits = ['Clear project visibility', 'Flexible team permissions', 'Focused task workflows', 'No noisy busywork']
  return <main className="grid min-h-screen bg-white dark:bg-zinc-950 lg:grid-cols-[minmax(0,1.05fr)_minmax(32rem,.95fr)]">
    <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cobalt-500 via-white/70 to-sumac-500"/><div className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full border-[80px] border-cobalt-500/15"/><div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-cobalt-500/10 blur-3xl"/><div className="absolute bottom-16 right-20 h-32 w-32 rounded-full bg-sumac-500/10 blur-3xl"/>
      <div className="relative flex items-center gap-3"><img src="/sanad-logo.png" alt="" className="h-12 w-12 rounded-xl bg-white object-contain p-1"/><div><span lang="ar" dir="rtl" className="block text-xl font-bold leading-none">سَنَد</span><span className="text-xs text-slate-400">Sanad Projects</span></div></div>
      <div className="relative max-w-xl"><p lang="ar" dir="rtl" className="mb-5 text-right text-sm font-semibold tracking-wide text-cobalt-100">شغلكم أوضح، وخطواتكم أثبت</p><h1 className="text-5xl font-bold leading-[1.08] tracking-tight">{t('Turn ambitious plans into steady progress.')}</h1><div className="mt-9 grid gap-4 sm:grid-cols-2">{benefits.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-slate-300"><CheckCircle2 size={17} className="text-cobalt-400"/>{t(item)}</div>)}</div></div>
      <p className="relative text-sm text-slate-400">{t('Built around teamwork, clarity, and steady support.')}</p>
    </section>
    <section className="relative flex items-center justify-center px-5 py-10 sm:px-10"><div className="absolute end-5 top-5"><LanguageToggle/></div><div className="w-full max-w-md"><div className="mb-9 flex items-center gap-3 lg:hidden"><img src="/sanad-logo.png" alt="Sanad" className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm"/><span lang="ar" dir="rtl" className="text-2xl font-bold text-ink dark:text-white">سَنَد</span></div><div className="mb-8"><div className="mb-4 inline-flex rounded-xl bg-cobalt-50 p-2.5 text-cobalt-600 dark:bg-cobalt-600/10"><Compass size={22}/></div><h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{t(mode === 'login' ? 'Welcome back' : 'Create your account')}</h2><p className="mt-2 text-slate-500 dark:text-slate-400">{t(mode === 'login' ? 'Sign in to continue to your workspace.' : 'Start organizing your team’s work today.')}</p></div>{children}</div></section>
  </main>
}

function PasswordField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  const [show, setShow] = useState(false)
  const { language, t } = useLanguage()
  return <div><label htmlFor="password" className="label">{t('Password')}</label><div className="relative"><LockKeyhole size={18} className={`pointer-events-none absolute top-3 text-slate-400 ${language === 'ar' ? 'right-3.5' : 'left-3.5'}`}/><input id="password" className="field !px-11" type={show ? 'text' : 'password'} autoComplete="current-password" value={value} onChange={(e) => onChange(e.target.value)} required minLength={8}/><button type="button" onClick={() => setShow((v) => !v)} className={`absolute top-2.5 rounded-lg p-1 text-slate-400 hover:text-slate-700 ${language === 'ar' ? 'left-3' : 'right-3'}`} aria-label={t(show ? 'Hide password' : 'Show password')}>{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>{error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}</div>
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace/>
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); setBusy(true); try { await login(email.trim(), password); const destination = (location.state as { from?: string } | null)?.from || '/app/dashboard'; navigate(destination, { replace: true }) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.') } finally { setBusy(false) } }
  return <AuthLayout mode="login"><form onSubmit={submit} className="space-y-5"><div><label htmlFor="email" className="label">{t('Email address')}</label><div className="relative"><Mail size={18} className="pointer-events-none absolute start-3.5 top-3 text-slate-400"/><input id="email" className="field !px-11" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com"/></div></div><PasswordField value={password} onChange={setPassword}/>{error && <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</div>}<Button className="w-full" disabled={busy}>{busy ? t('Signing in…') : <>{t('Sign in')} <ArrowRight className="rtl:rotate-180" size={17}/></>}</Button><p className="text-center text-sm text-slate-500">{t('New to Sanad?')} <Link to="/register" className="font-semibold text-cobalt-600 hover:underline">{t('Create an account')}</Link></p></form></AuthLayout>
}

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace/>
  const submit = async (event: FormEvent) => { event.preventDefault(); const next: Record<string, string> = {}; if (values.username.trim().length < 2) next.username = 'Use at least 2 characters.'; if (values.password.length < 8) next.password = 'Use at least 8 characters.'; setErrors(next); if (Object.keys(next).length) return; setBusy(true); try { await register(values); navigate('/app/dashboard', { replace: true }) } catch (error) { if (error instanceof ApiError) setErrors({ ...error.fieldErrors, form: error.message }); else setErrors({ form: 'Unable to create your account.' }) } finally { setBusy(false) } }
  return <AuthLayout mode="register"><form onSubmit={submit} className="space-y-5"><div><label htmlFor="username" className="label">{t('Name')}</label><div className="relative"><UserRound size={18} className="pointer-events-none absolute start-3.5 top-3 text-slate-400"/><input id="username" className="field !px-11" value={values.username} onChange={(e) => setValues({ ...values, username: e.target.value })} autoComplete="username" required placeholder={t('Name')}/></div>{errors.username && <p className="mt-1.5 text-sm text-rose-600">{errors.username}</p>}</div><div><label htmlFor="email" className="label">{t('Email address')}</label><div className="relative"><Mail size={18} className="pointer-events-none absolute start-3.5 top-3 text-slate-400"/><input id="email" className="field !px-11" type="email" autoComplete="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required placeholder="you@company.com"/></div>{errors.email && <p className="mt-1.5 text-sm text-rose-600">{errors.email}</p>}</div><PasswordField value={values.password} onChange={(password) => setValues({ ...values, password })} error={errors.password}/>{errors.form && <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{errors.form}</div>}<Button className="w-full" disabled={busy}>{busy ? t('Creating account…') : <>{t('Create an account')} <ArrowRight className="rtl:rotate-180" size={17}/></>}</Button><p className="text-center text-sm text-slate-500">{t('Already have an account?')} <Link to="/login" className="font-semibold text-cobalt-600 hover:underline">{t('Sign in')}</Link></p></form></AuthLayout>
}
