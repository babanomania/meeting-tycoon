interface Props {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}

/** Tiny inline sparkline. 0–100 range; pads with initial value when history < 2. */
export function Sparkline({ values, color = '#6C5CE7', height = 28, width = 80 }: Props) {
  const series = values.length === 0 ? [50, 50] : values.length === 1 ? [values[0], values[0]] : values;
  const max = 100;
  const min = 0;
  const stepX = width / (series.length - 1);
  const points = series
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const last = series[series.length - 1];
        const x = (series.length - 1) * stepX;
        const y = height - ((last - min) / (max - min)) * height;
        return <circle cx={x} cy={y} r={2.5} fill={color} />;
      })()}
    </svg>
  );
}
