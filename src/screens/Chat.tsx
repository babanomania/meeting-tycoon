import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useGame } from '@/game/store';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { MenuButton } from '@/components/SettingsDrawer';
import { characterDisplayName } from '@/game/characters';
import type { Conversation, ChatMessage } from '@/game/types';

/**
 * Teams-style chat list. Sectioned: pinned channels / DMs / meeting chats.
 * Tap any row → opens the thread view.
 */
export function ChatScreen() {
  const conversations = useGame((s) => s.conversations);
  const messages = useGame((s) => s.messages);
  const day = useGame((s) => s.day);
  const openConversation = useGame((s) => s.openConversation);
  const readIds = useGame((s) => s.readConversationIds);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Filter conversations by name, subtitle, or any message body matching
  // the query (case-insensitive). When the query is empty we pass through
  // everything so toggling the search bar with no input doesn't blank the
  // list.
  const visibleConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.subtitle && c.subtitle.toLowerCase().includes(q)) return true;
      const msgs = messages[c.id] ?? [];
      return msgs.some((m) => m.body.toLowerCase().includes(q));
    });
  }, [conversations, messages, query]);

  const { groups, dms, meetings } = useMemo(() => {
    const groups: Conversation[] = [];
    const dms: Conversation[] = [];
    const meetings: Conversation[] = [];
    for (const c of visibleConversations) {
      if (c.kind === 'group') groups.push(c);
      else if (c.kind === 'dm') dms.push(c);
      else if (c.kind === 'meeting') meetings.push(c);
    }
    const byRecency = (a: Conversation, b: Conversation) => b.lastMessageAt - a.lastMessageAt;
    return {
      groups: groups.sort(byRecency),
      dms: dms.sort(byRecency),
      meetings: meetings.sort(byRecency),
    };
  }, [visibleConversations]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const noMatches = searchOpen && query.trim().length > 0 && visibleConversations.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b border-ink-100">
        {searchOpen ? (
          <>
            <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-md bg-ink-50 border border-ink-200">
              <Icon name="search" size={15} className="text-ink-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
                placeholder="Search messages, channels, people…"
                className="flex-1 min-w-0 bg-transparent outline-none text-[13px] placeholder:text-ink-400"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="shrink-0 text-ink-400 hover:text-ink-600"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
            <button
              onClick={closeSearch}
              className="text-[12.5px] font-semibold text-ink-500 hover:text-ink-800 px-1"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <MenuButton />
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-widest text-ink-400">
                Day {day} · Today
              </div>
              <h1 className="text-[20px] font-bold text-ink-800 leading-tight mt-0.5">Chat</h1>
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search chats"
              className="w-8 h-8 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-500"
            >
              <Icon name="search" size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll">
        {conversations.length === 0 ? (
          <Empty />
        ) : noMatches ? (
          <NoMatches query={query} onClear={() => setQuery('')} />
        ) : (
          <>
            <Section title="Channels" items={groups} messages={messages} readIds={readIds} onTap={openConversation} />
            <Section title="Direct messages" items={dms} messages={messages} readIds={readIds} onTap={openConversation} />
            <Section title="Meeting chats" items={meetings} messages={messages} readIds={readIds} onTap={openConversation} />
          </>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center py-14">
      <div className="inline-flex w-12 h-12 rounded-full bg-ink-100 text-ink-400 items-center justify-center">
        <Icon name="chat" size={22} />
      </div>
      <div className="mt-2 text-[13.5px] font-semibold text-ink-700">Quiet morning.</div>
      <div className="text-[11.5px] text-ink-400 mt-0.5">
        Chats will fill up as you start your day.
      </div>
    </div>
  );
}

function NoMatches({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="inline-flex w-12 h-12 rounded-full bg-ink-100 text-ink-400 items-center justify-center">
        <Icon name="search" size={22} />
      </div>
      <div className="mt-2 text-[13.5px] font-semibold text-ink-700">
        No chats match "<span className="text-ink-900">{query}</span>"
      </div>
      <div className="text-[11.5px] text-ink-400 mt-0.5 mb-3">
        Searched channel names, DM names, and message bodies.
      </div>
      <button
        onClick={onClear}
        className="text-[12px] font-semibold text-brand-600 hover:text-brand-700"
      >
        Clear search
      </button>
    </div>
  );
}

function Section({
  title,
  items,
  messages,
  readIds,
  onTap,
}: {
  title: string;
  items: Conversation[];
  messages: Record<string, ChatMessage[]>;
  readIds: string[];
  onTap: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-5 pt-3 pb-1 text-[10.5px] font-bold tracking-widest uppercase text-ink-400">
        {title}
      </div>
      <ul className="divide-y divide-ink-100 border-y border-ink-100">
        {items.map((c, idx) => (
          <Row
            key={c.id}
            c={c}
            messages={messages[c.id] ?? []}
            unread={!readIds.includes(c.id) && !!c.pendingReplyOptions}
            highlight={!!c.pendingReplyOptions}
            index={idx}
            onTap={() => onTap(c.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function Row({
  c,
  messages,
  unread,
  highlight,
  index,
  onTap,
}: {
  c: Conversation;
  messages: ChatMessage[];
  unread: boolean;
  highlight: boolean;
  index: number;
  onTap: () => void;
}) {
  const lastMsg = messages[messages.length - 1];
  const lastSender = lastMsg ? characterDisplayName(lastMsg.sender).split(/\s+/)[0] : '';
  const preview = lastMsg
    ? lastMsg.outgoing
      ? `You: ${lastMsg.body}`
      : `${lastSender}: ${lastMsg.body}`
    : 'No messages yet';

  const displayName = characterDisplayName(c.name);

  const avatarNode = c.kind === 'group' ? (
    <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-[14px]">
      #
    </div>
  ) : c.kind === 'meeting' ? (
    <div className="w-9 h-9 rounded-md bg-ink-100 text-ink-600 flex items-center justify-center">
      <Icon name="calendar" size={16} />
    </div>
  ) : c.isSystem ? (
    <div className="w-9 h-9 rounded-md bg-ink-100 text-ink-500 flex items-center justify-center">
      <Icon name="alert" size={16} />
    </div>
  ) : (
    <Avatar name={displayName} size={36} />
  );

  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <button
        onClick={onTap}
        className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-ink-50 active:bg-ink-100 transition"
      >
        <div className="relative shrink-0">
          {avatarNode}
          {highlight && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-ink-800 text-[13.5px] truncate">
              {displayName}
              {c.subtitle && (
                <span className="ml-1.5 text-[10.5px] font-medium text-ink-400 uppercase tracking-wider">
                  {c.subtitle}
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-ink-400 tabular-nums whitespace-nowrap">
              {lastMsg ? fmtTime(lastMsg.ts) : ''}
            </div>
          </div>
          <div
            className={`mt-0.5 text-[12.5px] leading-snug line-clamp-2 ${
              unread ? 'text-ink-800 font-medium' : 'text-ink-500'
            }`}
          >
            {preview}
          </div>
        </div>
      </button>
    </motion.li>
  );
}

function fmtTime(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m} ${ap}`;
}
