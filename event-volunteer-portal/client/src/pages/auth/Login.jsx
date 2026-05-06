import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const to = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/events');
      navigate(to, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@evp.com', password: 'admin123' });
    else setForm({ email: 'nithin@evp.com', password: 'student123' });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left - Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5}/>
            </div>
            <div>
              <div className="font-display font-bold text-xl">EVP</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 -mt-0.5">Volunteer Portal</div>
            </div>
          </Link>

          <h1 className="font-display text-4xl font-bold tracking-tight">Welcome back.</h1>
          <p className="text-zinc-400 mt-2">Sign in to continue your volunteer journey.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : (<>Sign in <ArrowRight className="w-4 h-4"/></>)}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="text-xs text-zinc-500 mb-3 uppercase tracking-widest">Demo accounts</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo('admin')} className="btn-secondary text-xs">
                Admin demo
              </button>
              <button onClick={() => fillDemo('student')} className="btn-secondary text-xs">
                Student demo
              </button>
            </div>
          </div>

          <div className="mt-8 text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="link font-medium">Create one</Link>
          </div>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden md:flex relative items-center justify-center overflow-hidden p-12 bg-ink-900">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl"/>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"/>
          <div className="absolute inset-0 bg-grid-faint" style={{ backgroundSize: '60px 60px' }}/>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md"
        >
          <div className="glass-strong p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-500/20 blur-2xl"/>
            <div className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-3">Now live</div>
            <h2 className="font-display text-3xl font-bold leading-tight title-gradient">
              Where events find their volunteers.
            </h2>
            <p className="text-zinc-400 mt-4 leading-relaxed">
              Post events, define roles, and watch motivated students fill every slot —
              with real-time updates, waitlist auto-promotion, and QR check-in.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                ['Events', '120+'],
                ['Volunteers', '2.4k'],
                ['Hours', '18k'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="font-display text-2xl font-bold">{v}</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 text-xs text-zinc-500 font-mono">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            System operational · Real-time enabled
          </div>
        </motion.div>
      </div>
    </div>
  );
}
