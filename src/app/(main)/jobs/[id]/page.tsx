import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import JobActions from './JobActions'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Query sin joins para evitar problema de RLS
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (!job) notFound()

  // Traer employer por separado
  const { data: employer } = await supabase
    .from('users')
    .select('id, full_name, username, avatar_url')
    .eq('id', job.employer_id)
    .single()

  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('company_name, logo_url, verified, website')
    .eq('user_id', job.employer_id)
    .maybeSingle()

  const { data: application } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', id)
    .eq('applicant_id', user.id)
    .maybeSingle()

  const companyName = employerProfile?.company_name ?? employer?.full_name ?? 'Empresa'

  const DURATION_LABELS: Record<string, string> = {
    permanent: 'Contrato fijo',
    temporary: 'Temporal',
    gig: 'Caché / Proyecto',
  }

  const DISCIPLINE_LABELS: Record<string, string> = {
    dance: 'Danza', theater: 'Teatro', singing: 'Canto',
    circus: 'Circo', music: 'Música',
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link href="/jobs" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font)', fontWeight: 500 }}>
        ← Volver a empleos
      </Link>

      <div style={{ marginTop: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
          {job.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Link href={`/u/${employer?.username}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 15, color: 'var(--red)', fontWeight: 500, fontFamily: 'var(--font)' }}>
              {companyName}
            </p>
          </Link>
          {employerProfile?.verified && (
            <span style={{ fontSize: 11, background: 'var(--success-bg)', color: 'var(--success-text)', padding: '2px 8px', borderRadius: 10, fontFamily: 'var(--font)', fontWeight: 500 }}>
              ✓ Verificado
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {job.city && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
              📍 {job.city}
            </span>
          )}
          {job.duration_type && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-highlight)', color: 'var(--red)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
              {DURATION_LABELS[job.duration_type] ?? job.duration_type}
            </span>
          )}
          {job.is_paid && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--success-bg)', color: 'var(--success-text)', fontFamily: 'var(--font)' }}>
              Remunerado
            </span>
          )}
          {job.start_date && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
              📅 Desde {job.start_date}
            </span>
          )}
        </div>

        {job.disciplines?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Disciplinas</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.disciplines.map((d: string) => (
                <span key={d} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: 'var(--bg-highlight)', color: 'var(--red)', fontFamily: 'var(--font)', border: '0.5px solid var(--border)' }}>
                  {DISCIPLINE_LABELS[d] ?? d}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '0.5px solid var(--border)' }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Descripción</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
            {job.description}
          </p>
        </div>

        <JobActions
          jobId={job.id}
          application={application}
          currentUserId={user.id}
          employerId={job.employer_id}
        />
      </div>
    </div>
  )
}
