'use client';

import { useRef, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/content';
import {
  LOTS,
  STATUSES,
  STATUS_LABEL,
  brl,
  countByStatus,
  initialStatuses,
  summary,
  type Lot,
  type LotStatus,
  type StatusMap,
} from '@/lib/demo-lots';
import { LotPlan } from './LotPlan';
import styles from './LotDemo.module.css';

/** Ícone de 16 px por status: o status nunca depende só da cor. */
function StatusIcon({ status }: { status: LotStatus }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {status === 'bloqueado' || status === 'vendido' ? (
          <>
            <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
            <path d={status === 'bloqueado' ? 'M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7' : 'M8 9.2v2.2'} />
          </>
        ) : (
          <>
            <circle cx="8" cy="8" r="6.5" />
            <path d={status === 'disponivel' ? 'M5 8.2l2 2 4-4.4' : 'M8 4.5V8l2.5 1.5'} />
          </>
        )}
      </g>
    </svg>
  );
}

export function LotDemo({ children }: { children?: ReactNode }) {
  const [statuses, setStatuses] = useState<StatusMap>(initialStatuses);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [justReserved, setJustReserved] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const flip = useRef(false);

  const statusOf = (l: Lot) => statuses[l.id] ?? l.initialStatus;
  const counts = countByStatus(statuses);
  const open = LOTS.find((l) => l.id === openId) ?? null;
  const openStatus = open ? statusOf(open) : null;
  const selected = LOTS.filter((l) => selectedIds.includes(l.id));
  const isSelected = open ? selectedIds.includes(open.id) : false;

  const announce = (msg: string) => {
    flip.current = !flip.current;
    setAnnouncement(flip.current ? msg : `${msg} `); // força nova leitura da mesma frase
  };

  const openLot = (lot: Lot) => {
    setOpenId(lot.id);
    setJustReserved([]);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  const toggleSelect = (lot: Lot) => {
    setSelectedIds((ids) =>
      ids.includes(lot.id) ? ids.filter((i) => i !== lot.id) : [...ids, lot.id]
    );
  };

  const reserve = (ids: string[]) => {
    const next = { ...statuses };
    for (const id of ids) if (next[id] === 'disponivel') next[id] = 'reservado';
    const c = countByStatus(next);
    setStatuses(next);
    setSelectedIds((cur) => cur.filter((id) => !ids.includes(id)));
    setJustReserved(ids);
    announce(
      `${ids.length === 1 ? `Lote ${ids[0]} reservado` : `${ids.length} lotes reservados`} na demonstração. Agora: ${c.disponivel} disponíveis, ${c.reservado} reservados, ${c.vendido} vendidos, ${c.bloqueado} bloqueados.`
    );
  };

  const restart = () => {
    setStatuses(initialStatuses());
    setSelectedIds([]);
    setOpenId(null);
    setJustReserved([]);
    announce(DEMO.restarted);
  };

  const closePanel = () => {
    setOpenId(null);
    setJustReserved([]);
  };

  const others = selectedIds.length > 0 && !isSelected;
  const reason =
    openStatus === 'reservado'
      ? DEMO.alreadyReserved
      : openStatus === 'vendido'
        ? DEMO.alreadySold
        : openStatus === 'bloqueado'
          ? DEMO.alreadyBlocked
          : '';

  return (
    <div className={styles.card} onKeyDown={(e) => e.key === 'Escape' && closePanel()}>
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

      <ul className={styles.legend} aria-label="Legenda dos lotes">
        {STATUSES.map((s) => (
          <li key={s} className={`${styles.chip} ${styles[s]}`}>
            <StatusIcon status={s} />
            {STATUS_LABEL[s]} <strong>{counts[s]}</strong>
          </li>
        ))}
      </ul>

      <div className={styles.stage}>
        <LotPlan
          statuses={statuses}
          selectedIds={selectedIds}
          openId={openId}
          onLotClick={openLot}
        />

        <div className={styles.panel} ref={panelRef}>
          {open && openStatus ? (
            <div key={open.id} className={styles.panelBody}>
              <div className={styles.panelHead}>
                <div>
                  <h3 className={styles.panelTitle}>Lote {String(open.number).padStart(2, '0')}</h3>
                  <p className={styles.sub}>
                    Quadra {open.block} · {DEMO.name}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.x}
                  aria-label="Fechar painel"
                  onClick={closePanel}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M4 4l10 10M14 4L4 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <p className={`${styles.chip} ${styles[openStatus]}`}>
                <StatusIcon status={openStatus} />
                {STATUS_LABEL[openStatus]}
              </p>
              <dl className={styles.data}>
                <div>
                  <dt>Área</dt>
                  <dd>{open.area} m²</dd>
                </div>
                <div>
                  <dt>Preço (fictício)</dt>
                  <dd>{brl(open.price)}</dd>
                </div>
                <div>
                  <dt>Preço por m²</dt>
                  <dd>{brl(open.price / open.area)}</dd>
                </div>
              </dl>
              <div className={styles.action}>
                {openStatus === 'reservado' && justReserved.includes(open.id) ? (
                  <p className={styles.success}>{DEMO.reserved}</p>
                ) : openStatus === 'disponivel' ? (
                  isSelected ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-md btn-primary"
                        onClick={() => reserve(selectedIds)}
                      >
                        Reservar ({selectedIds.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-md btn-outline"
                        onClick={() => toggleSelect(open)}
                      >
                        Remover da seleção
                      </button>
                    </>
                  ) : others ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-md btn-primary"
                        onClick={() => toggleSelect(open)}
                      >
                        Adicionar à seleção
                      </button>
                      <button
                        type="button"
                        className="btn btn-md btn-outline"
                        onClick={() => reserve([open.id])}
                      >
                        Reservar só este lote
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-md btn-primary"
                        onClick={() => reserve([open.id])}
                      >
                        Reservar este lote
                      </button>
                      <button
                        type="button"
                        className="btn btn-md btn-outline"
                        onClick={() => toggleSelect(open)}
                      >
                        Adicionar à seleção
                      </button>
                    </>
                  )
                ) : (
                  <p className={styles.reason}>{reason}</p>
                )}
              </div>
            </div>
          ) : (
            <p className={styles.empty}>{DEMO.empty}</p>
          )}
          <p className={styles.fictional}>Valores fictícios.</p>
        </div>
      </div>

      <div className={styles.selection} role="region" aria-label="Ações da seleção">
        {selected.length > 0 ? (
          <>
            <p className={styles.selTitle}>{summary(selected)}</p>
            <ul className={styles.selList} aria-label="Lotes selecionados">
              {selected.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    className={styles.selChip}
                    aria-label={`Remover lote ${l.id} da seleção`}
                    onClick={() => toggleSelect(l)}
                  >
                    {l.id} <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.selActions}>
              <button
                type="button"
                className="btn btn-md btn-primary"
                onClick={() => reserve(selectedIds)}
              >
                Reservar ({selected.length})
              </button>
              <button
                type="button"
                className="btn btn-md btn-outline"
                onClick={() => setSelectedIds([])}
              >
                Limpar seleção
              </button>
            </div>
          </>
        ) : (
          <p className={styles.selEmpty}>{DEMO.selectionEmpty}</p>
        )}
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
      {children}
    </div>
  );
}
