'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { DEMO } from '@/lib/content';
import {
  LOTS,
  PLAN,
  STATUSES,
  STATUS_LABEL,
  centerOf,
  lotShape,
  type Lot,
  type StatusMap,
} from '@/lib/demo-lots';
import { COLOR, ICON } from '@/lib/plan-style';
import styles from './LotPlan.module.css';

const INK = '#0B1B2B';
const ZOOM_MAX = 8;
const DRAG_LIMIT = 5; // px: acima disso o toque vira arraste e não abre o lote
const NEAR_ICON = 24; // px: forma menor que isso na tela fica sem ícone

type Props = {
  statuses: StatusMap;
  selectedIds: readonly string[];
  openId: string | null;
  onLotClick: (lot: Lot) => void;
};

const shapes = new Map(LOTS.map((l) => [l.id, lotShape(l)]));

/** Vizinho mais próximo na direção da seta, entre os lotes que reagem. */
function neighbour(from: Lot, key: string, candidates: Lot[]): Lot | null {
  const a = centerOf(from);
  const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[key];
  if (!dir) return null;
  let best: Lot | null = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    if (c.id === from.id) continue;
    const b = centerOf(c);
    const along = (b.x - a.x) * dir[0]! + (b.y - a.y) * dir[1]!;
    const across = Math.abs((b.x - a.x) * dir[1]!) + Math.abs((b.y - a.y) * dir[0]!);
    if (along <= 0) continue;
    const score = along + 2 * across;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

/**
 * Planta com formas clicáveis, como `/maps` do sistema: desenho de fundo, uma forma por lote com
 * preenchimento e textura por status, ícone no centro (só se couber), dica ao passar o mouse,
 * contorno e selo numerado na seleção, zoom e arraste. Lote bloqueado não reage ao vendedor.
 */
export function LotPlan({ statuses, selectedIds, openId, onLotClick }: Props) {
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, '_');
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; sx: number; sy: number; on: boolean } | null>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState<string>(LOTS[0]!.id);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const ro = new ResizeObserver(([e]) => e && setWidth(e.contentRect.width));
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  const k = (width / PLAN.w) * zoom || 1; // px de tela por unidade do desenho
  const statusOf = (l: Lot) => statuses[l.id] ?? l.initialStatus;
  const reactive = LOTS.filter((l) => statusOf(l) !== 'bloqueado');
  const tabId = reactive.some((l) => l.id === tab) ? tab : reactive[0]?.id;
  const label = (l: Lot) =>
    `Lote ${String(l.number).padStart(2, '0')}, quadra ${l.block}, ${l.area} metros quadrados, ${STATUS_LABEL[statusOf(l)]}`;

  const zoomBy = (f: number) => setZoom((z) => Math.min(ZOOM_MAX, Math.max(1, z * f)));
  const fit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onKey = (e: React.KeyboardEvent<SVGElement>, lot: Lot) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onLotClick(lot);
      return;
    }
    const next = neighbour(lot, e.key, reactive);
    if (!next) return;
    e.preventDefault();
    setTab(next.id);
    svgRef.current
      ?.querySelector<SVGElement>(`[data-id="${next.id}"]`)
      ?.focus({ preventScroll: true });
  };

  const selected = useMemo(
    () => selectedIds.flatMap((id, i) => (shapes.has(id) ? [{ id, order: i + 1 }] : [])),
    [selectedIds]
  );
  const showTip = tip ? LOTS.find((l) => l.id === tip.id) : undefined;

  return (
    <div className={styles.wrap}>
      <div
        ref={rootRef}
        className={styles.root}
        data-zoomed={zoom > 1 || undefined}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, on: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || zoom === 1) return;
          if (!d.on) {
            if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) <= DRAG_LIMIT) return;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          drag.current = { ...d, x: e.clientX, y: e.clientY, on: true };
          setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <div
          className={styles.layer}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <svg
            ref={svgRef}
            className={styles.svg}
            viewBox={`0 0 ${PLAN.w} ${PLAN.h}`}
            role="group"
            aria-label={DEMO.mapLabel}
            aria-describedby={`${uid}-help`}
          >
            <defs>
              {STATUSES.filter((s) => s !== 'disponivel').flatMap((s) => {
                const c = COLOR[s];
                const t = (s === 'reservado' ? 10 : 6) / k;
                return [false, true].map((hover) => (
                  <pattern
                    key={`${s}${hover}`}
                    id={`${uid}-${s}${hover ? '-h' : ''}`}
                    patternUnits="userSpaceOnUse"
                    width={t}
                    height={t}
                    patternTransform={s === 'reservado' ? undefined : 'rotate(45)'}
                  >
                    <rect
                      width={t}
                      height={t}
                      fill={c.fill}
                      fillOpacity={c.alpha + (hover ? 0.12 : 0)}
                    />
                    {s === 'reservado' ? (
                      <circle cx={t / 2} cy={t / 2} r={1.2 / k} fill={c.stroke} />
                    ) : (
                      <>
                        <line
                          x1={t / 2}
                          y1={0}
                          x2={t / 2}
                          y2={t}
                          stroke={c.stroke}
                          strokeWidth={1.2 / k}
                        />
                        {s === 'bloqueado' && (
                          <line
                            x1={0}
                            y1={t / 2}
                            x2={t}
                            y2={t / 2}
                            stroke={c.stroke}
                            strokeWidth={1 / k}
                          />
                        )}
                      </>
                    )}
                  </pattern>
                ));
              })}
            </defs>

            <Backdrop />

            <g>
              {LOTS.map((lot) => {
                const status = statusOf(lot);
                const c = COLOR[status];
                const { points } = shapes.get(lot.id)!;
                const hot = tip?.id === lot.id;
                const common = {
                  points,
                  fill:
                    status === 'disponivel' ? c.fill : `url(#${uid}-${status}${hot ? '-h' : ''})`,
                  fillOpacity: status === 'disponivel' ? c.alpha + (hot ? 0.12 : 0) : undefined,
                  stroke: c.stroke,
                  strokeWidth: c.width + (hot ? 1 : 0),
                  strokeDasharray: status === 'bloqueado' ? '4 3' : undefined,
                  vectorEffect: 'non-scaling-stroke' as const,
                };
                if (status === 'bloqueado') {
                  return (
                    <polygon
                      key={lot.id}
                      {...common}
                      role="img"
                      aria-label={`${label(lot)}, indisponível`}
                      pointerEvents="none"
                    />
                  );
                }
                return (
                  <polygon
                    key={lot.id}
                    {...common}
                    data-id={lot.id}
                    role="button"
                    aria-label={
                      selectedIds.includes(lot.id) ? `${label(lot)}, selecionado` : label(lot)
                    }
                    tabIndex={lot.id === tabId ? 0 : -1}
                    cursor="pointer"
                    style={{ outline: 'none' }}
                    onClick={() => onLotClick(lot)}
                    onKeyDown={(e) => onKey(e, lot)}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== 'mouse') return;
                      const r = rootRef.current!.getBoundingClientRect();
                      setTip({ id: lot.id, x: e.clientX - r.left, y: e.clientY - r.top });
                    }}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && setTip(null)}
                    onFocus={(e) => {
                      setTab(lot.id);
                      if (e.currentTarget.matches(':focus-visible')) {
                        setFocusId(lot.id);
                        const r = rootRef.current!.getBoundingClientRect();
                        const b = e.currentTarget.getBoundingClientRect();
                        setTip({ id: lot.id, x: b.left + b.width / 2 - r.left, y: b.top - r.top });
                      }
                    }}
                    onBlur={() => {
                      setFocusId((f) => (f === lot.id ? null : f));
                      setTip(null);
                    }}
                  />
                );
              })}
            </g>

            <g aria-hidden="true" pointerEvents="none">
              {LOTS.map((lot) => {
                const { box } = shapes.get(lot.id)!;
                if (Math.min(box.w, box.h) * k < NEAR_ICON) return null;
                const s = statusOf(lot);
                const size = width >= 640 ? 18 : 16;
                return (
                  <path
                    key={lot.id}
                    d={ICON[s]}
                    fill={COLOR[s].stroke}
                    transform={`translate(${box.x + box.w / 2} ${box.y + box.h / 2}) scale(${size / (24 * k)}) translate(-12 -12)`}
                  />
                );
              })}
              {openId && <Outline id={openId} dashed />}
              {selected.map(({ id }) => (
                <Outline key={id} id={id} />
              ))}
              {focusId && <Ring id={focusId} />}
              {selected.map(({ id, order }) => (
                <Badge key={id} id={id} order={order} k={k} />
              ))}
            </g>
          </svg>
        </div>

        {showTip && (
          <p
            role="tooltip"
            aria-hidden="true"
            className={styles.tip}
            style={{ left: tip!.x, top: tip!.y - 8 }}
          >
            Lote {showTip.number} · Quadra {showTip.block} · {showTip.area} m² ·{' '}
            {STATUS_LABEL[statusOf(showTip)]}
          </p>
        )}

        <p id={`${uid}-help`} className="sr-only">
          Use as setas para mover entre os lotes e Enter para abrir o lote.
        </p>
      </div>

      <div className={styles.zoom} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Ampliar a planta" onClick={() => zoomBy(1.5)}>
          +
        </button>
        <button type="button" aria-label="Reduzir a planta" onClick={() => zoomBy(1 / 1.5)}>
          −
        </button>
        <button type="button" aria-label="Ajustar a planta à tela" onClick={fit}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <path
              d="M2 6V2h4M12 2h4v4M16 12v4h-4M6 16H2v-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Desenho de fundo (o "arquivo da planta"): quadras, rua e rótulos, sem interação. */
