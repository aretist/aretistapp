import Link from 'next/link'

interface Formation {
  id: string
  title: string
  description: string
  discipline: string
  subdiscipline: string | null
  city: string
  start_date: string
  end_date: string
  price: number
  capacity: number
  spots_left: number
  status: string
  teacher: { full_name: string; username: string; avatar_url: string | null } | null
}

const DISCIPLINE_LABELS: Record<string, string> = {
  dance: 'Danza', theater: 'Teatro', singing: 'Canto',
  circus: 'Circo', opera: 'Ópera', music: 'Música',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: url ? 'transparent' : 'var(--pink)',
      backgroundImage: url ? `url(${url})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      color: 'var(--red)',
      flexShrink: 0,
      fontFamily: 'var(--font)',
    }}>
      {!url && initials}
    </div>
  )
}

export default function FormationCard({ formation }: { formation: Formation }) {
  const isFull = formation.status === 'full' || formation.spots_left === 0
  const startDate = new Date(formation.start_date)
  const endDate = new Date(formation.end_date)
  const isMultiDay = startDate.toDateString() !== endDate.toDateString()
  const dateLabel = isMultiDay
    ? `${formatDate(formation.start_date)} — ${formatDate(formation.end_date)}`
    : formatDate(formation.start_date)

  return (
    <Link href={`/formations/${formation.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'white',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}>
        {/* Header: profesor + precio */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar url={formation.teacher?.avatar_url ?? null} name={formation.teacher?.full_name ?? 'P'} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
              {formation.teacher?.full_name ?? 'Profesor'}
            </span>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font)', lineHeight: 1 }}>
              {formation.price === 0 ? 'Gratis' : `${formation.price}€`}
            </p>
            {isFull ? (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', fontFamily: 'var(--font)' }}>
                COMPLETO
              </span>
            ) : (
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 2 }}>
                {formation.spots_left} plazas
              </p>
            )}
          </div>
        </div>

        {/* Título */}
        <p style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font)',
          lineHeight: 1.3,
          marginBottom: 8,
        }}>
          {formation.title}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 12,
            fontFamily: 'var(--font)',
            color: 'var(--text-secondary)',
          }}>
            📍 {formation.city}
          </span>
          <span style={{
            fontSize: 12,
            fontFamily: 'var(--font)',
            color: 'var(--text-secondary)',
          }}>
            · 📅 {dateLabel}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 11,
            fontWeight: 500,
            background: 'var(--bg-highlight)',
            color: 'var(--red)',
            fontFamily: 'var(--font)',
            border: '0.5px solid var(--border)',
          }}>
            {DISCIPLINE_LABELS[formation.discipline] ?? formation.discipline}
          </span>
          {formation.subdiscipline && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 500,
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font)',
              border: '0.5px solid var(--border)',
            }}>
              {formation.subdiscipline}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
