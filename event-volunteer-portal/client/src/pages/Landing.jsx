import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, BarChart3, QrCode, Clock, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    { icon: Users, title: 'Slot-based Roles', desc: 'Define exact capacity per role. Zero overbooking, ever.' },
    { icon: Clock, title: 'Real-time Updates', desc: 'Live slot counts via WebSockets as students apply.' },
    { icon: Bell, title: 'Waitlist & Promote', desc: 'Auto-promote waitlisted volunteers when slots free up.' },
    { icon: QrCode, title: 'QR Check-in', desc: 'Each confirmed volunteer gets a QR for event day.' },
    { icon: BarChart3, title: 'Admin Analytics', desc: 'Charts, popular roles, fill rates — at a glance.' },
    { icon: Zap, title: 'Instant Confirmation', desc: 'Atomic slot reservation + email notification.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/20 blur-3xl rounded-full"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-28 pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              Built for modern event organizers
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05]">
              <span className="title-gradient">Recruit volunteers</span>
              <br/>
              <span className="text-zinc-100">without the chaos.</span>
            </h1>

            <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
              A centralized platform for event organizers and students — slot-based applications,
              real-time updates, waitlist auto-promotion, and a beautiful admin console.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/events'} className="btn-primary px-6 py-3">
                  Go to {user.role === 'admin' ? 'Dashboard' : 'Events'} <ArrowRight className="w-4 h-4"/>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary px-6 py-3">
                    Get started <ArrowRight className="w-4 h-4"/>
                  </Link>
                  <Link to="/login" className="btn-secondary px-6 py-3">Sign in</Link>
                </>
              )}
            </div>

            <div className="mt-6 text-xs text-zinc-500 font-mono">
              admin@evp.com · admin123 &nbsp;·&nbsp; nithin@evp.com · student123
            </div>
          </motion.div>

          {/* Decorative preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/20 to-amber-500/10 blur-2xl rounded-3xl"/>
            <div className="relative glass-strong p-2 overflow-hidden">
              <div className="bg-ink-900 rounded-xl p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { color: '#7c5cff', title: 'TechFest 2026', filled: 9, max: 13 },
                    { color: '#22c55e', title: 'Tree Plantation', filled: 5, max: 9 },
                    { color: '#f59e0b', title: 'Cultural Night', filled: 7, max: 13 },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="glass p-4"
                    >
                      <div className="h-20 rounded-lg mb-3" style={{
                        background: `linear-gradient(135deg, ${card.color}, ${card.color}88 50%, transparent)`,
                      }}/>
                      <div className="font-display font-semibold text-sm">{card.title}</div>
                      <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
                          style={{ width: `${(card.filled/card.max)*100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mt-1.5 font-mono">
                        <span>{card.filled}/{card.max} volunteers</span>
                        <span>{card.max - card.filled} left</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-3">Everything you need</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Built for the realities of running events.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.05 }}
                className="glass p-6 hover:border-violet-500/30 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-violet-300"/>
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-xs text-zinc-500">
        Built with MERN · Socket.io · Tailwind · Framer Motion
      </footer>
    </div>
  );
}
