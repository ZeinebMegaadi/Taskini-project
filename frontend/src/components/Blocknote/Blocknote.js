import React, { useRef, useEffect } from 'react';
import './Blocknote.css';

const Blocknote = ({ className = '' }) => {
  const pathRef = useRef(null);
  const pencilRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const pencil = pencilRef.current;
    if (!path || !pencil) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    const duration = 2800; // ms
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(1, elapsed / duration);

      // ease in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      path.style.strokeDashoffset = String(length * (1 - eased));

      // move pencil along path; position so the pencil tip (bottom) sits on the path
      const point = path.getPointAtLength(eased * length);
      pencil.setAttribute('transform', `translate(${point.x - 3}, ${point.y - 28})`);

      if (elapsed < duration) {
        animRef.current = requestAnimationFrame(step);
      } else {
        // pause briefly then restart
        setTimeout(() => {
          start = null;
          animRef.current = requestAnimationFrame(step);
        }, 700);
      }
    }

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <svg className={`blocknote-inline ${className}`} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Blocknote with animated scribble">
      <rect x="20" y="20" width="180" height="260" rx="12" fill="#fff" stroke="#E5E7EB" strokeWidth="2"/>
      <rect x="32" y="36" width="156" height="28" rx="6" fill="#6366F1"/>
      <line x1="36" y1="80" x2="176" y2="80" stroke="#E6EEF8" strokeWidth="8" strokeLinecap="round"/>
      <line x1="36" y1="110" x2="176" y2="110" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round"/>
      <line x1="36" y1="140" x2="176" y2="140" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round"/>
      <line x1="36" y1="170" x2="176" y2="170" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round"/>
      <line x1="36" y1="200" x2="176" y2="200" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round"/>

      {/* scribble path */}
      <path ref={pathRef} d="M44 98 C70 90, 90 108, 116 96 C142 84, 150 110, 172 102" fill="none" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />

      <rect x="200" y="40" width="64" height="220" rx="8" fill="#F8FAFC" stroke="#E5E7EB" strokeWidth="2"/>
      <circle cx="232" cy="70" r="6" fill="#F97316"/>
      <circle cx="232" cy="100" r="6" fill="#F59E0B"/>
      <circle cx="232" cy="130" r="6" fill="#10B981"/>

      {/* pencil group positioned along path by JS (vertical orientation) */}
      <g ref={pencilRef} className="pencil">
        <rect x="0" y="0" width="6" height="22" rx="2" fill="#F59E0B" stroke="#b45309" />
        <polygon points="0,22 6,22 3,28" fill="#111827" />
      </g>
    </svg>
  );
};

export default Blocknote;
