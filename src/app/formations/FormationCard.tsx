import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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

export default function FormationCard({ formation }: { formation: Formation }) {
  const startDate = new Date(formation.start_date)
  const endDate = new Date(formation.end_date)
  const isFull = formation.status === 'full' || formation.spots_left === 0
  const isMultiDay = startDate.toDateString() !== endDate.toDateString()

  return (
    <Link href={`/formations/${formation.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{formation.title}</p>
            <p style={{ fontSize: 13, color: '#666' }}>
              con {formation.teacher?.full_name ?? 'Profesor'}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 16, color: '#534AB7' }}>
              {formation.price === 0 ? 'Gratis' : `${formation.price}€`}
            </p>
            {isFull ? (
              <span style={{ fontSize: 11, background: '#FAECE7', color: '#712B13', padding: '2px 8px', borderRadius: 10 }}>
                Completo
              </span>
            ) : (
              <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                {formation.spots_left} plazas
              </p>
            )}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#444', marginTop: 8, lineHeight: 1.5 }}>
          {formation.description.length > 100
            ? formation.description.slice(0, 100) + '...'
            : formation.description}
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
            📍 {formation.city}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#EEEDFE', color: '#3C3489' }}>
            📅 {format(startDate, isMultiDay ? 'd MMM' : 'd MMM', { locale: es })}
            {isMultiDay && ` — ${format(endDate, 'd MMM', { locale: es })}`}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#E1F5EE', color: '#085041' }}>
            {formation.discipline}
          </span>
          {formation.subdiscipline && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
              {formation.subdiscipline}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
