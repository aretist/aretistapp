import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function FormationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: formation } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .in('status', ['published', 'full'])
    .maybeSingle()

  if (!formation) notFound()

  // Traer profesor por separado
  const { data: teacher } = await supabase
    .from('users')
    .select('id, full_name, username, avatar_url, bio')
    .eq('id', formation.teacher_id)
    .single()

  // Ver si el usuario ya tiene reserva
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('formation_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isFull = formation.status === 'full' || formation.spots_left === 0
  const isOwnFormation = user.id === formation.teacher_id
  const startDate = new Date(formation.start_date)
  const endDate = new Date(formation.end_date)

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link href="/formations" style={{ fontSize: 13, color: '#534AB7', textDecoration: 'none' }}>
        ← Volver a formaciones
      </Link>

      <div style={{ marginTop: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{formation.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Link href={`/u/${teacher?.username}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: teacher?.avatar_url ? `url(${teacher.avatar_url})` : '#EEEDFE',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 14, color: '#534AB7', fontWeight: 500 }}>
                {teacher?.full_name}
              </span>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
            📍 {formation.city}
          </span>
          <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#EEEDFE', color: '#3C3489' }}>
            📅 {format(startDate, "d 'de' MMMM", { locale: es })} — {format(endDate, "d 'de' MMMM yyyy", { locale: es })}
          </span>
          <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#E1F5EE', color: '#085041' }}>
            {formation.discipline}
          </span>
          {formation.subdiscipline && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
              {formation.subdiscipline}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 600, color: '#534AB7' }}>
              {formation.price === 0 ? 'Gratis' : `${formation.price}€`}
            </p>
            <p style={{ fontSize: 12, color: '#666' }}>precio</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 600 }}>{formation.capacity}</p>
            <p style={{ fontSize: 12, color: '#666' }}>plazas totales</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 600, color: isFull ? '#c00' : '#1D9E75' }}>
              {isFull ? '0' : formation.spots_left}
            </p>
            <p style={{ fontSize: 12, color: '#666' }}>disponibles</p>
          </div>
        </div>

        <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Descripción</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{formation.description}</p>
        </div>

        {isOwnFormation ? (
          <p style={{ fontSize: 13, color: '#999' }}>Esta es tu propia formación</p>
        ) : booking?.payment_status === 'paid' ? (
          <div style={{ padding: 16, background: '#EAF3DE', borderRadius: 8 }}>
            <p style={{ fontSize: 14, color: '#27500A', fontWeight: 500 }}>✓ Ya tienes plaza reservada</p>
            <p style={{ fontSize: 13, color: '#3B6D11', marginTop: 4 }}>
              El profesor recibirá tus datos de contacto.
            </p>
          </div>
        ) : isFull ? (
          <div style={{ padding: 16, background: '#FAECE7', borderRadius: 8 }}>
            <p style={{ fontSize: 14, color: '#712B13', fontWeight: 500 }}>Formación completa</p>
            <p style={{ fontSize: 13, color: '#993C1D', marginTop: 4 }}>No quedan plazas disponibles.</p>
          </div>
        ) : (
          <div style={{ padding: 16, background: '#fafafa', borderRadius: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Reservar plaza</p>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              El sistema de pago online estará disponible próximamente.
              Para reservar tu plaza, contacta directamente con el profesor.
            </p>
            <Link
              href={`/u/${teacher?.username}`}
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#534AB7',
                color: 'white',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Ver perfil del profesor
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
