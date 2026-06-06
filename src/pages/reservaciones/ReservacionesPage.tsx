/**
 * =============================================================================
 * ReservacionesPage.tsx — Reservación / Cotización y Contacto (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Asistente premium de 3 pasos para solicitar una reservación o cotización de
 *   eventos a medida, más canales de contacto directo. Toda la lógica vive en
 *   `useReservation`; la vista solo renderiza y enlaza acciones.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useReservation   → estado del asistente y envío.
 *   - ../../components/layout/*        → TopBar, BottomNav.
 *   - ../../components/common/*        → Button, Input.
 *   - ../../types                      → ReservationInterest, ContactChannel.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - El hook controla `step`, `data`, `errors`, `status`. La vista decide qué
 *     paso pintar y muestra la confirmación al completar (`status === success`).
 *   - Los canales de contacto son datos de presentación (no requieren red).
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/reservaciones/ReservacionesPage.tsx
 *   2. Ruta: <Route path="/reservaciones" element={<ReservacionesPage />} />
 * =============================================================================
 */

import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useReservation } from '../../hooks/api/useReservation'
import type { ReservationInterest, ContactChannel } from '../../types'

interface InterestOption {
  value: ReservationInterest
  icon: string
  desc: string
}
const INTERESTS: InterestOption[] = [
  { value: 'Congreso', icon: 'local_activity', desc: 'Inscripción a un congreso del catálogo' },
  { value: 'Capacitación a medida', icon: 'workspace_premium', desc: 'Programa diseñado para tu institución' },
  { value: 'Curso o taller', icon: 'school', desc: 'Formación presencial o en línea' },
  { value: 'Evento corporativo', icon: 'corporate_fare', desc: 'Producción integral de tu evento' },
]

