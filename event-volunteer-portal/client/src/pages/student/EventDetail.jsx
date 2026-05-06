import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Hourglass } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import SlotBar from '../../components/SlotBar.jsx';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
      if (user) {
        const { data: m } = await api.get('/applications/me');
        setMyApps(m.applications || []);
      }
    } catch {
      toast.error('Could not load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  // Real-time slot updates
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('event:join', id);
    const onUpdate = (role) => {
      setEvent((ev) => {
        if (!ev) return ev;
        const roles = ev.roles.map((r) => (String(r._id) === String(role._id) ? { ...r, ...role } : r));
        return { ...ev, roles };
      });
    };
    socket.on('role:update', onUpdate);
    return () => {
      socket.emit('event:leave', id);
      socket.off('role:update', onUpdate);
    };
  }, [socket, id]);

  const apply = async (roleId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(roleId);
    try {
      const { data } = await api.post('/applications', { roleId });
      toast.success(data.application.status === 'confirmed' ? '🎉 Application confirmed!' : '⏳ Added to waitlist');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not apply');
    } finally {
      setApplying(null);
    }
  };

  if (loading || !event) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="glass h-64 animate-pulse"/>
      </div>
    );
  }

  const myRoleIds = new Set(myApps.filter((a) => a.status !== 'cancelled').map((a) => String(a.roleId?._id || a.roleId)));

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-6">
        <ArrowLeft className="w-4 h-4"/> Back to events
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6" style={{
          background: `linear-gradient(135deg, ${event.bannerColor || '#7c5cff'}, ${event.bannerColor || '#7c5cff'}66 60%, #0b0b12)`,
        }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]"/>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}/>
          <div className="relative p-8 md:p-10">
            <div className="inline-flex items-center gap-2 chip-zinc bg-black/30 backdrop-blur border-white/20 mb-4">
              <Calendar className="w-3 h-3"/> {formatDate(event.date)}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {event.location && (
                <span className="chip-zinc bg-black/30 border-white/20"><MapPin className="w-3 h-3"/>{event.location}</span>
              )}
              <span className="chip-zinc bg-black/30 border-white/20"><Users className="w-3 h-3"/>{event.roles.length} role{event.roles.length !== 1 ? 's' : ''}</span>
              {event.createdBy?.name && (
                <span className="chip-zinc bg-black/30 border-white/20">Organized by {event.createdBy.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass p-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">About</div>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
        </div>

        {/* Roles */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Volunteer roles</h2>
          <span className="text-xs text-zinc-500 font-mono">
            {event.roles.reduce((s, r) => s + r.filledSlots, 0)}/{event.roles.reduce((s, r) => s + r.maxSlots, 0)} total
          </span>
        </div>

        {event.roles.length === 0 ? (
          <div className="glass p-8 text-center text-zinc-500">No roles have been added yet.</div>
        ) : (
          <div className="grid gap-3">
            {event.roles.map((role, idx) => {
              const full = role.filledSlots >= role.maxSlots;
              const alreadyApplied = myRoleIds.has(String(role._id));
              return (
                <motion.div
                  key={role._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass p-5 hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[240px]">
                      <h3 className="font-display text-lg font-semibold">{role.roleName}</h3>
                      {role.description && (
                        <p className="text-sm text-zinc-400 mt-1">{role.description}</p>
                      )}
                      <div className="mt-3 max-w-md">
                        <SlotBar filled={role.filledSlots} max={role.maxSlots}/>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {alreadyApplied ? (
                        <span className="chip-green"><CheckCircle2 className="w-3 h-3"/>Applied</span>
                      ) : full ? (
                        <button
                          onClick={() => apply(role._id)}
                          disabled={applying === role._id}
                          className="btn-amber"
                        >
                          <Hourglass className="w-4 h-4"/> Join Waitlist
                        </button>
                      ) : (
                        <button
                          onClick={() => apply(role._id)}
                          disabled={applying === role._id || !user}
                          className="btn-primary"
                        >
                          {applying === role._id ? 'Applying...' : 'Apply'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!user && (
          <div className="glass p-4 mt-6 text-center text-sm text-zinc-400">
            <Link to="/login" className="link">Sign in</Link> or{' '}
            <Link to="/register" className="link">register</Link> to apply for a role.
          </div>
        )}
      </motion.div>
    </div>
  );
}
