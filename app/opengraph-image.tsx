import { ImageResponse } from 'next/og';
import { SEO } from '@/lib/content';

export const alt = SEO.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

type S = 'd' | 'r' | 'v';
const BLOCK_1: S[] = ['d', 'd', 'v', 'r', 'd', 'd'];
const BLOCK_2: S[] = ['d', 'r', 'd', 'd', 'v', 'd'];
const BLOCK_3: S[] = ['d', 'd', 'r', 'd', 'd', 'd'];
const BLOCK_4: S[] = ['v', 'd', 'd', 'r', 'd', 'd'];
const COLORS: Record<S, { border: string; bg: string }> = {
  d: { border: '#81C784', bg: 'rgba(129,199,132,0.16)' },
  r: { border: '#FFB74D', bg: 'rgba(255,183,77,0.30)' },
  v: { border: '#EF5350', bg: '#EF5350' },
};

// Gerada no build (rota estática). Fonte padrão do ImageResponse: Bricolage não é carregada aqui.
export default function OpengraphImage() {
  const rows = [BLOCK_1, BLOCK_2, BLOCK_3, BLOCK_4];
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0B1B2B',
        color: '#F6F4EE',
        padding: '72px 80px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, fontWeight: 700 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 56, height: 56, marginRight: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                margin: 2,
                borderRadius: 6,
                border: i === 3 ? 'none' : '3px solid #F6F4EE',
                background: i === 3 ? '#C6F24E' : 'transparent',
              }}
            />
          ))}
        </div>
        Loteamento Inteligente
      </div>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 560,
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          <span>Mapa, lotes e</span>
          <span style={{ color: '#C6F24E' }}>reservas em</span>
          <span>um só sistema</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto', width: 440 }}>
          {rows.map((row, r) => (
            <div key={r} style={{ display: 'flex', marginBottom: r === 1 ? 36 : 8 }}>
              {row.map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: 64,
                    height: 76,
                    marginRight: i === 5 ? 0 : 8,
                    borderRadius: 8,
                    border: `3px solid ${r === 2 && i === 3 ? '#C6F24E' : COLORS[s].border}`,
                    background: COLORS[s].bg,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 26, color: '#A9B8C6' }}>
        Mapa, quadras, lotes e reservas
      </div>
    </div>,
    size
  );
}
