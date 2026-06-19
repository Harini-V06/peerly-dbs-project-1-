import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { loginFn } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Sign in — peerly.' }] }),
  beforeLoad: async ({ context }) => {
    if ((context as any).currentUserId) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('alice@mail.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginFn({ data: { email, password } })
      await navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-3 mt-10 md:mx-6 flex items-center justify-center">
      <div className="mx-auto w-full max-w-sm rounded-3xl bg-secondary border border-foreground/15 p-8 shadow-[3px_3px_0_0_var(--foreground)]">
        <div className="text-center mb-6">
          <span aria-hidden className="text-3xl">🎓</span>
          <h1 className="font-display text-4xl mt-2">peerly.</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-full border border-foreground/30 bg-background px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-full border border-foreground/30 bg-background px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {error && (
            <p className="rounded-2xl bg-primary/30 border border-foreground/15 px-4 py-2 text-sm text-foreground">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full border border-foreground bg-primary px-5 py-2.5 text-sm font-medium shadow-[2px_2px_0_0_var(--foreground)] disabled:opacity-60 hover:bg-primary/80 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo credentials are pre-filled above.
        </p>
      </div>
    </section>
  )
}
