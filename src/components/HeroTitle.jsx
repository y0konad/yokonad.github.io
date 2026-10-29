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

  // Rotación cíclica periódica cada 3.8 segundos (se pausa si la pestaña está oculta)
  useEffect(() => {
    let timer = null;
    const start = () => {
      if (!timer) {
        timer = setInterval(() => {
          setModeIndex(prev => (prev + 1) % MODES.length);
        }, 3800);
      }
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // Transmutación ultra-fluida: GSAP transmuta el contenido en vivo sin reemplazos bruscos de React
  useEffect(() => {
    if (!wordRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.to(wordRef.current, {
        duration: 0.8,
        delay: 0.15,
        scrambleText: {
          text: activeMode.word,
          chars: '01!#%&*+=-~<>/?ABCDEF',
          speed: 0.45
        },
        ease: 'power1.out'
      });
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
      className="block w-full max-w-full cursor-default select-none overflow-hidden"
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
        className="font-pixel uppercase leading-[1.12] sm:leading-[1.15] text-white flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap sm:gap-x-3.5 md:gap-x-4 max-w-full"
      >
        <span className="scramble-char block sm:inline-block text-[clamp(3.4rem,11.9vw,4.2rem)] sm:text-[clamp(2rem,5.5vw,4.35rem)] sm:whitespace-nowrap">
          Desde
        </span>
        <span className="scramble-char block sm:inline-block text-[clamp(3.4rem,11.9vw,4.2rem)] sm:text-[clamp(2rem,5.5vw,4.35rem)] sm:whitespace-nowrap">
          Mi
        </span>
        {/* El nodo inicial arranca en TERMINAL y es transmutado suavemente por GSAP */}
        <span
          ref={wordRef}
          className={`block sm:inline-block text-[clamp(3rem,11vw,4.2rem)] sm:text-[clamp(2rem,5.5vw,4.35rem)] tracking-tight sm:tracking-normal min-w-[7ch] max-w-full ${activeMode.color} transition-colors duration-300 sm:whitespace-nowrap`}
        >
          {MODES[0].word}
        </span>
      </ScrambledText>

      {/* Telemetría óptica (Optical Micro-Alignment) */}
      <div className="flex items-center gap-2 mt-3.5">
        <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-[2px] border border-white/10 bg-[#040711] text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-300">
          <span className="w-1.5 h-1.5 rounded-[1px] bg-sky-400 shrink-0 animate-pulse" />
          <span className="leading-none pt-[1px]">terminal // eth0</span>
        </span>
      </div>
    </div>
  );
}
