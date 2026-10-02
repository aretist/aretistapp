import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sanitizeRichText } from '@/lib/sanitize'
import BookingButton from './BookingButton'

export const revalidate = 30

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: formation } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!formation) notFound()

  const { data: teacher } = await supabase
    .from('users')
    .select('id, full_name, username, avatar_url, bio')
    .eq('id', formation.teacher_id)
    .single()

  const { count: bookingsCount } = await supabase
    .from('formation_bookings')
    .select('*', { count: 'exact', head: true })
    .eq('formation_id', id)

  const isOwner = user?.id === formation.teacher_id
  const totalBooked = bookingsCount ?? 0
  const spotsLeft = formation.capacity ? formation.capacity - totalBooked : null
  const occupancyPct = formation.capacity ? Math.min(100, (totalBooked / formation.capacity) * 100) : 0

  const DISCIPLINE_LABELS: Record<string, string> = {
    dance: 'Danza', theater: 'Teatro', singing: 'Canto',
    circus: 'Circo', music: 'Música',
  }

  const LEVEL_LABELS: Record<string, string> = {
    todos: 'Todos los niveles', principiante: 'Principiante',
    intermedio: 'Intermedio', avanzado: 'Avanzado', profesional: 'Profesional',
  }

  const startDate = new Date(formation.start_date)
  const endDate = new Date(formation.end_date)
  const isSameDay = startDate.toDateString() === endDate.toDateString()
  const hasTime = startDate.getHours() !== 0 || startDate.getMinutes() !== 0

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const dateLabel = isSameDay
    ? hasTime
      ? `${formatDateShort(startDate)} · ${formatTime(startDate)} – ${formatTime(endDate)}`
      : formatDateShort(startDate)
    : `${formatDateShort(startDate)} — ${formatDateShort(endDate)}`

  const teacherInitials = teacher?.full_name
    ?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'

  return (
    <>
      <style>{`
        .formation-layout { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
        .formation-sidebar { position: sticky; top: 72px; }
        @media (max-width: 768px) {
          .formation-layout { grid-template-columns: 1fr; }
          .formation-sidebar { position: static; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Link href="/formations" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font)' }}>
            ← Todas las formaciones
          </Link>
          {isOwner && (
            <Link href={`/formations/${id}/edit`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', fontFamily: 'var(--font)', textDecoration: 'none' }}>
              EDITAR
            </Link>
          )}
        </div>

        <div className="formation-layout">
          {/* LEFT — info */}
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {teacher?.full_name} · {formation.title}
            </h1>

            {/* Teacher */}
            {teacher && (
              <Link href={`/u/${teacher.username}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>
                  {teacher.avatar_url
                    ? <img src={teacher.avatar_url} alt={teacher.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : teacherInitials}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{teacher.full_name}</p>
                  {teacher.bio && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>{teacher.bio}</p>}
                </div>
              </Link>
            )}

            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {formation.discipline && (
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-highlight)', color: 'var(--red)', fontFamily: 'var(--font)', fontWeight: 500 }}>
                  {DISCIPLINE_LABELS[formation.discipline] ?? formation.discipline}
                </span>
              )}
              {formation.subdiscipline && (
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
                  {formation.subdiscipline}
                </span>
              )}
              {formation.level && (
                <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
                  {LEVEL_LABELS[formation.level] ?? formation.level}
                </span>
              )}
            </div>

            {/* Info grid */}
            <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Cuándo</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{dateLabel}</p>
              </div>
              {(formation.location || formation.city) && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Dónde</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{formation.location ?? formation.city}</p>
                  {formation.address && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 2 }}>
                      {formation.address} ·{' '}
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(formation.address)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'none' }}>Ver en mapa</a>
                    </p>
                  )}
                </div>
              )}
              {formation.level && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Nivel</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{LEVEL_LABELS[formation.level] ?? formation.level}</p>
                </div>
              )}
              {formation.what_to_bring && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Qué llevar</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{formation.what_to_bring}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {formation.description && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Sobre la clase</h2>
                <div
                  style={{ fontSize: 14, lineHeight: 1.7, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(formation.description) }}
                />
              </div>
            )}

            {/* Cancellation */}
            {formation.cancellation_policy && (
              <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>ⓘ</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)', marginBottom: 2 }}>Cancelaciones</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>{formation.cancellation_policy}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="formation-sidebar">
            <div style={{ background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {/* Price + duration */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font)' }}>
                  {formation.price === 0 ? 'Gratis' : `${formation.price} €`}
                </span>
                {hasTime && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                    clase de {Math.round((endDate.getTime() - startDate.getTime()) / 60000)} min
                  </span>
                )}
              </div>

              {/* Spots */}
              {formation.capacity && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>
                      {spotsLeft !== null && spotsLeft <= 5 && spotsLeft > 0
                        ? `¡Solo quedan ${spotsLeft} plazas!`
                        : spotsLeft === 0 ? 'Sin plazas disponibles' : `Quedan ${spotsLeft} plazas`}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                      {totalBooked} de {formation.capacity} reservadas
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${occupancyPct}%`, background: occupancyPct > 80 ? 'var(--red)' : 'var(--red)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              {/* Date */}
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', marginBottom: 4 }}>
                <strong>{dateLabel}</strong>
              </div>
              {(formation.location || formation.city) && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 16 }}>
                  {formation.location ?? formation.city}{formation.city && formation.location ? `, ${formation.city}` : ''}
                </div>
              )}

              {/* CTA */}
              {isOwner ? (
                <Link href={`/formations/${id}/bookings`} style={{ display: 'block', textAlign: 'center', padding: '13px', background: 'var(--red)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', textDecoration: 'none' }}>
                  Ver inscritos
                </Link>
              ) : spotsLeft === 0 ? (
                <button disabled style={{ width: '100%', padding: '13px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', cursor: 'not-allowed' }}>
                  Sin plazas disponibles
                </button>
              ) : (
                <BookingButton
                  formationId={id}
                  formationTitle={`${teacher?.full_name ?? ''} · ${formation.title}`}
                  price={formation.price}
                  dateLabel={dateLabel}
                  location={formation.location ?? formation.city ?? ''}
                  paymentMethods={formation.payment_methods ?? ['efectivo']}
                  bizumNumber={formation.bizum_number}
                  iban={formation.iban}
                  teacherName={teacher?.full_name ?? ''}
                />
              )}

              {/* Share */}
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={undefined}
                  style={{ width: '100%', padding: '11px', background: 'white', color: 'var(--text-primary)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-full)', fontWeight: 500, fontSize: 14, fontFamily: 'var(--font)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}