'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const r = await login({ email, password });
      const d = r.data.data;
      setAuth(d.customer, d.token);
      toast.success(`Selamat datang, ${d.customer.name}!`);
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login gagal');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center py-16 bg-[var(--bg)]">
        <div className="w-full max-w-md">
          <div className="bg-white border border-[var(--border)] p-10">
            <h1 className="font-display text-4xl text-[var(--brand)] mb-2">LOGIN</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">Masuk ke akun GP Racing Store</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="email@example.com" required />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pr-10" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Loading...' : 'Masuk'}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[var(--brand)] font-semibold hover:text-[var(--accent)] uppercase tracking-wide">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