function Backdrop() {
  return (
    <g aria-hidden="true">
      <rect width={PLAN.w} height={PLAN.h} fill="#fff" />
      <rect x="0" y="210" width={PLAN.w} height="80" fill="#EEF2F6" />
      <line
        x1="0"
        y1="250"
        x2={PLAN.w}
        y2="250"
        stroke="#B8C2CD"
        strokeWidth="2"
        strokeDasharray="14 10"
      />
      <text x="400" y="244" textAnchor="middle" className={styles.street}>
        Rua das Acácias
      </text>
      <text x="40" y="22" className={styles.block}>
        Quadra A
      </text>
      <text x="40" y="282" className={styles.block} dy="0">
        Quadra B
      </text>
    </g>
  );
}

const NO_FILL = {
  fill: 'none',
  vectorEffect: 'non-scaling-stroke' as const,
  pointerEvents: 'none' as const,
};

function Outline({ id, dashed = false }: { id: string; dashed?: boolean }) {
  const { points } = shapes.get(id)!;
  return (
    <>
      <polygon points={points} {...NO_FILL} stroke="#fff" strokeWidth={5} />
      <polygon
        points={points}
        {...NO_FILL}
        stroke={INK}
        strokeWidth={3}
        strokeDasharray={dashed ? '6 3' : undefined}
      />
    </>
  );
}

/** Foco por teclado: anel azul por dentro, branco por fora. */
function Ring({ id }: { id: string }) {
  const { points } = shapes.get(id)!;
  return (
    <>
      <polygon points={points} {...NO_FILL} stroke="#fff" strokeWidth={7} />
      <polygon points={points} {...NO_FILL} stroke="#1565C0" strokeWidth={3} />
    </>
  );
}

/** Selo com a ordem de adição (1, 2, 3...) no canto superior direito da forma. */
function Badge({ id, order, k }: { id: string; order: number; k: number }) {
  const { box } = shapes.get(id)!;
  const r = 10 / k;
  const cx = box.x + box.w - r;
  const cy = box.y + r;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={INK}
        stroke="#fff"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12 / k}
        fontWeight={700}
        fill="#fff"
      >
        {order}
      </text>
    </g>
  );
}
