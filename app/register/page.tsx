'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { register } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm]    = useState({ name: '', email: '', phone: '', password: '' });
  const [showPw, setShowPw]= useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    if (form.password.length < 8) { toast.error('Password minimal 8 karakter'); return; }
    setLoading(true);
    try {
      const r = await register(form);
      const d = r.data.data;
      setAuth(d.customer, d.token);
      toast.success('Akun berhasil dibuat!');
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registrasi gagal');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center py-16 bg-[var(--bg)]">
        <div className="w-full max-w-md">
          <div className="bg-white border border-[var(--border)] p-10">
            <h1 className="font-display text-4xl text-[var(--brand)] mb-2">DAFTAR</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">Buat akun GP RACING baru</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { k: 'name',  label: 'Nama Lengkap', type: 'text',  ph: 'Nama kamu' },
                { k: 'email', label: 'Email',         type: 'email', ph: 'email@example.com' },
                { k: 'phone', label: 'No. WhatsApp',  type: 'tel',   ph: '08xxxxxxxxx' },
              ].map(f => (
                <div key={f.k}>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2">{f.label}</label>
                  <input type={f.type} value={form[f.k as keyof typeof form]}
                    onChange={set(f.k)} className="input" placeholder={f.ph}
                    required={f.k !== 'phone'} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={set('password')} className="input pr-10"
                    placeholder="Min. 8 karakter" required minLength={8} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-4 text-base disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Mendaftarkan...' : 'Buat Akun'}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[var(--brand)] font-semibold hover:text-[var(--accent)] uppercase tracking-wide">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
