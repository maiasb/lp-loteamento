'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { DEMO } from '@/lib/content';
import {
  BLOCKS,
  LOTS,
  STATUS_LABEL,
  brl,
  countByStatus,
  initialStatuses,
  lotXY,
  moveFocus,
  type Block,
  type Lot,
  type LotStatus,
  type MoveKey,
  type StatusMap,
  type Variant,
} from '@/lib/demo-lots';
import { StatusIcon, StatusShape, Swatch } from './StatusGraphic';
import styles from './LotDemo.module.css';

const VIEWBOX: Record<Variant, string> = { wide: '0 0 820 488', narrow: '0 0 336 232' };
const STATUSES: LotStatus[] = ['disponivel', 'reservado', 'vendido'];
// Começa pelo texto visível do lote ("A-01"): o nome acessível contém o rótulo (WCAG 2.5.3).
const lotLabel = (l: Lot, s: LotStatus) =>
  `${l.id}, quadra ${l.block}, lote ${String(l.number).padStart(2, '0')}, ${l.area} metros quadrados, ${STATUS_LABEL[s]}`;

function keyToMove(e: KeyboardEvent): MoveKey | null {
  if (e.key === 'Home') return e.ctrlKey ? 'CtrlHome' : 'Home';
  if (e.key === 'End') return e.ctrlKey ? 'CtrlEnd' : 'End';
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
    ? (e.key as MoveKey)
    : null;
}

