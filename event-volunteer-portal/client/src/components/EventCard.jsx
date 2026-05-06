import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/format';

export default function EventCard({ event, index = 0 }) {
  const totalMax = (event.roles || []).reduce((s, r) => s + r.maxSlots, 0);
  const totalFilled = (event.roles || []).reduce((s, r) => s + r.filledSlots, 0);
  const rolesCount = (event.roles || []).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link to={`/events/${event._id}`} className="block glass hover:border-violet-500/30 transition-all overflow-hidden noise-overlay">
        <div
          className="h-28 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${event.bannerColor || '#7c5cff'}, ${event.bannerColor || '#7c5cff'}99 50%, #0b0b12)`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}/>
          <div className="absolute top-3 left-3 chip-zinc bg-black/30 backdrop-blur border-white/20">
            <Calendar className="w-3 h-3"/> {formatDate(event.date)}
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] font-mono uppercase tracking-widest text-white/70">
            #{event._id.slice(-6)}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-xl font-semibold tracking-tight leading-tight line-clamp-2 group-hover:text-violet-200 transition-colors">
            {event.title}
          </h3>
          <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{event.description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {event.location && (
              <span className="chip-zinc"><MapPin className="w-3 h-3"/>{event.location}</span>
            )}
            <span className="chip-violet"><Users className="w-3 h-3"/>{rolesCount} role{rolesCount !== 1 ? 's' : ''}</span>
            {totalMax > 0 && (
              <span className={totalFilled >= totalMax ? 'chip-amber' : 'chip-green'}>
                {totalFilled}/{totalMax} volunteers
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
