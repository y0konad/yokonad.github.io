import { useEffect, useRef } from 'react';
import { World, AsciiRenderer } from 'ascii-sharks';
import { SPECIES } from 'ascii-sharks/src/species';

// Registramos una 6ta especie de pez oceánico: atún / bonito (rápido, cardumen cerrado y ágil)
if (!SPECIES.some((s) => s.name === 'tuna')) {
  SPECIES.push({
    name: 'tuna',
    cruise: 50,
    maxSpeed: 86,
    minSpeed: 24,
    weight: 3,
    schoolSize: [12, 22],
    spacing: [2.1, 1.2],
    align: 2.8,
    cohesion: 1.2,
    jitter: 22,
    mill: 25,
    verticalDrag: 1.1,
  });
}

const STEP = 1 / 60;

// Ecosistema marino diverso activo en el fondo
const ACTIVE_SHARKS = [
  { kind: 'thresher', size: 1.15 },
  { kind: 'greathammer', size: 1.05 },
  { kind: 'mako', size: 0.95 },
  { kind: 'zebra', size: 0.85 },
  { kind: 'tiger', size: 0.75 },
];

export default function AsciiSharks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let raf = 0;
    let last = performance.now();

    let lastW = 0;
    let lastH = 0;
    let lastDpr = 0;

    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;

    // Población marina calibrada a 280 peces a través de 6 especies (alta densidad y 60 FPS garantizados)
    const world = new World(ACTIVE_SHARKS, 280);
    const renderer = new AsciiRenderer(canvas);
    renderer.setFontFamily("'IBM Plex Mono', 'Courier New', Courier, monospace");

    // Coordenadas desacopladas para evitar sobrecarga de eventos al scrollear
    const onPointerMove = (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
    };

    const onPointerDown = (e) => {
      world.splash(e.clientX, e.clientY);
    };

    const onPointerLeave = () => {
      pointerActive = false;
      world.pointer.active = false;
    };

    // Resize estricto con protección para no reasignar arrays ni limpiar el canvas durante el scroll
    const resize = () => {
      const w = Math.round(window.innerWidth);
      const h = Math.round(window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (w === lastW && h === lastH && dpr === lastDpr) return;
      lastW = w;
      lastH = h;
      lastDpr = dpr;

      renderer.resize(w, h, dpr);
      world.resize(w, h, renderer.cellWidth, renderer.cellHeight);
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    resize();

    // Bucle con paso directo por cuadro: elimina bucles while acumuladores que causaban tirones al scrollear
    const frame = (now) => {
      if (disposed) return;
      const rawDt = (now - last) / 1000;
      last = now;

      // Delta acotado a 33ms para evitar saltos o tirones si el hilo del navegador se ocupa scrolleando
      const dt = Math.min(0.033, rawDt || STEP);

      if (pointerActive) {
        world.pointer.x = pointerX;
        world.pointer.y = pointerY;
        world.pointer.active = true;
      } else {
        world.pointer.active = false;
      }

      world.step(dt);
      renderer.render(world, dt);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block select-none pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
        contain: 'strict',
        fontFamily: "'IBM Plex Mono', 'Courier New', Courier, monospace",
      }}
    />
  );
}
