'use client';

import { useMemo } from 'react';
import staticData from '../data/github-contributions.json';

// Dimensiones oficiales de GitHub: 53 semanas x 7 días (celdas cuadradas 10x10 con separación 3px)
const CELL_SIZE = 10;
const CELL_GAP = 3;
const STEP = CELL_SIZE + CELL_GAP; // 13px
const LEFT_OFFSET = 26; // Espacio lateral para etiquetas Lun, Mié, Vie
const TOP_OFFSET = 18;  // Espacio superior para etiquetas de meses

const COLS = 53;
const ROWS = 7;
const TOTAL_WIDTH = LEFT_OFFSET + COLS * STEP - CELL_GAP;  // 26 + 686 = 712px
const TOTAL_HEIGHT = TOP_OFFSET + ROWS * STEP - CELL_GAP; // 18 + 88 = 106px

// Paleta oficial de GitHub Dark Mode de alto contraste (todos los niveles son nítidos y visibles)
const COLOR_LEVELS = {
  NONE: '#161b22',
  FIRST_QUARTILE: '#238636',  // Verde esmeralda nítido de GitHub
  SECOND_QUARTILE: '#2ea043',
  THIRD_QUARTILE: '#3fb950',
  FOURTH_QUARTILE: '#56ff7a',
};

const LEGEND_COLORS = ['#161b22', '#238636', '#2ea043', '#3fb950', '#56ff7a'];

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function GithubArcade({ username = 'y0konad' }) {
  const calendar = staticData.data.viewer.contributionsCollection.contributionCalendar;
  const weeks = calendar.weeks;

  // Cálculo de etiquetas de meses según la primera semana de cada mes
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;

    weeks.forEach((w, colIdx) => {
      const firstDay = w.contributionDays[0];
      if (!firstDay) return;
      const parts = firstDay.date.split('-');
      const monthNum = parseInt(parts[1], 10) - 1;
      const dayNum = parseInt(parts[2], 10);

      if (colIdx === 0) {
        labels.push({ col: 0, name: MONTH_NAMES[monthNum] });
        lastMonth = monthNum;
      } else if (monthNum !== lastMonth && dayNum <= 7) {
        labels.push({ col: colIdx, name: MONTH_NAMES[monthNum] });
        lastMonth = monthNum;
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className="win w-full h-full flex flex-col justify-between">
      {/* Cabecera sobria y limpia */}
      <div className="win-bar is-ink flex items-center justify-between">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="scramble text-slate-200 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>GitHub // {username}</span>
        </a>
        <span className="text-[10px] text-slate-300 font-mono font-medium tabular-nums leading-none pt-[1px]">
          +600 commits acumulados
        </span>
      </div>

      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
        {/* Contenedor del mapa de calor SVG responsive: celdas cuadradas 1:1 proporcionales */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-thin">
          <svg
            viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
            className="w-full h-auto block select-none min-w-[580px]"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Cuadrícula oficial de actividad de GitHub"
          >
            {/* Etiquetas de días de la semana (Lun, Mié, Vie) */}
            <text x="0" y={TOP_OFFSET + 1 * STEP + 8} className="fill-slate-500 font-mono text-[8.5px]">Lun</text>
            <text x="0" y={TOP_OFFSET + 3 * STEP + 8} className="fill-slate-500 font-mono text-[8.5px]">Mié</text>
            <text x="0" y={TOP_OFFSET + 5 * STEP + 8} className="fill-slate-500 font-mono text-[8.5px]">Vie</text>

            {/* Fila de nombres de meses */}
            {monthLabels.map((lbl, idx) => (
              <text
                key={idx}
                x={LEFT_OFFSET + lbl.col * STEP}
                y="11"
                className="fill-slate-400 font-mono text-[9px]"
              >
                {lbl.name}
              </text>
            ))}

            {/* Celdas de contribuciones */}
            {weeks.map((week, c) => (
              week.contributionDays.map((day, r) => {
                if (c >= COLS || r >= ROWS) return null;
                const x = LEFT_OFFSET + c * STEP;
                const y = TOP_OFFSET + r * STEP;
                const color = COLOR_LEVELS[day.contributionLevel] || COLOR_LEVELS.NONE;

                return (
                  <rect
                    key={`${c}-${r}`}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx="2"
                    ry="2"
                    fill={color}
                  />
                );
              })
            ))}
          </svg>
        </div>

        {/* Barra inferior limpia y estática con leyenda estándar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-2.5 border-t border-white/5 text-[9px] text-slate-400 font-mono gap-2">
          <span className="text-slate-400 tracking-wider">
            ACTIVIDAD DE REPOSITORIOS // +600 COMMITS TOTALES
          </span>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="mr-1 text-slate-400">Menos</span>
            {LEGEND_COLORS.map((col, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-[1px] inline-block shrink-0"
                style={{ background: col }}
              />
            ))}
            <span className="ml-1 text-slate-400">Más</span>
          </div>
        </div>
      </div>
    </div>
  );
}
