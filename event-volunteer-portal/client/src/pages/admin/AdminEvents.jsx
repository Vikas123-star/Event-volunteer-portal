import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, CalendarDays, Users } from 'lucide-react';
import api from '../../utils/api';
import Modal from '../../components/Modal.jsx';
import SlotBar from '../../components/SlotBar.jsx';
import Empty from '../../components/Empty.jsx';
import { formatDate } from '../../utils/format';

const COLORS = ['#7c5cff', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8', '#a78bfa', '#ec4899'];

function EventForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', date: '', location: '', bannerColor: '#7c5cff',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[100px]" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input type="datetime-local" className="input" required
            value={form.date ? new Date(form.date).toISOString().slice(0, 16) : ''}
            onChange={(e) => setForm({ ...form, date: e.target.value })}/>
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/>
        </div>
      </div>
      <div>
        <label className="label">Banner color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, bannerColor: c })}
              className={`w-9 h-9 rounded-lg border-2 transition ${form.bannerColor === c ? 'border-white scale-110' : 'border-white/20'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}

function RolesManager({ event, onChange }) {
  const [form, setForm] = useState({ roleName: '', maxSlots: 5, description: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const addRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/events/${event._id}/roles`, form);
      toast.success('Role added');
      setForm({ roleName: '', maxSlots: 5, description: '' });
      onChange();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const saveEdit = async (role) => {
    try {
      await api.put(`/roles/${role._id}`, editing);
      toast.success('Role updated');
      setEditing(null);
      onChange();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  const delRole = async (id) => {
    if (!confirm('Delete this role? All applications for it will be removed.')) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted');
      onChange();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <form onSubmit={addRole} className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2 mb-4">
        <input className="input" placeholder="Role name (e.g. Registration Desk)" required
          value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}/>
        <input type="number" min={1} className="input" placeholder="Slots" required
          value={form.maxSlots} onChange={(e) => setForm({ ...form, maxSlots: e.target.value })}/>
        <button className="btn-primary" disabled={loading}><Plus className="w-4 h-4"/>Add</button>
      </form>

      {(event.roles || []).length === 0 ? (
        <div className="text-sm text-zinc-500 py-6 text-center">No roles yet. Add one above.</div>
      ) : (
        <div className="space-y-2">
          {event.roles.map((r) => (
            <div key={r._id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              {editing && editing._id === r._id ? (
                <div className="space-y-2">
                  <input className="input" value={editing.roleName}
                    onChange={(e) => setEditing({ ...editing, roleName: e.target.value })}/>
                  <textarea className="input min-h-[60px]" placeholder="Description (optional)"
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}/>
                  <input type="number" min={r.filledSlots} className="input w-32" value={editing.maxSlots}
                    onChange={(e) => setEditing({ ...editing, maxSlots: e.target.value })}/>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
                    <button onClick={() => saveEdit(r)} className="btn-primary">Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-medium">{r.roleName}</div>
                    {r.description && <div className="text-xs text-zinc-400 mt-0.5">{r.description}</div>}
                    <div className="mt-2 max-w-xs"><SlotBar filled={r.filledSlots} max={r.maxSlots} size="sm"/></div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing({ _id: r._id, roleName: r.roleName, maxSlots: r.maxSlots, description: r.description })}
                            className="btn-secondary p-2"><Edit3 className="w-4 h-4"/></button>
                    <button onClick={() => delRole(r._id)} className="btn-danger p-2"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [managingRoles, setManagingRoles] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events');
      setEvents(data.events || []);
      if (managingRoles) {
        const refreshed = (data.events || []).find((e) => e._id === managingRoles._id);
        if (refreshed) setManagingRoles(refreshed);
      }
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const createEvent = async (form) => {
    try {
      await api.post('/events', form);
      toast.success('Event created');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
      throw err;
    }
  };

  const updateEvent = async (form) => {
    try {
      await api.put(`/events/${editing._id}`, form);
      toast.success('Event updated');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
      throw err;
    }
  };

  const delEvent = async (id) => {
    if (!confirm('Delete this event? All roles and applications will be removed.')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">Management</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Events</h1>
            <p className="text-zinc-400 mt-1">Create, edit, and manage volunteer roles for each event.</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="w-4 h-4"/> Create Event
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass h-32 animate-pulse"/>)}
          </div>
        ) : events.length === 0 ? (
          <Empty icon={CalendarDays} title="No events yet" hint="Create your first event to get started."
                 action={<button onClick={() => setCreating(true)} className="btn-primary">Create Event</button>}/>
        ) : (
          <div className="grid gap-3">
            {events.map((ev, i) => {
              const totalFilled = ev.roles.reduce((s, r) => s + r.filledSlots, 0);
              const totalMax = ev.roles.reduce((s, r) => s + r.maxSlots, 0);
              return (
                <motion.div
                  key={ev._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass p-5"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-1.5 self-stretch rounded-full" style={{ background: ev.bannerColor }}/>
                    <div className="flex-1 min-w-[240px]">
                      <h3 className="font-display text-lg font-semibold">{ev.title}</h3>
                      <div className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{ev.description}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="chip-zinc"><CalendarDays className="w-3 h-3"/>{formatDate(ev.date)}</span>
                        <span className="chip-violet"><Users className="w-3 h-3"/>{ev.roles.length} roles · {totalFilled}/{totalMax}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setManagingRoles(ev)} className="btn-secondary">
                        <Users className="w-4 h-4"/>Roles
                      </button>
                      <button onClick={() => setEditing(ev)} className="btn-secondary p-2"><Edit3 className="w-4 h-4"/></button>
                      <button onClick={() => delEvent(ev._id)} className="btn-danger p-2"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Create event" maxW="max-w-xl">
        <EventForm onSubmit={createEvent} onClose={() => setCreating(false)}/>
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit event" maxW="max-w-xl">
        {editing && <EventForm initial={editing} onSubmit={updateEvent} onClose={() => setEditing(null)}/>}
      </Modal>
      <Modal open={!!managingRoles} onClose={() => setManagingRoles(null)}
             title={managingRoles ? `Roles · ${managingRoles.title}` : 'Roles'} maxW="max-w-2xl">
        {managingRoles && <RolesManager event={managingRoles} onChange={load}/>}
      </Modal>
    </div>
  );
}
