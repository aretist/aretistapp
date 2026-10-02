import { createClient } from '@/lib/supabase/server'
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

interface PageProps {
  params: { id: string }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
}

const PAYMENT_LABELS: Record<string, string> = {
  bizum: 'Bizum',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

export default async function BookingsPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formation } = await supabase
    .from('formations')
    .select('id, title, teacher_id, spots_total, spots_left')
    .eq('id', params.id)
    .single()

  if (!formation) {
  console.log('Formation not found')
  redirect('/formations')
}
if (formation.teacher_id !== user.id) {
  console.log('teacher_id:', formation.teacher_id, 'user.id:', user.id)
  redirect('/formations')
}

  const { data: bookings } = await supabase
    .from('formation_bookings')
    .select('*')
    .eq('formation_id', params.id)
    .order('created_at', { ascending: false })

  const total = bookings?.length ?? 0
  const confirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const pending = bookings?.filter(b => b.status === 'pending').length ?? 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/formations/${params.id}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
        >
          ← Volver a la formación
        </Link>
        <h1 className="text-2xl font-bold">{formation.title}</h1>
        <p className="text-muted-foreground mt-1">Gestión de reservas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground mt-1">Total reservas</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{confirmed}</div>
          <div className="text-sm text-muted-foreground mt-1">Confirmadas</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{pending}</div>
          <div className="text-sm text-muted-foreground mt-1">Pendientes</div>
        </div>
      </div>

      {/* Bookings list */}
      {!bookings || bookings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Aún no hay reservas</p>
          <p className="text-sm mt-1">Cuando alguien reserve aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: Booking) => (
            <BookingCard key={booking.id} booking={booking} formationId={params.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, formationId }: { booking: Booking; formationId: string }) {
  const status = STATUS_LABELS[booking.status] ?? STATUS_LABELS.pending
  const date = new Date(booking.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{booking.full_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
            <p>{booking.email}</p>
            {booking.phone && <p>{booking.phone}</p>}
            <p>
              Pago: <span className="font-medium text-foreground">
                {PAYMENT_LABELS[booking.payment_method] ?? booking.payment_method}
              </span>
            </p>
            <p className="text-xs">{date}</p>
          </div>
        </div>

        <BookingActions bookingId={booking.id} currentStatus={booking.status} />
      </div>
    </div>
  )
}