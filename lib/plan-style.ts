import type { LotStatus } from './demo-lots';

// Mesmas cores, preenchimentos e bordas do sistema (theme/tokens.ts: lotStatusColors e lotTile).
export const COLOR: Record<
  LotStatus,
  { fill: string; stroke: string; alpha: number; width: number }
> = {
  disponivel: { fill: '#43A047', stroke: '#1B5E20', alpha: 0.1, width: 1 },
  reservado: { fill: '#F57C00', stroke: '#E65100', alpha: 0.2, width: 1 },
  vendido: { fill: '#D32F2F', stroke: '#B71C1C', alpha: 0.32, width: 2 },
  bloqueado: { fill: '#9E9E9E', stroke: '#616161', alpha: 0.16, width: 1 },
};
// Ícones 24x24 do Material (check, relógio, moeda, cadeado), como `lotStatusIcon` do sistema.
export const ICON: Record<LotStatus, string> = {
  disponivel: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  reservado:
    'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8m.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  vendido:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m.89-8.9c-1.78-.59-2.64-.96-2.64-1.9 0-1.02 1.11-1.39 1.81-1.39 1.31 0 1.79.99 1.9 1.34l1.58-.67c-.15-.44-.82-1.91-2.66-2.23V5h-1.75v1.26c-2.6.56-2.62 2.85-2.62 2.96 0 2.27 2.25 2.91 3.35 3.31 1.58.56 2.28 1.07 2.28 2.03 0 1.13-1.05 1.61-1.98 1.61-1.82 0-2.34-1.87-2.4-2.09l-1.66.67c.63 2.19 2.28 2.78 3.02 2.96V19h1.75v-1.24c.52-.09 3.02-.59 3.02-3.22.01-1.39-.6-2.61-3-3.44',
  bloqueado:
    'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2',
};
