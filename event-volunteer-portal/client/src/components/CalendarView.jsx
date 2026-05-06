import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarView({ events }) {
  const [cursor, setCursor] = useState(new Date());

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const byDay = useMemo(() => {
    const map = {};
    (events || []).forEach((e) => {
      const key = ymd(new Date(e.date));
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDow = first.getDay();
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4"/>
        </button>
        <div className="font-display font-semibold">{monthLabel}</div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-white/5"
        >
          <ChevronRight className="w-4 h-4"/>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="h-24"/>;
          const key = ymd(d);
          const todays = byDay[key] || [];
          const isToday = ymd(new Date()) === key;
          return (
            <div
              key={i}
              className={`relative h-24 rounded-lg p-1.5 border text-xs ${
                isToday ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              <div className={`font-mono text-[10px] ${isToday ? 'text-violet-300' : 'text-zinc-500'}`}>
                {d.getDate()}
              </div>
              <div className="mt-1 space-y-0.5 overflow-hidden">
                {todays.slice(0, 2).map((e) => (
                  <Link
                    key={e._id}
                    to={`/events/${e._id}`}
                    className="block truncate px-1.5 py-0.5 rounded text-[10px] hover:brightness-125"
                    style={{
                      background: `${e.bannerColor}22`,
                      color: e.bannerColor,
                      borderLeft: `2px solid ${e.bannerColor}`,
                    }}
                    title={e.title}
                  >
                    {e.title}
                  </Link>
                ))}
                {todays.length > 2 && (
                  <div className="text-[10px] text-zinc-500">+{todays.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
