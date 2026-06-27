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

  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      users!jobs_employer_id_fkey(id, full_name, username, avatar_url),
      employer_profiles(company_name, logo_url, verified, website)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (!job) notFound()

  const { data: application } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', id)
    .eq('applicant_id', user.id)
    .maybeSingle()

  const companyName = job.employer_profiles?.company_name ?? job.users.full_name

  const DURATION_LABELS: Record<string, string> = {
    permanent: 'Contrato fijo',
    temporary: 'Temporal',
    gig: 'Caché / Proyecto',
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link href="/jobs" style={{ fontSize: 13, color: '#534AB7', textDecoration: 'none' }}>
        ← Volver a empleos
      </Link>

      <div style={{ marginTop: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{job.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Link href={`/u/${job.users.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <p style={{ fontSize: 15, color: '#534AB7', fontWeight: 500 }}>{companyName}</p>
          </Link>
          {job.employer_profiles?.verified && (
            <span style={{ fontSize: 11, background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 10 }}>
              ✓ Verificado
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {job.city && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
              📍 {job.city}
            </span>
          )}
          {job.duration_type && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#EEEDFE', color: '#3C3489' }}>
              {DURATION_LABELS[job.duration_type] ?? job.duration_type}
            </span>
          )}
          {job.is_paid && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#E1F5EE', color: '#085041' }}>
              Remunerado
            </span>
          )}
          {job.start_date && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
              📅 Desde {job.start_date}
            </span>
          )}
        </div>

        {job.disciplines?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Disciplinas</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {job.disciplines.map((d: string) => (
                <span key={d} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#FAEEDA', color: '#633806' }}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #eee' }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Descripción</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>

        <JobActions jobId={job.id} application={application} currentUserId={user.id} employerId={job.employer_id} />
      </div>
    </div>
  )
}
