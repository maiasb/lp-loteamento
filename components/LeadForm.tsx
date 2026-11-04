'use client';

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react';
import { LEADS_ENDPOINT, email, emailHref, whatsappHref } from '@/lib/contact';
import { buildPayload, createSubmissionIds, sendLead, type SubmitResult } from '@/lib/leads/client';
import {
  FIELDS,
  HONEYPOT_FIELD,
  LOT_RANGES,
  PROFILES,
  readForm,
  validateLead,
  type LeadErrors,
  type LeadField,
} from '@/lib/leads/validate';
import { Icon } from './Icon';
import styles from './LeadForm.module.css';

const FIRST_INPUT_ID: Record<LeadField, string> = {
  name: 'lead-name',
  whatsapp: 'lead-whatsapp',
  email: 'lead-email',
  company: 'lead-company',
  profile: `lead-profile-${PROFILES[0].value}`,
  lotsRange: 'lead-lotsRange',
  consent: 'lead-consent',
};

const contactTail = email ? ` ou pelo e-mail ${email}` : '';

function alertText(status: FormState['status']): string {
  switch (status) {
    case 'busy':
      return 'O envio está movimentado neste momento. Seus dados continuam aqui no formulário. Tente de novo em instantes ou fale com a gente pelo WhatsApp.';
    case 'network':
      return `Não conseguimos enviar: a conexão falhou. Seus dados continuam aqui no formulário. Confira sua internet e tente de novo, ou fale com a gente pelo WhatsApp${contactTail}.`;
    case 'timeout':
      return `Não recebemos a confirmação do envio, então não sabemos se o contato chegou. Antes de enviar de novo, fale com a gente pelo WhatsApp${contactTail} para conferir. Seus dados continuam aqui no formulário.`;
    default:
      return `Não conseguimos enviar seu contato agora. Seus dados continuam aqui no formulário. Tente de novo em alguns minutos ou fale com a gente pelo WhatsApp${contactTail}.`;
  }
}

const nameOf = (t: EventTarget) => ('name' in t && typeof t.name === 'string' ? t.name : '');

function FieldMessage({
  id,
  error,
  hint,
  tall,
}: {
  id: string;
  error?: string;
  hint?: string;
  tall?: boolean;
}) {
  return (
    <p
      id={id}
      className={styles.msg}
      data-tall={tall ? 'true' : undefined}
      data-error={error ? 'true' : undefined}
    >
      {error ? (
        <>
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </>
      ) : (
        hint
      )}
    </p>
  );
}

function Field({
  field,
  label,
  error,
  hint,
  tall,
  children,
}: {
  field: LeadField;
  label: string;
  error?: string;
  hint?: string;
  tall?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={FIRST_INPUT_ID[field]} className={styles.label}>
        {label}
      </label>
      {children}
      <FieldMessage id={`lead-${field}-msg`} error={error} hint={hint} tall={tall} />
    </div>
  );
}

const noopSubscribe = () => () => {};

function focusFirstError(errs: LeadErrors) {
  const first = FIELDS.find((f) => errs[f]);
  if (first) document.getElementById(FIRST_INPUT_ID[first])?.focus();
}

type FormState =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'success'; firstName: string | null }
  | { status: 'invalid'; errors: LeadErrors }
  | { status: 'busy' | 'server' | 'network' | 'timeout' };

