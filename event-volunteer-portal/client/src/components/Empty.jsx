import { Inbox } from 'lucide-react';

export default function Empty({ title = 'Nothing here yet', hint, icon: Icon = Inbox, action }) {
  return (
    <div className="glass py-16 px-6 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mb-4">
        <Icon className="w-6 h-6 text-zinc-400"/>
      </div>
      <div className="font-display text-lg font-semibold">{title}</div>
      {hint && <div className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">{hint}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
