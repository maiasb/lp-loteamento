'use client';

import { useEffect, useState } from 'react';
import styles from './StickyCta.module.css';

/**
 * Barra inferior fixa (celular). Some enquanto #contato ocupa >= 30% da tela (CA-03) e, como o
 * resto da página, qualquer link para #contato leva o foco ao campo Nome (CA-02).
 */
export function StickyCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById('contato');
    if (!target) return;
    // Faixa de 1% a 70% da altura da tela: a seção a cruza quando já cobre >= 30% dela.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const passed = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
        setHidden(entry.isIntersecting || passed);
      },
      { rootMargin: '-69% 0px -30% 0px' }
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href="#contato"]');
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const card = document.getElementById('lead-form');
      const name = document.getElementById('lead-name');
      if (!card || !name) return;
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      name.focus({ preventScroll: true });
      history.replaceState(null, '', '#contato');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className={`on-dark ${styles.bar}`} data-hidden={hidden} inert={hidden}>
      <a
        href="#contato"
        className="btn btn-lg btn-primary"
        aria-label="Falar com a gente: ir para o formulário de contato"
      >
        Falar com a gente
      </a>
    </div>
  );
}
