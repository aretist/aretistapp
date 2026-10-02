import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import BookingActions from './BookingActions'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BookingsPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const serviceSupabase = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formation } = await serviceSupabase
    .from('formations')
    .select('id, title, teacher_id, spots_left, price')
    .eq('id', id)
    .single()

  if (!formation) redirect('/formations')
  if (formation.teacher_id !== user.id) redirect('/formations')

  const { data: bookings } = await serviceSupabase
    .from('formation_bookings')
    .select('*')
    .eq('formation_id', id)
    .order('created_at', { ascending: false })

  const allBookings = bookings || []
  const total = allBookings.length
  const confirmed = allBookings.filter(b => b.status === 'confirmed').length
  const pending = allBookings.filter(b => b.status === 'pending').length
  const spotsTotal = formation.spots_left !== null ? formation.spots_left + total : null
  const progressPct = spotsTotal ? Math.round((total / spotsTotal) * 100) : 0

  const paymentLabel: Record<string, string> = {
    bizum: 'Bizum',
    transferencia: 'Transferencia',
    efectivo: 'Efectivo en clase',
    card: 'Tarjeta',
  }

  const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
    confirmed: { label: 'Pagado', bg: '#dcfce7', color: '#166534' },
    pending: { label: 'Pendiente', bg: '#fef9c3', color: '#854d0e' },
    cancelled: { label: 'Cancelado', bg: '#fee2e2', color: '#991b1b' },
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <a href={`/formations/${id}`} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          ← Volver a la formación
        </a>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{formation.title}</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Panel de inscritos</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>

        {/* Reservas */}
        <div style={{ flex: '1 1 180px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Reservas</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
            {total}
            {spotsTotal !== null && <span style={{ fontSize: 16, fontWeight: 400, color: '#9ca3af' }}>/{spotsTotal}</span>}
          </div>
          {spotsTotal !== null && (
            <div style={{ marginTop: 12, background: '#f3f4f6', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: '#ef4444', borderRadius: 99 }} />
            </div>
          )}
        </div>

        {/* Han pagado */}
        <div style={{ flex: '1 1 180px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Han pagado</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#16a34a', lineHeight: 1 }}>{confirmed}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>marcado por ti</div>
        </div>

        {/* Pendientes */}
        <div style={{ flex: '1 1 180px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pendientes de pago</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#d97706', lineHeight: 1 }}>{pending}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>incluye efectivo en clase</div>
        </div>

      </div>

      {/* Tabla desktop / Cards móvil */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

        {/* Section header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Inscritos</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 13, background: '#111827', color: '#fff', borderRadius: 99, padding: '4px 12px', fontWeight: 500 }}>
              Todos · {total}
            </span>
            <span style={{ fontSize: 13, background: '#f3f4f6', color: '#6b7280', borderRadius: 99, padding: '4px 12px', fontWeight: 500 }}>
              Pendientes · {pending}
            </span>
          </div>
        </div>

        {allBookings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            Aún no hay inscritos en esta formación.
          </div>
        ) : (
          <>
            {/* Tabla — visible en pantallas anchas */}
            <div className="bookings-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Nombre', 'Email', 'Teléfono', 'Reservó', 'Pago elegido', 'Estado', ''].map((col) => (
                      <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((booking, i) => {
                    const status = statusConfig[booking.status] || statusConfig['pending']
                    return (
                      <tr key={booking.id} style={{ borderBottom: i < allBookings.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap' }}>
                          {booking.full_name}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>
                          {booking.email}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                          {booking.phone || <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {formatDate(booking.created_at)}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                          {paymentLabel[booking.payment_method] || booking.payment_method}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, background: status.bg, color: status.color, borderRadius: 99, padding: '4px 10px', whiteSpace: 'nowrap' }}>
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className="bookings-cards-wrap">
              {allBookings.map((booking, i) => {
                const status = statusConfig[booking.status] || statusConfig['pending']
                return (
                  <div key={booking.id} style={{ padding: '16px 20px', borderBottom: i < allBookings.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{booking.full_name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, background: status.bg, color: status.color, borderRadius: 99, padding: '3px 10px' }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#374151', marginBottom: 2 }}>{booking.email}</div>
                    {booking.phone && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{booking.phone}</div>}
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
                      <span>{paymentLabel[booking.payment_method] || booking.payment_method}</span>
                      <span>{formatDate(booking.created_at)}</span>
                    </div>
                    <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        .bookings-table-wrap { display: block; }
        .bookings-cards-wrap { display: none; }
        @media (max-width: 640px) {
          .bookings-table-wrap { display: none; }
          .bookings-cards-wrap { display: block; }
        }
      `}</style>
    </div>
  )
}
