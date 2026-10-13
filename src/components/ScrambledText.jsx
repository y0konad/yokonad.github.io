'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

import './ScrambledText.css';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  as = 'div',
  tag = 'p',
  selector,
  animateOnMount = true,
  children
}) => {
  const rootRef = useRef(null);
  const charsRef = useRef([]);

  useEffect(() => {
    if (!rootRef.current) return;

    const el = rootRef.current;
    const targets = selector
      ? el.querySelectorAll(selector)
      : el.querySelector(tag) || el;

    let split;
    try {
      split = SplitText.create(targets, {
        type: 'chars',
        charsClass: 'char'
      });
      charsRef.current = split.chars || [];
    } catch {
      return;
    }

    charsRef.current.forEach(c => {
      gsap.set(c, {
        display: 'inline-block',
        attr: { 'data-content': c.innerHTML }
      });
    });

    if (animateOnMount && charsRef.current.length > 0) {
      gsap.from(charsRef.current, {
        duration: duration * 0.55,
        scrambleText: {
          chars: scrambleChars,
          speed
        },
        ease: 'none',
        stagger: 0.015
      });
    }

    let rafId = null;
    const handleMove = e => {
      if (rafId) return;
      const clientX = e.clientX;
      const clientY = e.clientY;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        charsRef.current.forEach(c => {
          const { left, top, width, height } = c.getBoundingClientRect();
          const dx = clientX - (left + width / 2);
          const dy = clientY - (top + height / 2);
          const dist = Math.hypot(dx, dy);

          if (dist < radius && !gsap.isTweening(c)) {
            gsap.to(c, {
              duration: duration * Math.max(0.35, 1 - dist / radius),
              scrambleText: {
                text: c.dataset.content || '',
                chars: scrambleChars,
                speed
              },
              ease: 'none'
            });
          }
        });
      });
    };

    el.addEventListener('pointermove', handleMove);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      if (rafId) cancelAnimationFrame(rafId);
      if (split) {
        split.revert();
      }
    };
  }, [radius, duration, speed, scrambleChars, selector, tag, animateOnMount]);

  const Component = as;

  return (
    <Component ref={rootRef} className={`text-block ${className}`} style={style}>
      {selector ? children : <p>{children}</p>}
    </Component>
  );
};

export default ScrambledText;