const CONTACT_CHANNELS: ContactChannel[] = [
  { id: 'wa', icon: 'chat', label: 'WhatsApp', value: 'Respuesta inmediata', href: 'https://wa.me/520000000000' },
  { id: 'mail', icon: 'mail', label: 'Correo', value: 'atencion@eventosgrupofenix.com', href: 'mailto:atencion@eventosgrupofenix.com' },
  { id: 'web', icon: 'language', label: 'Sitio web', value: 'eventosgrupofenix.com', href: 'https://www.eventosgrupofenix.com/' },
]

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              n < step
                ? 'bg-secondary text-on-secondary'
                : n === step
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-variant text-outline'
            }`}
          >
            {n < step ? <span className="material-symbols-outlined text-[18px]">check</span> : n}
          </div>
          {n < 3 && (
            <div className={`h-1 flex-1 rounded-full transition-colors ${n < step ? 'bg-secondary' : 'bg-surface-variant'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ReservacionesPage() {
  const { step, data, errors, status, serverError, setInterest, setField, next, back, submit, reset } = useReservation()

  // ----- Confirmación -----
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6 animate-fade-in-up">
          <span className="material-symbols-outlined text-secondary text-[56px] filled">task_alt</span>
        </div>
        <h1 className="text-[22px] font-bold text-primary">¡Solicitud enviada!</h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
          Gracias, <strong className="text-primary">{data.full_name.split(' ')[0]}</strong>. Nuestro equipo te
          contactará en menos de 24 horas para afinar los detalles de tu <strong className="text-primary">{data.interest.toLowerCase()}</strong>.
        </p>
        <Button variant="primary" className="mt-8" onClick={reset}>
          Hacer otra solicitud
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar title="Reservaciones" showBack />

      <main className="px-5 pt-6 pb-10 max-w-2xl mx-auto flex flex-col gap-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-[26px] font-bold text-primary leading-tight tracking-tight">Cotiza tu evento</h1>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
            Cuéntanos qué necesitas y diseñamos una propuesta a tu medida.
          </p>
        </div>

        <Stepper step={step} />

        {/* Paso 1: Interés */}
        {step === 1 && (
          <section className="flex flex-col gap-3 animate-fade-in-up">
            <h2 className="text-[15px] font-bold text-primary">¿Qué te interesa?</h2>
            {INTERESTS.map((opt) => {
              const active = data.interest === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setInterest(opt.value)}
                  className={`flex items-center gap-4 p-4 rounded-3xl border text-left transition-all active:scale-[0.98] ${
                    active
                      ? 'border-secondary bg-surface shadow-card ring-2 ring-secondary/20'
                      : 'border-surface-variant/70 bg-surface hover:border-secondary'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-secondary text-on-secondary' : 'bg-surface-container-low text-primary'}`}>
                    <span className="material-symbols-outlined">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">{opt.value}</p>
                    <p className="text-xs text-on-surface-variant">{opt.desc}</p>
                  </div>
                  <span className={`material-symbols-outlined transition-colors ${active ? 'text-secondary' : 'text-outline-variant'}`}>
                    {active ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                </button>
              )
            })}
            <Button variant="primary" fullWidth rightIcon="arrow_forward" className="mt-2" onClick={next}>
              Continuar
            </Button>
          </section>
        )}

        {/* Paso 2: Datos de contacto */}
        {step === 2 && (
          <section className="flex flex-col gap-4 animate-fade-in-up">
            <h2 className="text-[15px] font-bold text-primary">Tus datos de contacto</h2>
            <Input label="Nombre completo" icon="person" value={data.full_name} onChange={(e) => setField('full_name', e.target.value)} error={errors.full_name} />
            <Input label="Correo electrónico" icon="mail" type="email" value={data.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} />
            <Input label="Teléfono / WhatsApp" icon="call" type="tel" value={data.phone} onChange={(e) => setField('phone', e.target.value)} error={errors.phone} />
            <Input label="Organización (opcional)" icon="business" value={data.organization ?? ''} onChange={(e) => setField('organization', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="N.º de asistentes" icon="groups" type="number" min={1} value={String(data.attendees)} onChange={(e) => setField('attendees', Number(e.target.value) || 1)} error={errors.attendees} />
              <Input label="Fecha tentativa" icon="event" type="date" value={data.preferred_date ?? ''} onChange={(e) => setField('preferred_date', e.target.value)} />
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="secondary" leftIcon="arrow_back" onClick={back}>Atrás</Button>
              <Button variant="primary" fullWidth rightIcon="arrow_forward" onClick={next}>Continuar</Button>
            </div>
          </section>
        )}

        {/* Paso 3: Mensaje + envío */}
        {step === 3 && (
          <section className="flex flex-col gap-4 animate-fade-in-up">
            <h2 className="text-[15px] font-bold text-primary">Detalles de tu solicitud</h2>

            {/* Resumen */}
            <div className="bg-surface rounded-3xl border border-surface-variant/70 shadow-card p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant">Interés</span><span className="font-semibold text-primary">{data.interest}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Asistentes</span><span className="font-semibold text-primary">{data.attendees}</span></div>
              {data.preferred_date && <div className="flex justify-between"><span className="text-on-surface-variant">Fecha</span><span className="font-semibold text-primary">{data.preferred_date}</span></div>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="msg" className="text-[13px] font-semibold text-primary ml-1">Mensaje</label>
              <textarea
                id="msg"
                rows={4}
                placeholder="Cuéntanos sobre tu evento, objetivos, sede deseada…"
                value={data.message}
                onChange={(e) => setField('message', e.target.value)}
                className={`w-full bg-surface-soft rounded-2xl p-4 text-sm text-primary placeholder:text-outline outline-none transition-all resize-none
                  ${errors.message ? 'border border-error focus:ring-4 focus:ring-error/10' : 'border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10'}`}
              />
              {errors.message && (
                <p className="text-xs text-error ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>{errors.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>{serverError}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <Button variant="secondary" leftIcon="arrow_back" onClick={back} disabled={status === 'sending'}>Atrás</Button>
              <Button variant="primary" fullWidth leftIcon={status === 'sending' ? undefined : 'send'} isLoading={status === 'sending'} onClick={submit}>
                Enviar solicitud
              </Button>
            </div>
          </section>
        )}

        {/* Contacto directo */}
        <section className="mt-2">
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-surface-variant" />
            <span className="text-xs text-outline font-medium">o contáctanos directamente</span>
            <div className="flex-1 h-px bg-surface-variant" />
          </div>
          <div className="flex flex-col gap-2">
            {CONTACT_CHANNELS.map((ch) => (
              <a
                key={ch.id}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-surface rounded-2xl border border-surface-variant/70 shadow-card px-4 py-3 hover:shadow-elevated transition-all active:scale-[0.98] group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{ch.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">{ch.label}</p>
                  <p className="text-xs text-on-surface-variant truncate">{ch.value}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">open_in_new</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
