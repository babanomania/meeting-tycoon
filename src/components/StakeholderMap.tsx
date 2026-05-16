import { useMemo } from 'react';
import { SENTIMENT_META, sentimentFor } from '@/game/politics';
import { characterPhoto, characterDisplayName } from '@/game/characters';
import { initials } from './Avatar';
import type { Stakeholder, StakeholderId } from '@/game/types';

interface Props {
  stakeholders: Stakeholder[];
  bossId?: StakeholderId;
  onNodeTap?: (id: StakeholderId) => void;
}

/**
 * Hub-and-spoke politics diagram.
 * - "You" sits in the center.
 * - Each stakeholder is positioned on a circle around the center.
 * - The edge from center to node is colored by sentiment.
 * - The boss is enlarged and pinned to the top.
 * - When the stakeholder has a registered AI photo, the circle renders an
 *   `<image>` clipped to a circle; otherwise we fall back to initials.
 */
export function StakeholderMap({ stakeholders, bossId = 'boss', onNodeTap }: Props) {
  // viewBox is sized to fit:
  //   - the boss BOSS pill above the top node (cy − r − 10), and
  //   - the sentiment label under the bottom node (cy + r + 26).
  // SIZE/RADIUS chosen so neither overflows.
  const SIZE = 320;
  const CENTER = SIZE / 2;
  const RADIUS = 92;

  const ordered = useMemo(() => {
    const boss = stakeholders.find((s) => s.id === bossId);
    const rest = stakeholders.filter((s) => s.id !== bossId);
    return boss ? [boss, ...rest] : stakeholders;
  }, [stakeholders, bossId]);

  const positions = useMemo(() => {
    const n = ordered.length;
    return ordered.map((s, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const cx = CENTER + Math.cos(angle) * RADIUS;
      const cy = CENTER + Math.sin(angle) * RADIUS;
      return { s, cx, cy, isBoss: s.id === bossId };
    });
  }, [ordered, bossId]);

  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1', maxWidth: 380 }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
        <defs>
          {/* One circular clipPath per node so the photo crops to the circle. */}
          {positions.map(({ s, cx, cy, isBoss }) => {
            const r = isBoss ? 28 : 22;
            return (
              <clipPath id={`clip-${s.id}`} key={`clip-${s.id}`}>
                <circle cx={cx} cy={cy} r={r} />
              </clipPath>
            );
          })}
        </defs>

        {/* Edges */}
        {positions.map(({ s, cx, cy }) => {
          const senti = sentimentFor(s.relationship);
          const edgeColor = SENTIMENT_META[senti].edge;
          const intensity = Math.abs(s.relationship - 50) / 50;
          const width = 1 + intensity * 3;
          return (
            <line
              key={`edge-${s.id}`}
              x1={CENTER}
              y1={CENTER}
              x2={cx}
              y2={cy}
              stroke={edgeColor}
              strokeWidth={width}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}

        {/* Center "You" node */}
        <g>
          <circle cx={CENTER} cy={CENTER} r={26} fill="#6C5CE7" />
          <circle cx={CENTER} cy={CENTER} r={26} fill="none" stroke="white" strokeWidth={3} />
          <text
            x={CENTER}
            y={CENTER + 4}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="white"
            fontFamily="Inter, sans-serif"
            letterSpacing={1}
          >
            YOU
          </text>
        </g>

        {/* Stakeholder nodes */}
        {positions.map(({ s, cx, cy, isBoss }) => {
          const senti = sentimentFor(s.relationship);
          const meta = SENTIMENT_META[senti];
          const r = isBoss ? 28 : 22;
          const photo = characterPhoto(s.name);
          const display = characterDisplayName(s.name);
          const palette = nodePalette(display);

          return (
            <g key={s.id} onClick={() => onNodeTap?.(s.id)} style={{ cursor: 'pointer' }}>
              {/* Halo ring colored by sentiment */}
              <circle cx={cx} cy={cy} r={r + 3} fill={meta.edge} opacity={0.18} />
              {/* Photo image clipped to circle, or initial-filled circle as fallback */}
              {photo ? (
                <>
                  <image
                    href={photo}
                    x={cx - r}
                    y={cy - r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#clip-${s.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke={meta.edge} strokeWidth={2} />
                </>
              ) : (
                <>
                  <circle cx={cx} cy={cy} r={r} fill={palette.bg} stroke={meta.edge} strokeWidth={2} />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fontSize={isBoss ? 11.5 : 10}
                    fontWeight={700}
                    fill={palette.fg}
                    fontFamily="Inter, sans-serif"
                    letterSpacing={0.5}
                  >
                    {initials(display)}
                  </text>
                </>
              )}
              {/* Score badge */}
              <g transform={`translate(${cx + r - 6}, ${cy - r + 2})`}>
                <rect
                  x={-12}
                  y={-7}
                  width={24}
                  height={14}
                  rx={7}
                  fill="white"
                  stroke={meta.edge}
                  strokeWidth={1.25}
                />
                <text
                  x={0}
                  y={3}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={meta.edge}
                  fontFamily="Inter, sans-serif"
                >
                  {s.relationship}
                </text>
              </g>
              {/* "BOSS" marker pill above the boss node (replaces emoji prefix) */}
              {isBoss && (
                <g transform={`translate(${cx}, ${cy - r - 10})`}>
                  <rect x={-18} y={-7} width={36} height={13} rx={6.5} fill="#6C5CE7" />
                  <text
                    x={0}
                    y={2}
                    textAnchor="middle"
                    fontSize={8}
                    fontWeight={800}
                    fill="white"
                    fontFamily="Inter, sans-serif"
                    letterSpacing={1.2}
                  >
                    BOSS
                  </text>
                </g>
              )}
              {/* Name + sentiment under the node */}
              <text
                x={cx}
                y={cy + r + 14}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight={700}
                fill="#1E293B"
                fontFamily="Inter, sans-serif"
              >
                {firstName(display)}
              </text>
              <text
                x={cx}
                y={cy + r + 26}
                textAnchor="middle"
                fontSize={9}
                fontWeight={500}
                fill="#94A3B8"
                fontFamily="Inter, sans-serif"
                letterSpacing={0.5}
              >
                {meta.label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const PALETTE = [
  { bg: '#E0E7FF', fg: '#3730A3' },
  { bg: '#DCFCE7', fg: '#166534' },
  { bg: '#FEF3C7', fg: '#92400E' },
  { bg: '#FCE7F3', fg: '#9D174D' },
  { bg: '#DBEAFE', fg: '#1E40AF' },
  { bg: '#EDE9FE', fg: '#5B21B6' },
  { bg: '#CCFBF1', fg: '#115E59' },
  { bg: '#FFE4E6', fg: '#9F1239' },
];

function nodePalette(name: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}
