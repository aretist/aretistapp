import Link from 'next/link'

interface Job {
  id: string
  title: string
  description: string
  disciplines: string[]
  city: string | null
  duration_type: string | null
  is_paid: boolean
  created_at: string
  users: { full_name: string; username: string }
  employer_profiles: { company_name: string; verified: boolean } | null
}

interface Application {
  job_id: string
  status: string
  saved: boolean
}

const DURATION_LABELS: Record<string, string> = {
  permanent: 'Contrato fijo',
  temporary: 'Temporal',
  gig: 'Caché / Proyecto',
}

export default function JobCard({ job, application }: { job: Job; application: Application | null }) {
  const companyName = job.employer_profiles?.company_name ?? job.users.full_name
  const applied = application?.status === 'applied'
  const saved = application?.saved

  return (
    <Link
      href={`/jobs/${job.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: 10,
          padding: 16,
          transition: 'border-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{job.title}</p>
            <p style={{ fontSize: 13, color: '#666' }}>{companyName}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {applied && (
              <span style={{ fontSize: 11, background: '#EAF3DE', color: '#27500A', padding: '2px 8px', borderRadius: 10 }}>
                Aplicado ✓
              </span>
            )}
            {saved && !applied && (
              <span style={{ fontSize: 11, background: '#FAEEDA', color: '#633806', padding: '2px 8px', borderRadius: 10 }}>
                Guardado
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#444', marginTop: 8, lineHeight: 1.5 }}>
          {job.description.length > 120 ? job.description.slice(0, 120) + '...' : job.description}
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {job.city && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
              📍 {job.city}
            </span>
          )}
          {job.duration_type && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#EEEDFE', color: '#3C3489' }}>
              {DURATION_LABELS[job.duration_type] ?? job.duration_type}
            </span>
          )}
          {job.is_paid && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#E1F5EE', color: '#085041' }}>
              Remunerado
            </span>
          )}
          {job.disciplines?.map((d) => (
            <span key={d} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f5f5f5', color: '#555' }}>
              {d}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
