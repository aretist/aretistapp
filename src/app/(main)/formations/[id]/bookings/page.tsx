import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BookingActions from './BookingActions'

interface Booking {
  id: string
  full_name: string
  email: string
  phone: string | null
  payment_method: string
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF9C3', color: '#854D0E' },
  confirmed: { label: 'Confirmada', bg: '#DCFCE7', color: '#166534' },
  cancelled: { label: 'Cancelada', bg: '#FEE2E2', color: '#991B1B' },
}

const PAYMENT_LABELS: Record<string, string> = {
  bizum: 'Bizum',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

export default async function BookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formation, error: formationError } = await serviceSupabase
    .from('formations')
    .select('id, title, teacher_id, spots_left')
    .eq('id', id)
    .single()

  if (!formation) redirect('/formations')
  if (formation.teacher_id !== user.id) redirect('/formations')

  const { data: bookings } = await serviceSupabase
    .from('formation_bookings')
    .select('*')
    .eq('formation_id', id)
    .order('created_at', { ascending: false })

  const total = bookings?.length ?? 0
  const confirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const pending = bookings?.filter(b => b.status === 'pending').length ?? 0

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px 80px', fontFamily: 'var(--font)' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href={`/formations/${id}`} style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
          ← Volver a la formación
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '12px 0 4px' }}>
          {formation.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Gestión de reservas</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total reservas', value: total, color: 'var(--text-primary)' },
          { label: 'Confirmadas', value: confirmed, color: '#16A34A' },
          { label: 'Pendientes', value: pending, color: '#D97706' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      {!bookings || bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 16, marginBottom: 4 }}>Aún no hay reservas</p>
          <p style={{ fontSize: 13 }}>Cuando alguien reserve aparecerá aquí</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookings.map((booking: Booking) => {
            const s = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending
            const date = new Date(booking.created_at).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })
            return (
              <div key={booking.id} style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{booking.full_name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{booking.email}</span>
                      {booking.phone && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{booking.phone}</span>}
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        Pago: <strong style={{ color: 'var(--text-primary)' }}>{PAYMENT_LABELS[booking.payment_method] ?? booking.payment_method}</strong>
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{date}</span>
                    </div>
                  </div>
                  <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}