import { CheckCircle2, Clock, XCircle, Hourglass } from 'lucide-react';

const map = {
  confirmed: { cls: 'chip-green', Icon: CheckCircle2, label: 'Confirmed' },
  applied: { cls: 'chip-violet', Icon: Clock, label: 'Applied' },
  waitlisted: { cls: 'chip-amber', Icon: Hourglass, label: 'Waitlisted' },
  cancelled: { cls: 'chip-red', Icon: XCircle, label: 'Cancelled' },
};

export default function StatusBadge({ status }) {
  const item = map[status] || map.applied;
  const { Icon } = item;
  return (
    <span className={item.cls}>
      <Icon className="w-3 h-3" /> {item.label}
    </span>
  );
}
