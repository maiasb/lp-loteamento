// Dados FICTÍCIOS da demonstração (RN-05). Estado vive só no cliente (CA-09).

export type LotStatus = 'disponivel' | 'reservado' | 'vendido' | 'bloqueado';
export type Block = 'A' | 'B';

export type Lot = {
  id: string; // "A-05"
  block: Block;
  number: number;
  area: number; // m²
  price: number; // R$ fictício
  initialStatus: LotStatus;
};

export const BLOCKS: Block[] = ['A', 'B'];
export const STATUSES: LotStatus[] = ['disponivel', 'reservado', 'vendido', 'bloqueado'];
export const STATUS_LABEL: Record<LotStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  bloqueado: 'Bloqueado',
};

const SOLD = new Set(['A-03', 'A-04', 'A-09', 'B-06']);
const RESERVED = new Set(['A-07', 'A-12', 'B-02', 'B-08', 'B-09', 'B-11']);
const BLOCKED = new Set(['A-06', 'B-05']);
const PRICE_PER_M2: Record<Block, number> = { A: 420, B: 450 };

const initialOf = (id: string): LotStatus =>
  SOLD.has(id)
    ? 'vendido'
    : RESERVED.has(id)
      ? 'reservado'
      : BLOCKED.has(id)
        ? 'bloqueado'
        : 'disponivel';

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
      initialStatus: initialOf(id),
    } satisfies Lot;
  })
);

export type StatusMap = Record<string, LotStatus>;

export const initialStatuses = (): StatusMap =>
  Object.fromEntries(LOTS.map((l) => [l.id, l.initialStatus]));

export function countByStatus(statuses: StatusMap) {
  const counts: Record<LotStatus, number> = {
    disponivel: 0,
    reservado: 0,
    vendido: 0,
    bloqueado: 0,
  };
  for (const lot of LOTS) counts[statuses[lot.id] ?? lot.initialStatus]++;
  return counts;
}

/** Planta fictícia: 800 x 500. Cada quadra é uma grade de 6 colunas x 2 linhas de lotes. */
export const PLAN = { w: 800, h: 500 };
const GRID = { x0: 40, cw: 120, ch: 90, A: 30, B: 290 };

/** Vértice da grade regular: os lotes são retângulos alinhados. */
function vertex(block: Block, gx: number, gy: number): [number, number] {
  const y0 = block === 'A' ? GRID.A : GRID.B;
  return [GRID.x0 + gx * GRID.cw, y0 + gy * GRID.ch];
}

/** Contorno do lote (como uma forma ligada da planta do sistema) e a caixa que o envolve. */
export function lotShape(lot: Lot): {
  points: string;
  box: { x: number; y: number; w: number; h: number };
} {
  const i = lot.number - 1;
  const col = i % 6;
  const row = Math.floor(i / 6);
  const v = [
    vertex(lot.block, col, row),
    vertex(lot.block, col + 1, row),
    vertex(lot.block, col + 1, row + 1),
    vertex(lot.block, col, row + 1),
  ];
  const xs = v.map((p) => p[0]);
  const ys = v.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    points: v.map((p) => p.join(',')).join(' '),
    box: { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y },
  };
}

/** Ordem de leitura de cada lote na planta: quadra A, depois B, linha a linha. */
export const centerOf = (lot: Lot) => {
  const { box } = lotShape(lot);
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
};

/** Resumo da seleção, ex.: "3 lotes · 1.050 m² · R$ 450.000,00". */
export function summary(lots: Lot[]): string {
  const area = lots.reduce((sum, l) => sum + l.area, 0);
  const total = lots.reduce((sum, l) => sum + l.price, 0);
  return `${lots.length} ${lots.length === 1 ? 'lote' : 'lotes'} · ${area.toLocaleString('pt-BR')} m² · ${brl(total)}`;
}

export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
