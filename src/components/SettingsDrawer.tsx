import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/game/store';
import { Icon, type IconName } from './Icon';

/**
 * App-wide settings drawer. Mounted at App level and toggled via
 * `useGame().settingsOpen` so it can be opened from any screen's header.
 */
export function SettingsDrawer() {
  const open = useGame((s) => s.settingsOpen);
  const close = useGame((s) => s.closeSettings);
  const day = useGame((s) => s.day);
  const stage = useGame((s) => s.stage);
  const activity = useGame((s) => s.activityToday);
  const resetGame = useGame((s) => s.resetGame);
  const setScreen = useGame((s) => s.setScreen);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 z-[60] bg-ink-800/40 backdrop-blur-sm flex items-end justify-center"
        >
          <motion.div
            key="settings-sheet"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-xl shadow-el-4 overflow-hidden"
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-200" />
            </div>
            <div className="px-4 pt-2 pb-1 flex items-center justify-between border-b border-ink-100">
              <h2 className="font-semibold text-ink-800 text-[15px]">Menu</h2>
              <button
                onClick={close}
                className="w-8 h-8 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-500"
                aria-label="Close menu"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Quick navigation — every section, one tap. */}
            <ul className="divide-y divide-ink-100">
              <SectionLabel>Navigation</SectionLabel>
              <NavRow icon="chat"      label="Chat"     onClick={() => { setScreen('chat'); close(); }} />
              <NavRow icon="calendar"  label="Calendar" onClick={() => { setScreen('calendar'); close(); }} />
              <NavRow icon="inbox"     label="Inbox"    onClick={() => { setScreen('inbox'); close(); }} />
              <NavRow icon="dashboard" label="Home"     onClick={() => { setScreen('home');    close(); }} />
              <NavRow icon="people"    label="People"   onClick={() => { setScreen('people'); close(); }} />

              <SectionLabel>Today</SectionLabel>
              <InfoRow icon="briefcase" label="Stage"          value={`Stage ${stage} · Day ${day}`} />
              <InfoRow icon="history"   label="Activity log"   value={`${activity.length} event${activity.length === 1 ? '' : 's'}`} />

              <SectionLabel>Game</SectionLabel>
              <InfoRow icon="sparkle" label="About" value="Meeting Tycoon v0.7" />
              <li>
                <button
                  onClick={() => {
                    resetGame();
                    close();
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left text-rose-700 hover:bg-rose-50"
                >
                  <div className="w-8 h-8 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Icon name="x" size={15} />
                  </div>
                  <span className="flex-1 text-[13.5px] font-semibold">Restart game</span>
                  <Icon name="chevron-right" size={15} className="text-ink-400" />
                </button>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <li className="px-5 pt-3 pb-1.5 text-[10px] font-bold tracking-widest uppercase text-ink-400">
      {children}
    </li>
  );
}

function NavRow({
  icon,
  label,
  onClick,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-ink-50"
      >
        <div className="w-8 h-8 rounded-sm bg-ink-50 text-ink-600 flex items-center justify-center">
          <Icon name={icon} size={15} />
        </div>
        <span className="flex-1 text-[13.5px] font-semibold text-ink-800">{label}</span>
        <Icon name="chevron-right" size={15} className="text-ink-400" />
      </button>
    </li>
  );
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 px-5 py-2.5">
      <div className="w-8 h-8 rounded-sm bg-ink-50 text-ink-600 flex items-center justify-center">
        <Icon name={icon} size={15} />
      </div>
      <span className="flex-1 text-[13.5px] font-semibold text-ink-800">{label}</span>
      <span className="text-[12px] text-ink-400 font-medium">{value}</span>
    </li>
  );
}

/**
 * Reusable hamburger button for screen headers — opens the global drawer.
 */
export function MenuButton({ className }: { className?: string }) {
  const open = useGame((s) => s.openSettings);
  return (
    <button
      onClick={open}
      className={`w-8 h-8 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-600 ${className ?? ''}`}
      aria-label="Open menu"
    >
      <Icon name="menu" size={18} />
    </button>
  );
}
