import { Icon, type IconName } from './Icon';

export type NavId = 'activity' | 'calendar' | 'inbox' | 'metrics' | 'more';

interface Props {
  active?: NavId;
  inboxCount?: number;
  onNavigate?: (id: NavId) => void;
}

interface Item { id: NavId; icon: IconName; label: string; }

const LEFT: Item[] = [
  { id: 'activity', icon: 'bell',      label: 'Activity' },
  { id: 'calendar', icon: 'calendar',  label: 'Calendar' },
];
const RIGHT: Item[] = [
  { id: 'metrics',  icon: 'dashboard', label: 'Metrics'  },
  { id: 'more',     icon: 'more-h',    label: 'More'     },
];

export function BottomNav({ active = 'calendar', inboxCount = 0, onNavigate }: Props) {
  return (
    <nav className="relative border-t border-ink-100 bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-end justify-around">
      {LEFT.map((it) => (
        <NavBtn key={it.id} item={it} active={active === it.id} onClick={() => onNavigate?.(it.id)} />
      ))}
      <button
        onClick={() => onNavigate?.('inbox')}
        aria-label="Inbox"
        className={`-mt-7 w-14 h-14 rounded-full ${active === 'inbox' ? 'bg-brand-700' : 'bg-brand-600'} text-white shadow-el-2 active:scale-95 transition flex items-center justify-center relative`}
      >
        <Icon name="inbox" size={22} />
        {inboxCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10.5px] font-bold flex items-center justify-center ring-2 ring-white">
            {inboxCount > 9 ? '9+' : inboxCount}
          </span>
        )}
      </button>
      {RIGHT.map((it) => (
        <NavBtn key={it.id} item={it} active={active === it.id} onClick={() => onNavigate?.(it.id)} />
      ))}
    </nav>
  );
}

function NavBtn({
  item,
  active,
  onClick,
}: {
  item: Item;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 pt-1 pb-0.5 text-[10.5px] font-medium tracking-tight ${
        active ? 'text-brand-600' : 'text-ink-400'
      }`}
    >
      <Icon name={item.icon} size={20} />
      <span>{item.label}</span>
    </button>
  );
}
