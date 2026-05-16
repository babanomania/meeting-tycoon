import { useMemo, useEffect, useRef } from 'react';
import { useGame } from '@/game/store';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { KPI_META } from '@/components/KpiBadge';
import { characterDisplayName, characterRole } from '@/game/characters';
import type { ChatMessage, KpiKey } from '@/game/types';

/**
 * Full-screen thread view (Teams-style chat conversation).
 * Renders messages chronologically with sender avatars + reactions.
 * For DMs with pending reply options, shows them at the bottom.
 */
export function ChatThread() {
  const openId = useGame((s) => s.openConversationId);
  const conversations = useGame((s) => s.conversations);
  const messagesMap = useGame((s) => s.messages);
  const closeConversation = useGame((s) => s.closeConversation);
  const replyInConversation = useGame((s) => s.replyInConversation);

  const convo = useMemo(
    () => conversations.find((c) => c.id === openId),
    [conversations, openId],
  );
  const msgs = useMemo(() => (openId ? messagesMap[openId] ?? [] : []), [openId, messagesMap]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when entering or when messages append
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, openId]);

  if (!convo) return null;

  const isGroup = convo.kind === 'group';
  const isMeeting = convo.kind === 'meeting';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* App bar */}
      <div className="px-3 pt-4 pb-3 flex items-center gap-2 border-b border-ink-100">
        <button
          onClick={closeConversation}
          className="w-9 h-9 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-600"
          aria-label="Back"
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <ThreadAvatar convo={convo} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-800 text-[14px] truncate leading-tight">
            {characterDisplayName(convo.name)}
          </div>
          {(() => {
            const subtitle = convo.kind === 'dm' ? (characterRole(convo.name) ?? convo.subtitle) : convo.subtitle;
            return subtitle ? (
              <div className="text-[10.5px] text-ink-400 font-medium uppercase tracking-wider truncate">
                {subtitle}
              </div>
            ) : null;
          })()}
        </div>
        <button className="w-9 h-9 rounded-sm hover:bg-ink-50 flex items-center justify-center text-ink-500">
          <Icon name="more-h" size={18} />
        </button>
      </div>

      {/* Participant strip for groups + meetings */}
      {(isGroup || isMeeting) && (
        <div className="px-4 py-2 border-b border-ink-100 bg-ink-50/50 flex items-center gap-1.5 overflow-x-auto phone-scroll">
          {convo.participants.map((p) => {
            const name = characterDisplayName(p);
            return (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-ink-100 shrink-0"
              >
                <Avatar name={name} size={18} />
                <span className="text-[10.5px] font-medium text-ink-700">{name}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto phone-scroll px-3 py-3 space-y-2">
        {msgs.length === 0 ? (
          <div className="text-center text-[12px] text-ink-400 py-10">No messages yet.</div>
        ) : (
          msgs.map((m, idx) => (
            <MessageBubble key={m.id} m={m} previous={msgs[idx - 1]} />
          ))
        )}
      </div>

      {/* Reply panel — DMs with pending options */}
      {convo.pendingReplyOptions ? (
        <div className="px-3 pt-2 pb-4 border-t border-ink-100 bg-white">
          <div className="text-[10px] font-bold tracking-widest uppercase text-ink-400 mb-1.5">
            Quick replies
          </div>
          <div className="space-y-1.5">
            {convo.pendingReplyOptions.map((opt, i) => (
              <ReplyButton
                key={i}
                text={opt.text}
                delta={opt.delta as Record<KpiKey, number>}
                onClick={() => replyInConversation(convo.id, i)}
                primary={i === 0}
              />
            ))}
          </div>
        </div>
      ) : (
        <ReadOnlyFooter kind={convo.kind} />
      )}
    </div>
  );
}

function ThreadAvatar({ convo }: { convo: ReturnType<typeof useGame.getState>['conversations'][number] }) {
  if (convo.kind === 'group') {
    return (
      <div className="w-9 h-9 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-[14px]">
        #
      </div>
    );
  }
  if (convo.kind === 'meeting') {
    return (
      <div className="w-9 h-9 rounded-md bg-ink-100 text-ink-600 flex items-center justify-center">
        <Icon name="calendar" size={16} />
      </div>
    );
  }
  if (convo.isSystem) {
    return (
      <div className="w-9 h-9 rounded-md bg-ink-100 text-ink-500 flex items-center justify-center">
        <Icon name="alert" size={16} />
      </div>
    );
  }
  return <Avatar name={convo.name} size={36} />;
}

function MessageBubble({ m, previous }: { m: ChatMessage; previous?: ChatMessage }) {
  const sameAuthor = previous && previous.sender === m.sender && previous.outgoing === m.outgoing;
  const showAvatar = !sameAuthor;

  if (m.outgoing) {
    return (
      <div className="flex justify-end pr-1">
        <div className="max-w-[78%] inline-flex flex-col items-end">
          <div className="bg-brand-600 text-white text-[13px] px-3 py-2 rounded-md rounded-tr-sm shadow-el-1">
            {m.body}
          </div>
          <div className="text-[9.5px] text-ink-300 mt-0.5 tabular-nums">{fmtTime(m.ts)}</div>
        </div>
      </div>
    );
  }

  const senderDisplay = characterDisplayName(m.sender);
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 shrink-0">
        {showAvatar && <Avatar name={senderDisplay} size={28} />}
      </div>
      <div className="max-w-[78%] inline-flex flex-col items-start">
        {showAvatar && (
          <div className="text-[10.5px] font-semibold text-ink-500 mb-0.5 ml-1">{senderDisplay}</div>
        )}
        <div className="bg-ink-100 text-ink-800 text-[13px] px-3 py-2 rounded-md rounded-tl-sm">
          {m.body}
        </div>
        {m.reactions && m.reactions.length > 0 && (
          <div className="ml-1 mt-0.5 inline-flex items-center gap-1 bg-white border border-ink-100 rounded-full px-2 py-0.5 shadow-el-1 text-[11px]">
            {m.reactions.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
            <span className="text-ink-400 text-[10px] font-semibold ml-0.5">{m.reactions.length}</span>
          </div>
        )}
        <div className="text-[9.5px] text-ink-300 mt-0.5 ml-1 tabular-nums">{fmtTime(m.ts)}</div>
      </div>
    </div>
  );
}

function ReadOnlyFooter({ kind }: { kind: 'group' | 'dm' | 'meeting' }) {
  const text =
    kind === 'group'
      ? 'You can read this channel. Replies coming in a future stage.'
      : kind === 'meeting'
      ? 'Meeting chat — auto-updated after each session.'
      : 'No pending replies in this thread.';
  return (
    <div className="px-3 py-3 border-t border-ink-100 bg-ink-50/40 text-center text-[11px] text-ink-400">
      {text}
    </div>
  );
}

function ReplyButton({
  text,
  delta,
  primary,
  onClick,
}: {
  text: string;
  delta: Record<string, number>;
  primary: boolean;
  onClick: () => void;
}) {
  const entries = (Object.keys(delta) as KpiKey[]).filter((k) => (delta[k] ?? 0) !== 0);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-md px-3 py-2.5 transition active:scale-[0.99] border ${
        primary
          ? 'bg-brand-600 text-white border-brand-700 hover:bg-brand-700 shadow-btn-primary'
          : 'bg-white text-ink-800 border-ink-100 hover:bg-ink-50'
      }`}
    >
      <div className={`text-[13px] font-semibold ${primary ? 'text-white' : 'text-ink-800'}`}>
        {text}
      </div>
      {entries.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] tabular-nums">
          {entries.map((k) => {
            const v = delta[k] ?? 0;
            const meta = KPI_META[k];
            return (
              <span
                key={k}
                className={`inline-flex items-center gap-1 ${
                  primary
                    ? v >= 0
                      ? 'text-emerald-200'
                      : 'text-rose-200'
                    : v >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                <Icon name={meta.icon} size={11} />
                <span className="font-semibold">
                  {v >= 0 ? '+' : ''}
                  {v}
                </span>
              </span>
            );
          })}
        </div>
      )}
      {entries.length === 0 && (
        <div className={`mt-0.5 text-[10.5px] ${primary ? 'text-white/70' : 'text-ink-400'}`}>
          No KPI impact
        </div>
      )}
    </button>
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
