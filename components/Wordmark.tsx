import Link from 'next/link';
import styles from './Wordmark.module.css';

/** Glifo: quatro quadrados, o de baixo à direita é o "lote selecionado" (lime). */
export function Glyph({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {[
        [2, 2],
        [17, 2],
        [2, 17],
      ].map(([x, y], i) => (
        <rect
          key={i}
          className={styles.quad}
          style={{ '--i': i } as React.CSSProperties}
          x={x}
          y={y}
          width="13"
          height="13"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      ))}
      <rect
        className={styles.quad}
        style={{ '--i': 3 } as React.CSSProperties}
        x="17"
        y="17"
        width="13"
        height="13"
        rx="3"
        fill="#C6F24E"
      />
    </svg>
  );
}

export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <Link href="/" className={styles.wordmark} style={{ fontSize: size }}>
      <Glyph size={32} />
      <span>Loteamento Inteligente</span>
    </Link>
  );
}
