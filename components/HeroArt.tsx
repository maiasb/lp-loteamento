import { HERO } from '@/lib/content';
import styles from './HeroArt.module.css';

type S = 'd' | 'r' | 'v';
const BLOCK_1: S[] = ['d', 'd', 'v', 'r', 'd', 'd', 'd', 'r', 'v', 'd', 'd', 'r'];
const BLOCK_2: S[] = ['v', 'd', 'd', 'd', 'r', 'd', 'd', 'd', 'r', 'd', 'v', 'd'];
const SELECTED = 7; // índice no BLOCK_2
const COLOR: Record<S, { stroke: string; fill: string }> = {
  d: { stroke: '#81C784', fill: 'rgba(129,199,132,.16)' },
  r: { stroke: '#FFB74D', fill: 'rgba(255,183,77,.18)' },
  v: { stroke: '#EF5350', fill: '#EF5350' },
};

/** Recorte decorativo de uma planta (estático, SVG inline; nada concorre com o LCP, que é o h1). */
export function HeroArt() {
  const blocks = [
    { lots: BLOCK_1, y: 60 },
    { lots: BLOCK_2, y: 300 },
  ];
  return (
    <svg
      className={styles.art}
      width="600"
      height="500"
      viewBox="0 0 600 500"
      role="img"
      aria-label={HERO.art}
    >
      <defs>
        <pattern
          id="hero-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="#FFB74D"
            strokeOpacity=".45"
            strokeWidth="1.5"
          />
        </pattern>
      </defs>
      <rect x="0" y="200" width="600" height="100" fill="#12273b" />
      <line
        x1="0"
        y1="250"
        x2="600"
        y2="250"
        stroke="#2a4259"
        strokeWidth="2"
        strokeDasharray="14 10"
      />
      {blocks.map((b, bi) =>
        b.lots.map((s, i) => {
          const x = 60 + (i % 6) * 80 + 2;
          const y = b.y + Math.floor(i / 6) * 70 + 2;
          const c = COLOR[s];
          const idx = bi * 12 + i;
          return (
            <g
              key={`${bi}-${i}`}
              className={styles.lot}
              style={{ '--i': idx } as React.CSSProperties}
            >
              <rect
                x={x}
                y={y}
                width="76"
                height="66"
                rx="6"
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={s === 'v' ? 2.5 : 1.5}
              />
              {s === 'r' && (
                <rect x={x} y={y} width="76" height="66" rx="6" fill="url(#hero-hatch)" />
              )}
              {bi === 1 && i === SELECTED && (
                <>
                  <rect
                    x={x - 3}
                    y={y - 3}
                    width="82"
                    height="72"
                    rx="9"
                    fill="none"
                    stroke="#64b5f6"
                    strokeWidth="3"
                  />
                  <rect x={x + 60} y={y + 6} width="10" height="10" rx="2" fill="#C6F24E" />
                </>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
