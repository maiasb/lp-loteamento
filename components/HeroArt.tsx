import { HERO } from '@/lib/content';
import { LOTS, PLAN, lotShape } from '@/lib/demo-lots';
import { COLOR as BASE, ICON } from '@/lib/plan-style';
import styles from './HeroArt.module.css';

const K = 0.8; // px de tela por unidade do desenho (o SVG aparece com ~640 px de largura)
const SELECTED = 'B-04';
// Fundo transparente sobre o herói escuro: contornos claros (os do mapa da demo são para fundo branco).
const COLOR = {
  disponivel: { ...BASE.disponivel, fill: '#81C784', stroke: '#81C784', alpha: 0.14 },
  reservado: { ...BASE.reservado, fill: '#FFB74D', stroke: '#FFB74D', alpha: 0.2 },
  vendido: { ...BASE.vendido, fill: '#EF5350', stroke: '#EF5350', alpha: 0.34 },
  bloqueado: { ...BASE.bloqueado, fill: '#B0BEC5', stroke: '#B0BEC5', alpha: 0.18 },
};
const STATUSES = ['reservado', 'vendido', 'bloqueado'] as const;

/** Recorte decorativo da mesma planta da demonstração (estático, SVG inline; não concorre com o LCP). */
export function HeroArt() {
  const sel = lotShape(LOTS.find((l) => l.id === SELECTED)!);
  return (
    <svg
      className={styles.art}
      width="800"
      height="500"
      viewBox={`0 0 ${PLAN.w} ${PLAN.h}`}
      role="img"
      aria-label={HERO.art}
    >
      <defs>
        {STATUSES.map((s) => {
          const c = COLOR[s];
          const t = (s === 'reservado' ? 10 : 6) / K;
          return (
            <pattern
              key={s}
              id={`hero-${s}`}
              patternUnits="userSpaceOnUse"
              width={t}
              height={t}
              patternTransform={s === 'reservado' ? undefined : 'rotate(45)'}
            >
              <rect width={t} height={t} fill={c.fill} fillOpacity={c.alpha} />
              {s === 'reservado' ? (
                <circle cx={t / 2} cy={t / 2} r={1.2 / K} fill={c.stroke} />
              ) : (
                <>
                  <line
                    x1={t / 2}
                    y1={0}
                    x2={t / 2}
                    y2={t}
                    stroke={c.stroke}
                    strokeWidth={1.2 / K}
                  />
                  {s === 'bloqueado' && (
                    <line
                      x1={0}
                      y1={t / 2}
                      x2={t}
                      y2={t / 2}
                      stroke={c.stroke}
                      strokeWidth={1 / K}
                    />
                  )}
                </>
              )}
            </pattern>
          );
        })}
      </defs>
      <rect x="0" y="210" width={PLAN.w} height="80" fill="#fff" fillOpacity=".05" />
      <line
        x1="0"
        y1="250"
        x2={PLAN.w}
        y2="250"
        stroke="#fff"
        strokeOpacity=".25"
        strokeWidth="2"
        strokeDasharray="14 10"
      />
      {LOTS.map((lot, i) => {
        const s = lot.initialStatus;
        const c = COLOR[s];
        const { points, box } = lotShape(lot);
        return (
          <g key={lot.id} className={styles.lot} style={{ '--i': i } as React.CSSProperties}>
            <polygon
              points={points}
              fill={s === 'disponivel' ? c.fill : `url(#hero-${s})`}
              fillOpacity={s === 'disponivel' ? c.alpha : undefined}
              stroke={c.stroke}
              strokeWidth={c.width / K}
              strokeDasharray={s === 'bloqueado' ? '4 3' : undefined}
            />
            <path
              d={ICON[s]}
              fill={c.stroke}
              transform={`translate(${box.x + box.w / 2} ${box.y + box.h / 2}) scale(${18 / (24 * K)}) translate(-12 -12)`}
            />
          </g>
        );
      })}
      <polygon points={sel.points} fill="none" stroke="#0B1B2B" strokeWidth={5 / K} />
      <polygon points={sel.points} fill="none" stroke="#fff" strokeWidth={3 / K} />
      <circle
        cx={sel.box.x + sel.box.w - 10 / K}
        cy={sel.box.y + 10 / K}
        r={10 / K}
        fill="#fff"
        stroke="#0B1B2B"
        strokeWidth={1 / K}
      />
      <text
        x={sel.box.x + sel.box.w - 10 / K}
        y={sel.box.y + 10 / K}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12 / K}
        fontWeight={700}
        fill="#0B1B2B"
      >
        1
      </text>
    </svg>
  );
}