export function LotDemo({ children }: { children?: ReactNode }) {
  const [statuses, setStatuses] = useState<StatusMap>(initialStatuses);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string>(LOTS[0]?.id ?? '');
  const [focusRingId, setFocusRingId] = useState<string | null>(null);
  const [block, setBlock] = useState<Block>('A');
  const [justReserved, setJustReserved] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const refs = useRef(new Map<string, SVGGElement>());
  const panelRef = useRef<HTMLDivElement>(null);
  const flip = useRef(false);

  const counts = countByStatus(statuses);
  const selected = LOTS.find((l) => l.id === selectedId) ?? null;

  const announce = (msg: string) => {
    flip.current = !flip.current;
    setAnnouncement(flip.current ? msg : `${msg} `); // força nova leitura da mesma frase
  };

  const focusLot = (id: string, variant?: Variant) => {
    const order: Variant[] = variant ? [variant] : ['wide', 'narrow'];
    for (const v of order) {
      const el = refs.current.get(`${v}:${id}`);
      if (el && el.getClientRects().length > 0) return el.focus();
    }
  };

  const select = (lot: Lot, viaKeyboard = false) => {
    setSelectedId(lot.id);
    setFocusId(lot.id);
    setJustReserved(null);
    // Pelo teclado o foco fica no lote: rolar até o painel o tiraria da tela.
    if (!viaKeyboard && window.matchMedia('(max-width: 767px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const reserve = (lot: Lot) => {
    if (statuses[lot.id] !== 'disponivel') return;
    const next = { ...statuses, [lot.id]: 'reservado' as const };
    const c = countByStatus(next);
    setStatuses(next);
    setJustReserved(lot.id);
    announce(
      `Lote ${lot.id} reservado na demonstração. Agora: ${c.disponivel} disponíveis, ${c.reservado} reservados, ${c.vendido} vendidos.`
    );
    focusLot(lot.id);
  };

  const restart = () => {
    setStatuses(initialStatuses());
    setSelectedId(null);
    setJustReserved(null);
    setFocusId(LOTS[0]?.id ?? '');
    announce(DEMO.restarted);
  };

  const onLotKey = (e: KeyboardEvent, lot: Lot, variant: Variant, visible: Lot[]) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(lot, true);
    } else if (e.key === 'Escape') {
      setSelectedId(null);
      setJustReserved(null);
    } else {
      const move = keyToMove(e);
      if (!move) return;
      e.preventDefault();
      const target = moveFocus(lot, move, variant, visible);
      if (target) {
        setFocusId(target.id);
        focusLot(target.id, variant);
      }
    }
  };

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next: Block = block === 'A' ? 'B' : 'A';
    setBlock(next);
    document.getElementById(`demo-tab-${next}`)?.focus();
  };

  const renderMap = (variant: Variant) => {
    const visible = variant === 'wide' ? LOTS : LOTS.filter((l) => l.block === block);
    const rovingId = visible.some((l) => l.id === focusId) ? focusId : visible[0]?.id;
    const ringLot = visible.find((l) => l.id === focusRingId);
    const selLot = visible.find((l) => l.id === selectedId);
    return (
      <div className={styles[variant]}>
        <svg
          viewBox={VIEWBOX[variant]}
          width={variant === 'wide' ? 820 : 336}
          height={variant === 'wide' ? 488 : 232}
          role="group"
          aria-label={`Mapa de demonstração do ${DEMO.name}, com lotes por quadra`}
          className={styles.svg}
        >
          {variant === 'wide' && <WideBackdrop />}
          {visible.map((lot) => {
            const status = statuses[lot.id] ?? lot.initialStatus;
            const { x, y } = lotXY(lot, variant);
            return (
              <g
                key={lot.id}
                ref={(el) => {
                  if (el) refs.current.set(`${variant}:${lot.id}`, el);
                  else refs.current.delete(`${variant}:${lot.id}`);
                }}
                transform={`translate(${x} ${y})`}
                role="button"
                tabIndex={lot.id === rovingId ? 0 : -1}
                aria-pressed={lot.id === selectedId}
                aria-label={lotLabel(lot, status)}
                data-status={status}
                className={styles.lot}
                onClick={() => select(lot)}
                onKeyDown={(e) => onLotKey(e, lot, variant, visible)}
                onFocus={(e) => {
                  setFocusId(lot.id);
                  setFocusRingId(e.currentTarget.matches(':focus-visible') ? lot.id : null);
                }}
                onBlur={() => setFocusRingId(null)}
              >
                <rect width="80" height="72" fill="transparent" />
                {STATUSES.map((s) => (
                  <g key={s} className={`${styles.layer} ${styles[s]}`}>
                    <StatusShape status={s} />
                  </g>
                ))}
                <rect className={styles.hover} x="2" y="2" width="76" height="68" rx="6" />
                <text
                  className={styles.num}
                  x="40"
                  y="28"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {lot.id}
                </text>
              </g>
            );
          })}
          {/* Anéis por cima de todos os lotes, para nunca ficarem sob o vizinho. */}
          <g aria-hidden="true" pointerEvents="none">
            {selLot && <SelectionRing key={selLot.id} lot={selLot} variant={variant} />}
            {ringLot && <FocusRing lot={ringLot} variant={variant} />}
          </g>
        </svg>
      </div>
    );
  };

  const statusOf = (l: Lot) => statuses[l.id] ?? l.initialStatus;
  const selStatus = selected ? statusOf(selected) : null;
  const reason =
    selStatus === 'reservado'
      ? DEMO.alreadyReserved
      : selStatus === 'vendido'
        ? DEMO.alreadySold
        : '';

  return (
    <div className={styles.card}>
      <svg width="0" height="0" className={styles.defs} aria-hidden="true" focusable="false">
        <defs>
          <pattern
            id="demo-hatch"
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
              stroke="#B26A00"
              strokeOpacity=".35"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
      </svg>

      <div className={styles.bar}>
        <p className={styles.notice}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 7.2V11M8 4.8v.1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {DEMO.notice}
        </p>
        <button type="button" className={`link ${styles.restart}`} onClick={restart}>
          Recomeçar
        </button>
      </div>

      <ul className={styles.legend}>
        {STATUSES.map((s) => (
          <li key={s}>
            <Swatch status={s} />
            {STATUS_LABEL[s]}
            <strong>{counts[s]}</strong>
          </li>
        ))}
      </ul>

      <div className={styles.tabs} role="tablist" aria-label="Quadras" onKeyDown={onTabKey}>
        {BLOCKS.map((b) => {
          const n = countByStatus(
            statuses,
            LOTS.filter((l) => l.block === b)
          ).disponivel;
          return (
            <button
              key={b}
              id={`demo-tab-${b}`}
              type="button"
              role="tab"
              aria-selected={block === b}
              aria-controls="demo-map-narrow"
              tabIndex={block === b ? 0 : -1}
              className={styles.tab}
              onClick={() => setBlock(b)}
            >
              Quadra {b} · {n} disp.
            </button>
          );
        })}
      </div>

      <div className={styles.stage}>
        <div
          className={styles.mapBox}
          id="demo-map-narrow"
          role="tabpanel"
          aria-label={`Quadra ${block}`}
        >
          {renderMap('narrow')}
        </div>
        <div className={styles.mapBoxWide}>{renderMap('wide')}</div>

        <div className={styles.panel} ref={panelRef}>
          {selected && selStatus ? (
            <div key={selected.id} className={styles.panelBody}>
              <h3 className={styles.panelTitle}>Lote {selected.id}</h3>
              <p className={`${styles.chip} ${styles[selStatus]}`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <StatusIcon status={selStatus} />
                </svg>
                {STATUS_LABEL[selStatus]}
              </p>
              <dl className={styles.data}>
                <div>
                  <dt>Quadra</dt>
                  <dd>{selected.block}</dd>
                </div>
                <div>
                  <dt>Lote</dt>
                  <dd>{String(selected.number).padStart(2, '0')}</dd>
                </div>
                <div>
                  <dt>Área</dt>
                  <dd>{selected.area} m²</dd>
                </div>
                <div>
                  <dt>Preço (fictício)</dt>
                  <dd>{brl(selected.price)}</dd>
                </div>
              </dl>
              <div className={styles.action}>
                {justReserved === selected.id ? (
                  <p className={styles.success}>{DEMO.reserved}</p>
                ) : selStatus === 'disponivel' ? (
                  <button
                    type="button"
                    className="btn btn-md btn-primary"
                    onClick={() => reserve(selected)}
                  >
                    Reservar (demonstração)
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-md btn-disabled"
                      aria-disabled="true"
                      aria-describedby="demo-reason"
                    >
                      Reservar (demonstração)
                    </button>
                    <p id="demo-reason" className={styles.reason}>
                      {reason}
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                className={`link ${styles.close}`}
                onClick={() => {
                  setSelectedId(null);
                  setJustReserved(null);
                }}
              >
                Fechar detalhes
              </button>
            </div>
          ) : (
            <p className={styles.empty}>Toque em um lote do mapa para ver os detalhes</p>
          )}
          <p className={styles.fictional}>Valores fictícios.</p>
        </div>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
      {children}
    </div>
  );
}

function SelectionRing({ lot, variant }: { lot: Lot; variant: Variant }) {
  const { x, y } = lotXY(lot, variant);
  return (
    <g transform={`translate(${x} ${y})`} className={styles.fadeIn}>
      <rect
        x="0"
        y="0"
        width="80"
        height="72"
        rx="8"
        fill="none"
        stroke="#1565C0"
        strokeWidth="4"
      />
      <rect
        x="62"
        y="6"
        width="10"
        height="10"
        rx="2"
        fill="#C6F24E"
        stroke="#0B1B2B"
        strokeWidth="1"
      />
    </g>
  );
}

function FocusRing({ lot, variant }: { lot: Lot; variant: Variant }) {
  const { x, y } = lotXY(lot, variant);
  return (
    <g transform={`translate(${x} ${y})`} className={styles.focusRing}>
      <rect
        x="-2"
        y="-2"
        width="84"
        height="76"
        rx="10"
        fill="none"
        stroke="#0B1B2B"
        strokeWidth="3"
      />
      <rect
        x="0.5"
        y="0.5"
        width="79"
        height="71"
        rx="8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
    </g>
  );
}

function WideBackdrop() {
  return (
    <g aria-hidden="true">
      <rect x="0" y="0" width="820" height="488" fill="#EAF0F6" />
      <rect x="0" y="204" width="820" height="80" fill="#FFFFFF" />
      <line
        x1="0"
        y1="244"
        x2="820"
        y2="244"
        stroke="#D5DCE4"
        strokeWidth="2"
        strokeDasharray="14 10"
      />
      <text x="60" y="230" className={styles.street}>
        Rua das Acácias
      </text>
      <rect x="580" y="60" width="180" height="144" rx="6" fill="#DDEBD8" />
      <text x="670" y="132" textAnchor="middle" className={styles.area}>
        Praça
      </text>
      <rect x="580" y="284" width="180" height="144" rx="6" fill="#DDEBD8" />
      <text x="670" y="356" textAnchor="middle" className={styles.area}>
        Área de lazer
      </text>
    </g>
  );
}
