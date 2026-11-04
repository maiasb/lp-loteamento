import { FAQ } from '@/lib/content';
import { Icon } from './Icon';
import styles from './Faq.module.css';

/** Acordeão nativo (<details>): abre por clique e teclado, funciona sem JS e as respostas ficam no HTML. */
export function Faq() {
  return (
    <div className={styles.list}>
      {FAQ.items.map((item) => (
        <details key={item.q} className={styles.item}>
          <summary className={styles.summary}>
            <h3>{item.q}</h3>
            <span className={styles.chevron}>
              <Icon name="chevron" size={20} />
            </span>
          </summary>
          <div className={styles.answer}>
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
