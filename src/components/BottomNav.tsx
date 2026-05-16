import { Icon, type IconName } from './Icon';

export type NavId = 'chat' | 'calendar' | 'inbox' | 'home' | 'people';

interface Props {
  active?: NavId;
  inboxCount?: number;
  chatUnread?: number;
  onNavigate?: (id: NavId) => void;
}

interface Item { id: NavId; icon: IconName; label: string; }

const LEFT: Item[] = [
  { id: 'chat',     icon: 'chat',     label: 'Chat'     },
  { id: 'calendar', icon: 'calendar', label: 'Calendar' },
];
const RIGHT: Item[] = [
  { id: 'inbox',  icon: 'inbox',  label: 'Inbox'  },
  { id: 'people', icon: 'people', label: 'People' },
];

export function BottomNav({ active = 'home', inboxCount = 0, chatUnread = 0, onNavigate }: Props) {
  return (
    <nav className="relative border-t border-ink-100 bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-end justify-around">
      {LEFT.map((it) => (
        <NavBtn
          key={it.id}
          item={it}
          active={active === it.id}
          onClick={() => onNavigate?.(it.id)}
          badge={it.id === 'chat' ? chatUnread : 0}
        />
      ))}

      {/* Center FAB — Home is the orchestration hub */}
      <button
        onClick={() => onNavigate?.('home')}
        aria-label="Home"
        className={`-mt-7 w-14 h-14 rounded-full ${
          active === 'home' ? 'bg-brand-700 ring-4 ring-brand-100' : 'bg-brand-600'
        } text-white shadow-el-2 active:scale-95 transition flex items-center justify-center`}
      >
        <Icon name="home" size={22} />
      </button>

      {RIGHT.map((it) => (
        <NavBtn
          key={it.id}
          item={it}
          active={active === it.id}
          onClick={() => onNavigate?.(it.id)}
          badge={it.id === 'inbox' ? inboxCount : 0}
        />
      ))}
    </nav>
  );
}

function NavBtn({
  item,
  active,
  badge,
  onClick,
}: {
  item: Item;
  active: boolean;
  badge: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 px-3 pt-1 pb-0.5 text-[10.5px] font-medium tracking-tight ${
        active ? 'text-brand-600' : 'text-ink-400'
      }`}
    >
      <span className="relative">
        <Icon name={item.icon} size={20} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span>{item.label}</span>
    </button>
  );
}
