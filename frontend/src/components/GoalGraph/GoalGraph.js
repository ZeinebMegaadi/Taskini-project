import React, { useMemo, useState } from 'react';
import './GoalGraph.css';

// props:
// - history: array of numbers (task counts) length ~7
// - distribution: { completed, 'in-progress', pending, other }
const COLORS = {
  completed: '#10B981',
  'in-progress': '#F59E0B',
  pending: '#EF4444',
  other: '#6B7280'
};

const GoalGraph = ({ history = [], distribution = {} }) => {
  const values = history.length === 7 ? history : Array(7).fill(0);
  const [hover, setHover] = useState(null); // {i, x, y, v}

  const width = 420;
  const height = 200;
  const pad = { left: 36, right: 120, top: 12, bottom: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const maxVal = useMemo(() => Math.max(1, ...values), [values]);

  const points = values.map((v, i) => {
    const x = pad.left + (i / (values.length - 1)) * innerW;
    const y = pad.top + innerH - (v / maxVal) * innerH;
    return { x, y, v };
  });

  const areaPath = useMemo(() => {
    if (!points.length) return '';
    let d = `M ${points[0].x} ${pad.top + innerH}`; // start bottom-left
    d += ` L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
    d += ` L ${points[points.length - 1].x} ${pad.top + innerH} Z`;
    return d;
  }, [points, innerH, pad.top]);

  const linePath = useMemo(() => (points.length ? points.map(p => `${p.x},${p.y}`).join(' ') : ''), [points]);

  const avg = useMemo(() => Math.round(values.reduce((s, x) => s + x, 0) / values.length), [values]);

  const days = useMemo(() => {
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    }
    return labels;
  }, []);

  // donut slices
  const total = Object.values(distribution || {}).reduce((s, n) => s + n, 0);
  const slices = [];
  let acc = 0;
  Object.keys(COLORS).forEach(k => {
    const val = distribution[k] || 0;
    const start = acc / Math.max(total, 1);
    acc += val;
    const end = acc / Math.max(total, 1);
    slices.push({ key: k, val, start, end, color: COLORS[k] });
  });

  const donutRadius = 36;
  const donutCx = width - 60;
  const donutCy = 64;

  const polarToCartesian = (cx, cy, r, t) => {
    const angle = 2 * Math.PI * t - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const arcPath = (start, end, rOuter, rInner) => {
    if (end === start) return '';
    const startOuter = polarToCartesian(donutCx, donutCy, rOuter, start);
    const endOuter = polarToCartesian(donutCx, donutCy, rOuter, end);
    const startInner = polarToCartesian(donutCx, donutCy, rInner, end);
    const endInner = polarToCartesian(donutCx, donutCy, rInner, start);
    const large = end - start > 0.5 ? 1 : 0;
    return `M ${startOuter.x} ${startOuter.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${endOuter.x} ${endOuter.y} L ${startInner.x} ${startInner.y} A ${rInner} ${rInner} 0 ${large} 0 ${endInner.x} ${endInner.y} Z`;
  };

  const ticks = [0, Math.ceil(maxVal / 2), Math.ceil(maxVal)];

  return (
    <div className="goal-graph-detailed">
      <svg width={width} height={height} className="goal-chart" viewBox={`0 0 ${width} ${height}`}>
        {/* grid lines */}
        {ticks.map((g, idx) => {
          const y = pad.top + innerH - (g / maxVal) * innerH;
          return (
            <g key={idx}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#eef2ff" strokeWidth={1} />
              <text x={8} y={y + 4} fontSize={11} fill="#9ca3af">{g}</text>
            </g>
          );
        })}

        {/* axes */}
        <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + innerH} stroke="#e6e6f0" />
        <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} stroke="#e6e6f0" />

        {/* area */}
        <path d={areaPath} fill="url(#areaGrad)" opacity={0.9} />

        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* line */}
        <polyline fill="none" stroke="#059669" strokeWidth={2.5} points={linePath} strokeLinejoin="round" strokeLinecap="round" />

        {/* average line */}
        <line x1={pad.left} x2={width - pad.right} y1={pad.top + innerH - (avg / maxVal) * innerH} y2={pad.top + innerH - (avg / maxVal) * innerH} stroke="#a78bfa" strokeDasharray="4 4" strokeWidth={1} />

        {/* points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 5.5 : 4}
              fill={i === points.length - 1 ? '#10B981' : '#fff'}
              stroke={'#059669'}
              strokeWidth={i === points.length - 1 ? 2 : 1.5}
              onMouseEnter={() => setHover({ i, x: p.x, y: p.y, v: p.v })}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}

        {/* x labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={pad.top + innerH + 18} fontSize={11} fill="#6b7280" textAnchor="middle">{days[i]}</text>
        ))}

        {/* tooltip inside svg */}
        {hover && (
          <g>
            <rect x={hover.x + 8} y={hover.y - 36} rx={6} ry={6} width={96} height={32} fill="#111827" opacity={0.95} />
            <text x={hover.x + 16} y={hover.y - 16} fill="#fff" fontSize={12}>{`${days[hover.i]}: ${Math.round(hover.v)} tasks`}</text>
          </g>
        )}

        {/* donut */}
        <g>
          {slices.map((s, idx) => (
            <path key={idx} d={arcPath(s.start, s.end, donutRadius, donutRadius - 10)} fill={s.color} opacity={s.val === 0 ? 0.28 : 1} />
          ))}
          <circle cx={donutCx} cy={donutCy} r={donutRadius - 18} fill="#fff" />
          <text x={donutCx} y={donutCy + 2} textAnchor="middle" fontSize={12} fill="#374151">{total}</text>
          <text x={donutCx} y={donutCy + 18} textAnchor="middle" fontSize={10} fill="#9CA3AF">Total</text>
        </g>
      </svg>

      <div className="goal-legend">
        <div className="legend-item"><span className="legend-swatch" style={{ background: '#10B981' }} />7-day avg: {avg}</div>
        {Object.keys(COLORS).map(k => (
          <div className="legend-item" key={k}><span className="legend-swatch" style={{ background: COLORS[k] }} />{k}: {distribution[k] || 0}</div>
        ))}
      </div>
    </div>
  );
};

export default GoalGraph;
