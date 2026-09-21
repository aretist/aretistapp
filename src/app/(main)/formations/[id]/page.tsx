import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { sanitizeRichText } from '@/lib/sanitize'

export const revalidate = 30

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
    .maybeSingle()

  if (!formation) notFound()

  const { data: teacher } = await supabase
    .from('users')
    .select('id, full_name, username, avatar_url')
    .eq('id', formation.teacher_id)
    .single()

  const isOwner = formation.teacher_id === user.id

  const DISCIPLINE_LABELS: Record<string, string> = {
    dance: 'Danza', theater: 'Teatro', singing: 'Canto',
    circus: 'Circo', music: 'Música',
  }

  const startDate = new Date(formation.start_date)
  const endDate = new Date(formation.end_date)
  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const isSameDay = startDate.toDateString() === endDate.toDateString()
  const dateLabel = isSameDay
    ? formatDate(startDate)
    : `${formatDate(startDate)} — ${formatDate(endDate)}`

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/formations" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font)', fontWeight: 500 }}>
          ← Volver a formaciones
        </Link>
        {isOwner && (
          <Link href={`/formations/${id}/edit`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', fontFamily: 'var(--font)', textDecoration: 'none', letterSpacing: '0.02em' }}>
            EDITAR
          </Link>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
          {formation.title}
        </h1>

        {teacher && (
          <div style={{ marginBottom: 16 }}>
            <Link href={`/u/${teacher.username}`} style={{ textDecoration: 'none' }}>
              <p style={{ fontSize: 15, color: 'var(--red)', fontWeight: 500, fontFamily: 'var(--font)' }}>
                {teacher.full_name}
              </p>
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {formation.city && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
              📍 {formation.city}
            </span>
          )}
          {formation.discipline && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-highlight)', color: 'var(--red)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
              {DISCIPLINE_LABELS[formation.discipline] ?? formation.discipline}
            </span>
          )}
          {formation.price !== null && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--success-bg)', color: 'var(--success-text)', fontFamily: 'var(--font)' }}>
              {formation.price === 0 ? 'Gratuito' : `${formation.price} €`}
            </span>
          )}
          {formation.capacity && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
              👥 {formation.capacity} plazas
            </span>
          )}
          <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
            📅 {dateLabel}
          </span>
        </div>

        {formation.description && (
          <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '0.5px solid var(--border)' }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Descripción</p>
            <div
              style={{ fontSize: 14, lineHeight: 1.7, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(formation.description) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
