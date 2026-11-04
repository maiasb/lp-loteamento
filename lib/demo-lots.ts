// Dados e geometria FICTÍCIOS da demonstração (RN-05). Estado vive só no cliente (CA-09).

export type LotStatus = 'disponivel' | 'reservado' | 'vendido';
export type Block = 'A' | 'B';
export type Variant = 'wide' | 'narrow';

export type Lot = {
  id: string; // "A-05"
  block: Block;
  number: number;
  area: number; // m²
  price: number; // R$ fictício
  initialStatus: LotStatus;
};

export const BLOCKS: Block[] = ['A', 'B'];
export const STATUS_LABEL: Record<LotStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
};

const SOLD = new Set(['A-03', 'A-04', 'A-09', 'B-06']);
const RESERVED = new Set(['A-07', 'A-12', 'B-02', 'B-08', 'B-09', 'B-11']);
const PRICE_PER_M2: Record<Block, number> = { A: 420, B: 450 };

export const LOTS: Lot[] = BLOCKS.flatMap((block) =>
  Array.from({ length: 12 }, (_, i) => {
    const number = i + 1;
    const id = `${block}-${String(number).padStart(2, '0')}`;
    const corner = i % 6 === 0 || i % 6 === 5;
    const area = corner ? 360 : 300;
    return {
      id,
      block,
      number,
      area,
      price: area * PRICE_PER_M2[block],
      initialStatus: SOLD.has(id) ? 'vendido' : RESERVED.has(id) ? 'reservado' : 'disponivel',
    } satisfies Lot;
  })
);

export type StatusMap = Record<string, LotStatus>;

export const initialStatuses = (): StatusMap =>
  Object.fromEntries(LOTS.map((l) => [l.id, l.initialStatus]));

export function countByStatus(statuses: StatusMap, lots: Lot[] = LOTS) {
  const counts: Record<LotStatus, number> = { disponivel: 0, reservado: 0, vendido: 0 };
  for (const lot of lots) counts[statuses[lot.id] ?? lot.initialStatus]++;
  return counts;
}

/** Posição na grade: larga = grade contínua 6×4 (A em 0-1, B em 2-3); estreita = 4×3 da quadra. */
export function gridPos(lot: Lot, variant: Variant): { row: number; col: number } {
  const i = lot.number - 1;
  if (variant === 'wide') {
    return { row: Math.floor(i / 6) + (lot.block === 'B' ? 2 : 0), col: i % 6 };
  }
  return { row: Math.floor(i / 4), col: i % 4 };
}

export const GRID = { wide: { rows: 4, cols: 6 }, narrow: { rows: 3, cols: 4 } } as const;
export const CELL = { w: 80, h: 72 };
const ORIGIN = { wide: { x: 60, y: 60, blockGap: 80 }, narrow: { x: 8, y: 8, blockGap: 0 } };

/** Canto superior esquerdo do lote no viewBox da variante. */
export function lotXY(lot: Lot, variant: Variant): { x: number; y: number } {
  const { row, col } = gridPos(lot, variant);
  const o = ORIGIN[variant];
  // Na larga, a rua (80 px) separa as quadras A (linhas 0-1) e B (linhas 2-3).
  const street = variant === 'wide' && row >= 2 ? o.blockGap : 0;
  return { x: o.x + col * CELL.w, y: o.y + row * CELL.h + street };
}

export type MoveKey =
  'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End' | 'CtrlHome' | 'CtrlEnd';

/** Próximo lote no teclado (roving tabindex); `null` se a seta cair fora da grade. */
export function moveFocus(from: Lot, key: MoveKey, variant: Variant, visible: Lot[]): Lot | null {
  const { row, col } = gridPos(from, variant);
  const { rows, cols } = GRID[variant];
  const at = (r: number, c: number) =>
    visible.find((l) => {
      const p = gridPos(l, variant);
      return p.row === r && p.col === c;
    }) ?? null;
  switch (key) {
    case 'ArrowUp':
      return at(row - 1, col);
    case 'ArrowDown':
      return at(row + 1, col);
    case 'ArrowLeft':
      return at(row, col - 1);
    case 'ArrowRight':
      return at(row, col + 1);
    case 'Home':
      return at(row, 0);
    case 'End':
      return at(row, cols - 1);
    case 'CtrlHome':
      return visible[0] ?? null;
    case 'CtrlEnd': {
      return at(rows - 1, cols - 1);
    }
  }
}

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