export function LeadForm() {
  const [state, setState] = useState<FormState>({ status: 'idle' });
  const [clientErrors, setClientErrors] = useState<LeadErrors | null>(null);
  const [attempted, setAttempted] = useState(false);
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  ); // antes da hidratação um envio nativo vazaria os dados na URL
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const locked = useRef(false); // trava síncrona: cliques seguidos no mesmo instante (CA-23)
  const ids = useRef(createSubmissionIds()); // mesmo submissionId nas retentativas do mesmo envio

  const pending = state.status === 'sending';
  const serverErrors: LeadErrors = state.status === 'invalid' ? state.errors : {};
  const errors: LeadErrors = { ...serverErrors, ...clientErrors };
  const errorCount = FIELDS.filter((f) => errors[f]).length;

  useEffect(() => {
    if (state.status === 'invalid') focusFirstError(state.errors);
    else if (state.status === 'success') successRef.current?.focus();
    else if (state.status !== 'idle' && state.status !== 'sending') {
      const slot = alertRef.current;
      if (slot) {
        // O aviso pode passar do espaço reservado: guarda a maior altura vista, para a página não
        // encolher (salto de layout) quando o aviso some no reenvio ou no sucesso.
        const min = Math.max(parseFloat(slot.style.minHeight || '0'), slot.offsetHeight);
        slot.style.minHeight = `${min}px`;
        slot.focus();
      }
    }
  }, [state]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked.current) return; // CA-23: clique duplo não envia duas vezes
    setAttempted(true);
    const formData = new FormData(e.currentTarget);
    const result = validateLead(readForm(formData));
    if (!result.ok) {
      setClientErrors(result.errors);
      focusFirstError(result.errors);
      return;
    }
    locked.current = true;
    setClientErrors(null);
    setState({ status: 'sending' });
    const honeypot = formData.get(HONEYPOT_FIELD);
    let outcome: SubmitResult = { status: 'server' }; // sem endereço configurado (só em dev): estado de erro
    if (LEADS_ENDPOINT) {
      const payload = buildPayload(result.data, {
        submissionId: ids.current.idFor(result.data),
        honeypot: typeof honeypot === 'string' ? honeypot : '',
      });
      outcome = await sendLead(LEADS_ENDPOINT, payload);
    }
    locked.current = false;
    if (outcome.status === 'success') {
      ids.current.reset();
      setState({ status: 'success', firstName: result.data.name.split(/\s+/)[0] ?? null });
    } else {
      setState(outcome);
    }
  }

  function revalidate(field: string) {
    if (!formRef.current || !FIELDS.includes(field as LeadField)) return;
    const result = validateLead(readForm(new FormData(formRef.current)));
    const f = field as LeadField;
    setClientErrors((prev) => ({ ...prev, [f]: result.ok ? undefined : result.errors[f] }));
  }

  const describe = (f: LeadField) => `lead-${f}-msg`;
  const inputProps = (f: LeadField) => ({
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': describe(f),
    'data-invalid': errors[f] ? 'true' : undefined,
  });

  const showAlert = ['busy', 'server', 'network', 'timeout'].includes(state.status);

  return (
    <div id="lead-form" className={styles.card} data-state={state.status} data-lead-card>
      {/* Sem JavaScript o formulário não grava (CA-24, PEND-16 = A, default): esconde-o e mostra o contato direto. */}
      <noscript>
        <style>{'[data-lead-card]>form{visibility:hidden}'}</style>
        <div className={styles.nojs}>
          <p>Para enviar pelo formulário, ative o JavaScript, ou fale conosco:</p>
          <div className={styles.successActions}>
            <a href={whatsappHref} className="btn btn-md btn-outline">
              Chamar no WhatsApp
            </a>
            {email && (
              <a href={emailHref} className="link">
                {email}
              </a>
            )}
          </div>
        </div>
      </noscript>
      <div
        className={styles.success}
        aria-hidden={state.status !== 'success'}
        inert={state.status !== 'success'}
      >
        <span className={styles.check}>
          <Icon name="check" size={32} />
        </span>
        <h3 ref={successRef} tabIndex={-1}>
          Contato recebido
        </h3>
        <p>
          {state.status === 'success' && state.firstName
            ? `Obrigado, ${state.firstName}.`
            : 'Obrigado.'}{' '}
          Recebemos seus dados e entraremos em contato por WhatsApp ou e-mail.
        </p>
        <p>Se preferir, já pode falar com a gente agora:</p>
        <div className={styles.successActions}>
          <a href={whatsappHref} className="btn btn-md btn-outline">
            Chamar no WhatsApp
          </a>
          {email && (
            <a href={emailHref} className="link">
              {email}
            </a>
          )}
        </div>
        <p role="status" className="sr-only">
          {state.status === 'success' ? 'Contato recebido. Obrigado.' : ''}
        </p>
      </div>

      <form
        ref={formRef}
        className={styles.form}
        inert={!ready || state.status === 'success'}
        noValidate
        onSubmit={onSubmit}
        onBlur={(e) => attempted && revalidate(nameOf(e.target))}
        onChange={(e) => {
          const name = nameOf(e.target);
          if (errors[name as LeadField]) revalidate(name);
        }}
        aria-label="Formulário de contato"
      >
        <div className={styles.pair}>
          <Field field="name" label="Nome" error={errors.name}>
            <input
              id="lead-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome completo"
              required
              maxLength={400}
              className={styles.input}
              {...inputProps('name')}
            />
          </Field>
          <Field
            field="company"
            label="Empresa"
            error={errors.company}
            hint="Opcional para gestor comercial."
          >
            <input
              id="lead-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Nome da sua empresa"
              maxLength={400}
              className={styles.input}
              {...inputProps('company')}
            />
          </Field>
        </div>
        <div className={styles.pair}>
          <Field field="whatsapp" label="WhatsApp" error={errors.whatsapp} hint="Com DDD." tall>
            <input
              id="lead-whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(11) 91234-5678"
              required
              maxLength={30}
              className={styles.input}
              {...inputProps('whatsapp')}
            />
          </Field>
          <Field field="email" label="E-mail" error={errors.email} tall>
            <input
              id="lead-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com.br"
              required
              maxLength={254}
              className={styles.input}
              {...inputProps('email')}
            />
          </Field>
        </div>

        <fieldset
          className={styles.fieldset}
          aria-describedby={describe('profile')}
          aria-invalid={errors.profile ? true : undefined}
        >
          <legend className={styles.label}>Seu perfil</legend>
          <div className={styles.radios}>
            {PROFILES.map((p) => (
              <label key={p.value} className={styles.radio}>
                <input
                  id={`lead-profile-${p.value}`}
                  type="radio"
                  name="profile"
                  value={p.value}
                  required
                />
                <span>
                  <Icon name="check" size={16} />
                  {p.label}
                </span>
              </label>
            ))}
          </div>
          <FieldMessage id={describe('profile')} error={errors.profile} />
        </fieldset>

        <Field
          field="lotsRange"
          label="Nº aproximado de lotes"
          error={errors.lotsRange}
          hint="Uma estimativa já ajuda."
        >
          <select
            id="lead-lotsRange"
            name="lotsRange"
            required
            defaultValue=""
            className={styles.input}
            {...inputProps('lotsRange')}
          >
            <option value="" disabled>
              Selecione
            </option>
            {LOT_RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>

        <div className={styles.field}>
          <label className={styles.consent}>
            <input
              id="lead-consent"
              type="checkbox"
              name="consent"
              required
              {...inputProps('consent')}
            />
            <span>
              Li e concordo com a{' '}
              <Link href="/politica-de-privacidade" prefetch={false}>
                Política de Privacidade
              </Link>{' '}
              e autorizo o uso dos meus dados para que entrem em contato comigo sobre o Loteamento
              Inteligente.
            </span>
          </label>
          <FieldMessage id={describe('consent')} error={errors.consent} tall />
        </div>

        <div className={styles.extra} aria-hidden="true">
          <label>
            Não preencha este campo
            <input
              type="text"
              name={HONEYPOT_FIELD}
              tabIndex={-1}
              autoComplete="new-password"
              defaultValue=""
            />
          </label>
        </div>

        <button
          type="submit"
          className={`btn btn-lg btn-primary ${styles.submit}`}
          aria-disabled={pending}
          aria-busy={pending}
        >
          {pending ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Enviando…
            </>
          ) : (
            'Enviar contato'
          )}
        </button>
        <p className={styles.note}>
          Usamos seus dados só para responder ao seu contato. Veja prazos e como pedir exclusão na{' '}
          <Link href="/politica-de-privacidade" prefetch={false}>
            Política de Privacidade
          </Link>
          .
        </p>

        <div
          className={styles.alertSlot}
          role="alert"
          ref={alertRef}
          tabIndex={-1}
          data-visible={showAlert || errorCount > 0 ? 'true' : undefined}
        >
          {errorCount > 0 && (
            <p className={styles.alertBox}>
              <Icon name="alert" size={18} />
              Revise {errorCount} {errorCount === 1 ? 'campo' : 'campos'} antes de enviar.
            </p>
          )}
          {showAlert && (
            <div className={styles.alertBox}>
              <p>{alertText(state.status)}</p>
              <div className={styles.alertActions}>
                <button type="submit" className="btn btn-md btn-primary">
                  Tentar de novo
                </button>
                <a href={whatsappHref} className="btn btn-md btn-outline">
                  Chamar no WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
