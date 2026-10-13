'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import ScrambledText from './ScrambledText';

gsap.registerPlugin(ScrambleTextPlugin);

const MODES = [
  { word: 'TERMINAL', env: 'terminal // eth0', color: 'text-yellow-300', dot: 'bg-yellow-400' },
  { word: 'CAMA', env: 'bedroom // 03:00_am', color: 'text-red-400', dot: 'bg-red-400' },
  { word: 'SHELL', env: 'bash // interactive', color: 'text-slate-200', dot: 'bg-slate-300' },
  { word: 'ROOT', env: 'privesc // uid_0', color: 'text-emerald-400', dot: 'bg-emerald-400' },
];

export default function HeroTitle() {
  const [modeIndex, setModeIndex] = useState(0);
  const wordRef = useRef(null);
  const isFirstRender = useRef(true);

  const activeMode = MODES[modeIndex];

  // Rotación cíclica periódica cada 3.8 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setModeIndex(prev => (prev + 1) % MODES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Transmutación ultra-fluida: GSAP transmuta el contenido en vivo sin reemplazos bruscos de React
  useEffect(() => {
    if (!wordRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    gsap.to(wordRef.current, {
      duration: 0.6,
      scrambleText: {
        text: activeMode.word,
        chars: '01!#%&*+=-~<>/?ABCDEF',
        speed: 0.45
      },
      ease: 'power1.out'
    });
  }, [modeIndex, activeMode.word]);

  return (
    <div
      className="block w-fit cursor-default select-none"
      role="banner"
      aria-label={`Desde Mi ${activeMode.word}`}
    >
      <ScrambledText
        as="h1"
        selector=".scramble-char"
        radius={95}
        duration={0.75}
        speed={0.42}
        scrambleChars="01!#%&*+=-~<>/?ABCDEF"
        className="font-pixel uppercase leading-[1.15] sm:leading-[1.2] text-white"
      >
        <span className="scramble-char block text-[clamp(1.75rem,5.8vw,3.85rem)]">
          Desde
        </span>
        <span className="scramble-char block text-[clamp(1.75rem,5.8vw,3.85rem)]">
          Mi
        </span>
        {/* El nodo inicial arranca en TERMINAL y es transmutado suavemente por GSAP */}
        <span
          ref={wordRef}
          className={`block text-[clamp(1.75rem,5.8vw,3.85rem)] min-w-[8.5ch] ${activeMode.color} transition-colors duration-300`}
        >
          {MODES[0].word}
        </span>
      </ScrambledText>

      {/* Telemetría óptica Flumen (Optical Micro-Alignment) */}
      <div className="flex items-center gap-2 mt-3.5">
        <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-[2px] border border-white/10 bg-[#040711] text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-300">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-400 shrink-0 animate-pulse" />
          <span className="leading-none pt-[1px]">terminal // eth0</span>
        </span>
      </div>
    </div>
  );
}
