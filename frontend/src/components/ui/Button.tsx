import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  const variants: Record<Variant, string> = {
    primary: 'bg-cobalt-600 text-white hover:bg-cobalt-700 shadow-sm shadow-cobalt-600/20',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-cobalt-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-200 dark:hover:bg-zinc-800',
    ghost: 'text-slate-600 hover:bg-cobalt-50 dark:text-slate-300 dark:hover:bg-zinc-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`} {...props}>{children}</button>
}
