'use client'

import { useState } from 'react'

interface Props {
  formationId: string
  formationTitle: string
  price: number
  dateLabel: string
  location: string
  paymentMethods: string[]
  bizumNumber?: string | null
  iban?: string | null
  teacherName: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font)',
  fontSize: 15,
  color: 'var(--text-primary)',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
}

const PAYMENT_LABELS: Record<string, { label: string; description: string }> = {
  bizum:       { label: 'Bizum',              description: 'Te damos el número al confirmar' },
  transferencia: { label: 'Transferencia',    description: 'Te damos el IBAN al confirmar' },
  efectivo:    { label: 'Efectivo en la clase', description: 'Pagas al llegar' },
}

export default function BookingButton({
  formationId, formationTitle, price, dateLabel, location,
  paymentMethods, bizumNumber, iban, teacherName,
}: Props) {
  const [step, setStep] = useState<'idle' | 'form' | 'success'>('idle')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] ?? 'efectivo')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!fullName.trim() || !email.trim()) {
      setError('Nombre y email son obligatorios')
      return
    }
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/formations/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formationId, fullName, email, phone, paymentMethod }),
    })

    if (!res.ok) {
      setError('Ha ocurrido un error. Inténtalo de nuevo.')
      setSubmitting(false)
      return
    }

    setStep('success')
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('form')}
        style={{ width: '100%', padding: '13px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', cursor: 'pointer' }}
      >
        Reservar plaza
      </button>
    )
  }

  if (step === 'success') {
    const showBizum = paymentMethod === 'bizum' && bizumNumber
    const showIban = paymentMethod === 'transferencia' && iban

    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 6 }}>¡Plaza reservada!</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 16 }}>
          Te hemos enviado la confirmación por email.
        </p>

        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14, textAlign: 'left', marginBottom: 16, fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>{formationTitle}</p>
          <p style={{ color: 'var(--text-secondary)' }}>{dateLabel} · {location}</p>
        </div>

        {(showBizum || showIban) && (
          <div style={{ background: 'var(--bg-highlight)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14, textAlign: 'left', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Último paso: el pago
            </p>
            {showBizum && (
              <>
                <p style={{ fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 8 }}>
                  Haz un Bizum de <strong>{price} €</strong> a {teacherName}:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', letterSpacing: 1 }}>{bizumNumber}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(bizumNumber!)}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
                  >
                    Copiar
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 8 }}>
                  Concepto: <strong>{formationTitle.split('·')[1]?.trim() ?? formationTitle} + tu nombre</strong>
                </p>
              </>
            )}
            {showIban && (
              <>
                <p style={{ fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 8 }}>
                  Haz una transferencia de <strong>{price} €</strong> a:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font)', letterSpacing: 1 }}>{iban}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(iban!)}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
                  >
                    Copiar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // step === 'form'
  return (
    <div>
      {/* Resumen */}
      <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{formationTitle}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 2 }}>{dateLabel} · {location}</p>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font)' }}>{price === 0 ? 'Gratis' : `${price} €`}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Nombre y apellido</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Cómo te llamas" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Te enviamos la confirmación" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Teléfono</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={`Por si ${teacherName.split(' ')[0]} necesita avisarte`} style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>¿Cómo vas a pagar?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {paymentMethods.map((method) => {
              const info = PAYMENT_LABELS[method]
              const isSelected = paymentMethod === method
              return (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: isSelected ? '1.5px solid var(--red)' : '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: isSelected ? 'var(--bg-highlight)' : 'white', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: isSelected ? '5px solid var(--red)' : '1.5px solid var(--border)', flexShrink: 0, background: 'white' }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{info?.label ?? method}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>{info?.description ?? ''}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font)' }}>{error}</p>
        )}

        <button
          onClick={handleConfirm}
          disabled={submitting}
          style={{ padding: '13px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Confirmando...' : 'Confirmar reserva'}
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font)', textAlign: 'center' }}>
          Al reservar aceptas los <a href="/terms" style={{ color: 'var(--red)' }}>términos</a>. Guardamos tus datos para esta reserva.
        </p>
      </div>
    </div>
  )
}