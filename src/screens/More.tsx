import { useGame } from '@/game/store';
import { Icon, type IconName } from '@/components/Icon';

interface Row {
  icon: IconName;
  label: string;
  detail?: string;
  onClick?: () => void;
  tone?: 'default' | 'danger';
}

export function More() {
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);
  const resetGame = useGame((s) => s.resetGame);

  const rows: Row[] = [
    { icon: 'briefcase', label: 'Stage',        detail: `Stage ${stage} · Day ${day}` },
    { icon: 'target',    label: 'Goals',        detail: 'See Metrics tab' },
    { icon: 'sparkle',   label: 'About',        detail: 'Meeting Tycoon v0.4' },
    { icon: 'x',         label: 'Restart game', tone: 'danger', onClick: resetGame },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 border-b border-ink-100">
        <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
          Settings
        </div>
        <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">More</h1>
      </div>
      <ul className="divide-y divide-ink-100">
        {rows.map((r) => (
          <li key={r.label}>
            <button
              onClick={r.onClick}
              disabled={!r.onClick}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition ${
                r.onClick ? 'hover:bg-ink-50 active:bg-ink-100' : 'cursor-default'
              } ${r.tone === 'danger' ? 'text-rose-700' : 'text-ink-800'}`}
            >
              <div
                className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                  r.tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-ink-50 text-ink-600'
                }`}
              >
                <Icon name={r.icon} size={15} />
              </div>
              <span className="flex-1 text-[13.5px] font-semibold">{r.label}</span>
              {r.detail && (
                <span className="text-[12px] text-ink-400 font-medium">{r.detail}</span>
              )}
              {r.onClick && <Icon name="chevron-right" size={15} className="text-ink-400" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
