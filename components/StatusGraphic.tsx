import type { LotStatus } from '@/lib/demo-lots';

export const STATUS_COLOR: Record<LotStatus, string> = {
  disponivel: '#2E7D32',
  reservado: '#B26A00',
  vendido: '#FFFFFF',
};

/** Ícone de 16 px por status (círculo com check, relógio, cadeado): status nunca só por cor. */
export function StatusIcon({
  status,
  x = 0,
  y = 0,
  size = 16,
}: {
  status: LotStatus;
  x?: number;
  y?: number;
  size?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${size / 16})`}
      fill="none"
      stroke={STATUS_COLOR[status]}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {status === 'vendido' ? (
        <>
          <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
          <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" />
        </>
      ) : (
        <>
          <circle cx="8" cy="8" r="6.5" />
          <path d={status === 'disponivel' ? 'M5 8.2l2 2 4-4.4' : 'M8 4.5V8l2.5 1.5'} />
        </>
      )}
    </g>
  );
}

const FILL: Record<LotStatus, string> = {
  disponivel: '#E4F3E6',
  reservado: '#FFE7B8',
  vendido: '#C62828',
};
const STROKE: Record<LotStatus, [string, number]> = {
  disponivel: ['#2E7D32', 1.5],
  reservado: ['#B26A00', 1.5],
  vendido: ['#8E1B1B', 2.5],
};

/** Preenchimento + contorno + hachura (reservado) de um lote 76×68 com recuo de 2 px. */
export function StatusShape({ status }: { status: LotStatus }) {
  const [stroke, width] = STROKE[status];
  return (
    <>
      <rect
        x="2"
        y="2"
        width="76"
        height="68"
        rx="6"
        fill={FILL[status]}
        stroke={stroke}
        strokeWidth={width}
      />
      {status === 'reservado' && (
        <rect x="2" y="2" width="76" height="68" rx="6" fill="url(#demo-hatch)" />
      )}
      <StatusIcon status={status} x={8} y={48} />
    </>
  );
}

/** Amostra de 20 px para a legenda. */
export function Swatch({ status }: { status: LotStatus }) {
  const [stroke, width] = STROKE[status];
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="4"
        fill={FILL[status]}
        stroke={stroke}
        strokeWidth={Math.min(width, 2)}
      />
      {status === 'reservado' && (
        <rect x="1" y="1" width="18" height="18" rx="4" fill="url(#demo-hatch)" />
      )}
      <StatusIcon status={status} x={4} y={4} size={12} />
    </svg>
  );
}
