import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useGame } from './game/store';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav, type NavId } from './components/BottomNav';
import { ChaosModal } from './components/ChaosModal';
import { MeetingDetailSheet } from './components/MeetingDetailSheet';
import { Onboarding } from './screens/Onboarding';
import { CalendarScreen } from './screens/Calendar';
import { InboxScreen } from './screens/Inbox';
import { DaySummary } from './screens/DaySummary';
import { Metrics } from './screens/Metrics';
import { Activity } from './screens/Activity';
import { More } from './screens/More';
import { GameOver } from './screens/GameOver';
import { StageUnlock } from './screens/StageUnlock';
import { pendingRequestsFor } from './game/store';

const ANIM = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

/** Screens that show the persistent bottom nav. */
const NAV_SCREENS = new Set<string>(['calendar', 'inbox', 'activity', 'metrics', 'more']);

export function App() {
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const gameOver = useGame((s) => s.gameOver);
  const stageUnlocked = useGame((s) => s.stageUnlocked);
  const day = useGame((s) => s.day);
  const accepted = useGame((s) => s.acceptedRequestIds);
  const schedule = useGame((s) => s.schedule);

  // Auto-route into game-over / stage-unlock when they fire.
  useEffect(() => {
    if (gameOver && screen !== 'game-over') setScreen('game-over');
    else if (stageUnlocked && !gameOver && screen !== 'stage-unlock') setScreen('stage-unlock');
  }, [gameOver, stageUnlocked, screen, setScreen]);

  const inboxCount = useMemo(
    () => pendingRequestsFor(day, accepted, schedule).length,
    [day, accepted, schedule],
  );

  const showBottomNav = NAV_SCREENS.has(screen);

  const navActive: NavId | undefined =
    screen === 'activity'  ? 'activity'  :
    screen === 'calendar'  ? 'calendar'  :
    screen === 'inbox'     ? 'inbox'     :
    screen === 'metrics'   ? 'metrics'   :
    screen === 'more'      ? 'more'      :
    undefined;

  const content = (() => {
    switch (screen) {
      case 'onboarding':   return <Onboarding key="onboarding" />;
      case 'calendar':     return <CalendarScreen key="calendar" />;
      case 'inbox':        return <InboxScreen key="inbox" />;
      case 'day-summary':  return <DaySummary key="day-summary" />;
      case 'metrics':      return <Metrics key="metrics" />;
      case 'activity':     return <Activity key="activity" />;
      case 'more':         return <More key="more" />;
      case 'game-over':    return <GameOver key="game-over" />;
      case 'stage-unlock': return <StageUnlock key="stage-unlock" />;
    }
  })();

  return (
    <PhoneFrame
      bottomNav={
        showBottomNav ? (
          <BottomNav
            active={navActive}
            inboxCount={inboxCount}
            onNavigate={(id) => setScreen(id as 'calendar' | 'inbox' | 'activity' | 'metrics' | 'more')}
          />
        ) : null
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={screen} {...ANIM} className="h-full">
          {content}
        </motion.div>
      </AnimatePresence>
      {/* Chaos modal — only meaningful while accepting requests in the Inbox. */}
      {screen === 'inbox' && <ChaosModal />}
      {/* Meeting detail bottom-sheet — anchored to whichever screen is showing the calendar. */}
      {(screen === 'calendar' || screen === 'inbox') && <MeetingDetailSheet />}
    </PhoneFrame>
  );
}
