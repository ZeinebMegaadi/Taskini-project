import React, { useState, useRef } from 'react';
import './SleepingCat.css';

// Simple WebAudio synthesized "meow" to avoid external audio files
function playMeow() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(750, now);
    carrier.frequency.exponentialRampToValueAtTime(250, now + 0.45);

    const mod = ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(6, now);

    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(40, now);
    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.8, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    // gentle noise for texture
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noise.connect(noiseGain);
    noiseGain.connect(gain);

    carrier.connect(gain);
    gain.connect(ctx.destination);

    carrier.start(now);
    mod.start(now);
    noise.start(now);

    // stop
    carrier.stop(now + 0.6);
    mod.stop(now + 0.6);
    noise.stop(now + 0.6);

    // close context after a little while
    setTimeout(() => {
      try { ctx.close(); } catch (e) {}
    }, 1200);
  } catch (e) {
    // fallback to speech synthesis for older browsers
    try { window.speechSynthesis.speak(new SpeechSynthesisUtterance('Meow')); } catch (err) {}
  }
}

const SleepingCat = () => {
  const [awake, setAwake] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const clickRef = useRef(0);

  const handleClick = () => {
    clickRef.current += 1;
    // small wake animation
    setAwake(true);
    playMeow();
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 1400);
    setTimeout(() => setAwake(false), 900);
  };

  return (
    <div className={`sleeping-cat ${awake ? 'awake' : ''}`} onClick={handleClick} role="button" tabIndex={0} aria-label="Sleeping cat">
      <svg className="cat-svg" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        {/* body */}
        <ellipse className="cat-body" cx="60" cy="48" rx="44" ry="18" fill="#0f1724" />
        {/* head */}
        <circle className="cat-head" cx="36" cy="36" r="10" fill="#0f1724" />
        {/* ears */}
        <polygon points="30,28 34,18 38,28" fill="#0f1724" />
        <polygon points="42,28 46,18 50,28" fill="#0f1724" />
        {/* tail */}
        <path className="cat-tail" d="M100 46 C110 44, 112 36, 98 34" stroke="#0f1724" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* closed eyes */}
        <path className="eye" d="M31 36 Q36 38 41 36" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
        <path className="eye" d="M31 40 Q36 42 41 40" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
      </svg>
      {showBubble && <div className="meow-bubble">Meow</div>}
    </div>
  );
};

export default SleepingCat;
