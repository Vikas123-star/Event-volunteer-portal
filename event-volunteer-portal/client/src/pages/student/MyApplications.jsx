import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar, MapPin, QrCode as QrIcon, Trash2, Inbox } from 'lucide-react';
import api from '../../utils/api';
import StatusBadge from '../../components/StatusBadge.jsx';
import Modal from '../../components/Modal.jsx';
import Empty from '../../components/Empty.jsx';
import { formatDate } from '../../utils/format';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrApp, setQrApp] = useState(null);
  const [qrUrl, setQrUrl] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/applications/me');
      setApps(data.applications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      toast.success('Application cancelled');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  const showQR = async (app) => {
    try {
      const { data } = await api.get(`/applications/${app._id}/qr`);
      setQrApp(app);
      setQrUrl(data.qr);
    } catch {
      toast.error('Could not generate QR');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">Your journey</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">My applications</h1>
        <p className="text-zinc-400 mt-1 mb-6">Track status, view QR passes, and manage volunteering.</p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass h-28 animate-pulse"/>)}
          </div>
        ) : apps.length === 0 ? (
          <Empty
            icon={Inbox}
            title="No applications yet"
            hint="Browse events and apply for a role to get started."
            action={<Link to="/events" className="btn-primary">Browse events</Link>}
          />
        ) : (
          <div className="space-y-3">
            {apps.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass p-5 hover:border-violet-500/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/events/${a.eventId?._id}`} className="font-display text-lg font-semibold hover:text-violet-200">
                        {a.eventId?.title}
                      </Link>
                      <StatusBadge status={a.status}/>
                    </div>
                    <div className="text-sm text-zinc-400 mt-1">
                      Role: <span className="text-zinc-200 font-medium">{a.roleId?.roleName}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="chip-zinc"><Calendar className="w-3 h-3"/>{formatDate(a.eventId?.date)}</span>
                      {a.eventId?.location && <span className="chip-zinc"><MapPin className="w-3 h-3"/>{a.eventId.location}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {a.status === 'confirmed' && (
                      <button onClick={() => showQR(a)} className="btn-secondary">
                        <QrIcon className="w-4 h-4"/> QR Pass
                      </button>
                    )}
                    {['confirmed', 'applied', 'waitlisted'].includes(a.status) && (
                      <button onClick={() => cancel(a._id)} className="btn-danger">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Modal open={!!qrApp} onClose={() => { setQrApp(null); setQrUrl(''); }} title="Your volunteer QR pass">
        {qrApp && (
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Show this at check-in</div>
            <div className="font-display text-lg font-semibold">{qrApp.eventId?.title}</div>
            <div className="text-sm text-zinc-400 mb-4">{qrApp.roleId?.roleName}</div>
            {qrUrl && (
              <div className="inline-block p-4 bg-white rounded-2xl">
                <img src={qrUrl} alt="QR" className="w-64 h-64"/>
              </div>
            )}
            <div className="mt-4 text-xs text-zinc-500 font-mono">#{qrApp._id.slice(-10).toUpperCase()}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
