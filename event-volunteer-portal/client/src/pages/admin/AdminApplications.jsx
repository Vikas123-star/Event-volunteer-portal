import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Users, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import StatusBadge from '../../components/StatusBadge.jsx';
import Empty from '../../components/Empty.jsx';
import { formatDate, fromNow, downloadBlob } from '../../utils/format';

export default function AdminApplications() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/events').then(({ data }) => setEvents(data.events || []));
  }, []);

  const selectedEvent = useMemo(
    () => events.find((e) => e._id === eventId),
    [events, eventId]
  );

  const load = async () => {
    if (!eventId) {
      setApps([]);
      return;
    }
    setLoading(true);
    try {
      const params = {};
      if (roleId) params.roleId = roleId;
      if (status) params.status = status;
      const { data } = await api.get(`/events/${eventId}/applications`, { params });
      setApps(data.applications || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId, roleId, status]);

  const exportCSV = async () => {
    try {
      const params = {};
      if (eventId) params.eventId = eventId;
      if (roleId) params.roleId = roleId;
      if (status) params.status = status;
      const res = await api.get('/export/volunteers', { params, responseType: 'blob' });
      const filename = selectedEvent
        ? `volunteers-${selectedEvent.title.replace(/\s+/g, '_')}.csv`
        : 'volunteers.csv';
      downloadBlob(res.data, filename);
      toast.success('CSV downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const statusCounts = useMemo(() => {
    const c = { confirmed: 0, waitlisted: 0, cancelled: 0, applied: 0 };
    apps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [apps]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">Volunteer roster</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Applications</h1>
            <p className="text-zinc-400 mt-1">Review volunteer applications by event and role.</p>
          </div>
          <button onClick={exportCSV} disabled={!eventId} className="btn-primary">
            <Download className="w-4 h-4"/> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="glass p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest mb-3">
            <Filter className="w-3.5 h-3.5"/> Filters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">Event</label>
              <select className="input" value={eventId} onChange={(e) => { setEventId(e.target.value); setRoleId(''); }}>
                <option value="">— Select an event —</option>
                {events.map((e) => (
                  <option key={e._id} value={e._id}>{e.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={!selectedEvent}>
                <option value="">All roles</option>
                {selectedEvent?.roles?.map((r) => (
                  <option key={r._id} value={r._id}>{r.roleName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="cancelled">Cancelled</option>
                <option value="applied">Applied</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stat pills */}
        {eventId && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {[
              ['Confirmed', statusCounts.confirmed, 'text-emerald-300'],
              ['Waitlisted', statusCounts.waitlisted, 'text-amber-300'],
              ['Cancelled', statusCounts.cancelled, 'text-red-300'],
              ['Total', apps.length, 'text-violet-300'],
            ].map(([label, val, cls]) => (
              <div key={label} className="glass px-4 py-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
                <div className={`font-display text-2xl font-bold ${cls}`}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {!eventId ? (
          <Empty icon={Users} title="Select an event" hint="Pick an event from the filter above to view its volunteer applications."/>
        ) : loading ? (
          <div className="glass h-64 animate-pulse"/>
        ) : apps.length === 0 ? (
          <Empty icon={Users} title="No applications yet" hint="No one has applied matching these filters."/>
        ) : (
          <div className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500 bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Volunteer</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {apps.map((a) => (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {a.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{a.userId?.name}</div>
                            <div className="text-xs text-zinc-500 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0"/>{a.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{a.roleId?.roleName}</td>
                      <td className="px-4 py-3"><StatusBadge status={a.status}/></td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        <div>{formatDate(a.appliedAt)}</div>
                        <div className="text-zinc-500">{fromNow(a.appliedAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
