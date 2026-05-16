import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useGame } from './game/store';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav, type NavId } from './components/BottomNav';
import { ChaosModal } from './components/ChaosModal';
import { MeetingDetailSheet } from './components/MeetingDetailSheet';
import { KpiToast } from './components/KpiToast';
import { SettingsDrawer } from './components/SettingsDrawer';
import { Onboarding } from './screens/Onboarding';
import { CalendarScreen } from './screens/Calendar';
import { InboxScreen } from './screens/Inbox';
import { ChatScreen } from './screens/Chat';
import { ChatThread } from './screens/ChatThread';
import { DaySummary } from './screens/DaySummary';
import { Home } from './screens/Home';
import { People } from './screens/People';
import { GameOver } from './screens/GameOver';
import { StageUnlock } from './screens/StageUnlock';
import { pendingRequestsFor } from './game/store';

const ANIM = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

const NAV_SCREENS = new Set<string>(['calendar', 'inbox', 'chat', 'home', 'people']);

export function App() {
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const gameOver = useGame((s) => s.gameOver);
  const stageUnlocked = useGame((s) => s.stageUnlocked);
  const day = useGame((s) => s.day);
  const accepted = useGame((s) => s.acceptedRequestIds);
  const schedule = useGame((s) => s.schedule);
  const conversations = useGame((s) => s.conversations);
  const openConversationId = useGame((s) => s.openConversationId);
  const readIds = useGame((s) => s.readConversationIds);

  useEffect(() => {
    if (gameOver && screen !== 'game-over') setScreen('game-over');
    else if (stageUnlocked && !gameOver && screen !== 'stage-unlock') setScreen('stage-unlock');
  }, [gameOver, stageUnlocked, screen, setScreen]);

  const inboxCount = useMemo(
    () => pendingRequestsFor(day, accepted, schedule).length,
    [day, accepted, schedule],
  );
  // Chat unread = any conversation with pending reply not yet opened, or any
  // group/meeting whose newest message landed after we last visited Chat list.
  const chatUnread = useMemo(() => {
    let n = 0;
    for (const c of conversations) {
      if (c.pendingReplyOptions && !readIds.includes(c.id)) n++;
    }
    return n;
  }, [conversations, readIds]);

  const showBottomNav = NAV_SCREENS.has(screen);

  const navActive: NavId | undefined =
    screen === 'chat'      ? 'chat'      :
    screen === 'calendar'  ? 'calendar'  :
    screen === 'inbox'     ? 'inbox'     :
    screen === 'home'      ? 'home'      :
    screen === 'people'    ? 'people'    :
    undefined;

  const content = (() => {
    switch (screen) {
      case 'onboarding':   return <Onboarding key="onboarding" />;
      case 'calendar':     return <CalendarScreen key="calendar" />;
      case 'inbox':        return <InboxScreen key="inbox" />;
      case 'chat':         return <ChatScreen key="chat" />;
      case 'day-summary':  return <DaySummary key="day-summary" />;
      case 'home':         return <Home key="home" />;
      case 'people':       return <People key="people" />;
      case 'game-over':    return <GameOver key="game-over" />;
      case 'stage-unlock': return <StageUnlock key="stage-unlock" />;
    }
  })();

  // ChatThread is rendered as a full-screen overlay on top of any nav screen
  // when openConversationId is set — mimics opening a chat thread in Teams.
  const threadOpen = !!openConversationId && showBottomNav;

  return (
    <PhoneFrame
      bottomNav={
        showBottomNav && !threadOpen ? (
          <BottomNav
            active={navActive}
            inboxCount={inboxCount}
            chatUnread={chatUnread}
            onNavigate={(id) => setScreen(id as 'calendar' | 'inbox' | 'chat' | 'home' | 'people')}
          />
        ) : null
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={screen} {...ANIM} className="h-full">
          {content}
        </motion.div>
      </AnimatePresence>

      {/* Full-screen chat thread overlay */}
      <AnimatePresence>
        {threadOpen && (
          <motion.div
            key="chat-thread"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-white z-30"
          >
            <ChatThread />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {screen === 'inbox' && <ChaosModal />}
      {(screen === 'calendar' || screen === 'inbox') && <MeetingDetailSheet />}

      {/* Global feedback layers — visible from any screen */}
      <KpiToast />
      <SettingsDrawer />
    </PhoneFrame>
  );
}
