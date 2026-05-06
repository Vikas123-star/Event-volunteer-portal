import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/events', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-3xl"/>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5}/>
          </div>
          <div>
            <div className="font-display font-bold text-xl">EVP</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 -mt-0.5">Volunteer Portal</div>
          </div>
        </Link>

        <div className="glass-strong p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-violet-500/20 blur-2xl"/>

          <h1 className="font-display text-3xl font-bold tracking-tight relative">Create your account</h1>
          <p className="text-zinc-400 mt-2 relative">Join events. Make impact.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4 relative">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
            </div>
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
              <label className="label">Password <span className="text-zinc-500 font-normal">(min 6 chars)</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {['student', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      form.role === r
                        ? 'bg-violet-500/15 border-violet-500/40 text-violet-200'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {r === 'admin' ? <ShieldCheck className="w-4 h-4 inline mr-1"/> : null}
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating...' : (<>Create account <ArrowRight className="w-4 h-4"/></>)}
            </button>
          </form>

          <div className="mt-6 text-sm text-zinc-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="link font-medium">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
