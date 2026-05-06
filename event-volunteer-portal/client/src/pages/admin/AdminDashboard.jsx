import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { CalendarPlus, CalendarDays, Users, TrendingUp, Percent, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import StatusBadge from '../../components/StatusBadge.jsx';
import { fromNow } from '../../utils/format';

const colors = ['#7c5cff', '#f59e0b', '#22c55e', '#38bdf8', '#ef4444', '#a78bfa'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <div className="grid md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass h-28 animate-pulse"/>)}
        </div>
        <div className="glass h-64 animate-pulse"/>
      </div>
    );
  }

  const { totals, perEvent, popularRoles, recent } = stats;

  const tiles = [
    { label: 'Events', value: totals.totalEvents, icon: CalendarDays, color: 'from-violet-500 to-indigo-600' },
    { label: 'Applications', value: totals.totalApplications, icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
    { label: 'Volunteers', value: totals.totalVolunteers, icon: Users, color: 'from-emerald-500 to-teal-600' },
    { label: 'Fill rate', value: `${totals.fillPercent}%`, icon: Percent, color: 'from-sky-500 to-blue-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">Command center</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-1">A bird's-eye view of your events and volunteers.</p>
          </div>
          <Link to="/admin/events" className="btn-primary">
            <CalendarPlus className="w-4 h-4"/> Manage Events
          </Link>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {tiles.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-5 relative overflow-hidden"
            >
              <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-30 bg-gradient-to-br ${color}`}/>
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white"/>
                </div>
                <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold">Applications per event</h3>
                <div className="text-xs text-zinc-500">Top 6 events by volunteer interest</div>
              </div>
            </div>
            {perEvent.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={perEvent} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10"/>
                  <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#a1a1aa' }} interval={0} angle={-20} textAnchor="end" height={60}/>
                  <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} allowDecimals={false}/>
                  <Tooltip
                    contentStyle={{ background: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    cursor={{ fill: 'rgba(124,92,255,0.08)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {perEvent.map((_, i) => <Cell key={i} fill={colors[i % colors.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass p-5">
            <h3 className="font-display font-semibold">Most popular roles</h3>
            <div className="text-xs text-zinc-500 mb-4">Distribution of applications across roles</div>
            {popularRoles.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={popularRoles}
                    dataKey="count"
                    nameKey="roleName"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {popularRoles.map((_, i) => <Cell key={i} fill={colors[i % colors.length]}/>)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent */}
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Recent applications</h3>
              <div className="text-xs text-zinc-500">Latest 8 submissions</div>
            </div>
            <Link to="/admin/applications" className="text-xs text-violet-300 hover:text-violet-200 inline-flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">No applications yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recent.map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {a.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {a.userId?.name} <span className="text-zinc-500 font-normal">applied for</span> {a.roleId?.roleName}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">{a.eventId?.title} · {fromNow(a.appliedAt)}</div>
                    </div>
                  </div>
                  <StatusBadge status={a.status}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
