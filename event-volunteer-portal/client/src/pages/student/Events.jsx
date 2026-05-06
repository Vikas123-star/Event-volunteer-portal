import { useEffect, useMemo, useState } from 'react';
import { Search, CalendarDays, LayoutGrid, CalendarRange } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import EventCard from '../../components/EventCard.jsx';
import Empty from '../../components/Empty.jsx';
import CalendarView from '../../components/CalendarView.jsx';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'calendar'

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/events', { params });
      setEvents(data.events || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => events, [events]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">Discover</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Upcoming events</h1>
            <p className="text-zinc-400 mt-1">Find a cause. Claim your role.</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                view === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5"/> Grid
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                view === 'calendar' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5"/> Calendar
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by title..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
              />
            </div>
          </div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button onClick={fetchEvents} className="btn-primary">Apply filters</button>
          {(q || from || to) && (
            <button
              onClick={() => { setQ(''); setFrom(''); setTo(''); setTimeout(fetchEvents, 0); }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass h-80 animate-pulse"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            icon={CalendarDays}
            title="No events found"
            hint="Try clearing filters or check back soon — new events are added regularly."
          />
        ) : view === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ev, i) => (
              <EventCard key={ev._id} event={ev} index={i} />
            ))}
          </div>
        ) : (
          <CalendarView events={filtered}/>
        )}
      </motion.div>
    </div>
  );
}
