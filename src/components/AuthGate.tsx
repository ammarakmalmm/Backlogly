import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext<{ email: string; signOut: () => void }>({ email: '', signOut: () => {} });
export const useAuth = () => useContext(AuthContext);

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    const { error } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    else if (mode === 'signup') setNotice('Check your email to confirm your account, then sign in.');
  };

  if (!ready) return <div className="loading">Loading your next adventure…</div>;

  if (!session) return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">BACKLOGLY<small>Your backlog. Your next adventure.</small></div>
        <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p>Sign in to keep your backlog synced across devices.</p>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label>Password<input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></label>
        {error && <p className="error">{error}</p>}
        {notice && <p className="hint">{notice}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {mode === 'signin' ? <LogIn size={18} /> : <UserPlus size={18} />}
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
        <button type="button" className="switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice('') }}>
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );

  return (
    <AuthContext.Provider value={{ email: session.user.email ?? '', signOut: () => supabase.auth.signOut() }}>
      {children}
    </AuthContext.Provider>
  );
}
