import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SALES' as UserRole,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/');
    } catch {
      setError('Unable to authenticate. Check your credentials and API connection.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel grid w-full max-w-5xl overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-ink px-8 py-12 text-white md:px-12">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">Technovan</p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight">Ship quotations with approvals, revisions, PDFs, and project conversion in one flow.</h1>
          <p className="mt-6 max-w-xl text-white/70">Built for IT services teams handling custom scope, revision history, SST tax, and secure client acceptance.</p>
        </section>
        <section className="px-8 py-12 md:px-12">
          <div className="mb-8 flex gap-2 rounded-full bg-slate-100 p-1">
            <button type="button" className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`} onClick={() => setMode('register')}>Register</button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <input className="field" placeholder="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            )}
            <input className="field" type="email" placeholder="Work email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <input className="field" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {mode === 'register' && (
              <select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as 'SALES' | 'MANAGER' | 'ADMIN' })}>
                <option value="SALES">Sales</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            )}
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button className="btn-primary w-full" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>
        </section>
      </div>
    </div>
  );
}