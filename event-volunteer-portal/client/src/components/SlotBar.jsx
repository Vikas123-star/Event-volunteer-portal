import { motion } from 'framer-motion';

export default function SlotBar({ filled, max, size = 'md' }) {
  const pct = Math.min(100, Math.round((filled / Math.max(max, 1)) * 100));
  const full = filled >= max;
  const h = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-zinc-400 font-mono">
          {filled} <span className="text-zinc-600">/</span> {max}
        </span>
        <span className={`font-mono ${full ? 'text-amber-300' : 'text-zinc-400'}`}>
          {full ? 'FULL' : `${max - filled} left`}
        </span>
      </div>
      <div className={`relative w-full ${h} rounded-full bg-white/5 overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-y-0 left-0 rounded-full ${
            full
              ? 'bg-gradient-to-r from-amber-500 to-red-500'
              : pct > 70
              ? 'bg-gradient-to-r from-violet-500 to-amber-400'
              : 'bg-gradient-to-r from-violet-500 to-indigo-500'
          }`}
        />
      </div>
    </div>
  );
}
