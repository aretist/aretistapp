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
  users: { full_name: string; username: string } | null
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

const DISCIPLINE_LABELS: Record<string, string> = {
  dance: 'Danza', theater: 'Teatro', singing: 'Canto',
  circus: 'Circo', opera: 'Ópera', music: 'Música',
}

const AVATAR_COLORS = [
  { bg: '#FFE8EC', text: '#B00020' },
  { bg: '#E6F0FF', text: '#1A5AA8' },
  { bg: '#E8F5EE', text: '#1B6B3A' },
  { bg: '#FFF3E0', text: '#E65100' },
  { bg: '#F3E5F5', text: '#6A1B9A' },
  { bg: '#E0F7FA', text: '#006064' },
]

function getAvatarColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export default function JobCard({ job, application }: { job: Job; application: Application | null }) {
  const companyName = job.employer_profiles?.company_name ?? job.users?.full_name ?? 'Empresa'
  const initials = companyName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const avatarColor = getAvatarColor(companyName)
  const applied = application?.status === 'applied'
  const saved = application?.saved
  const days = daysAgo(job.created_at)

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'white',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: avatarColor.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font)',
          fontWeight: 700,
          fontSize: 15,
          color: avatarColor.text,
          flexShrink: 0,
          letterSpacing: '-0.5px',
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 3 }}>
            {companyName}
            {job.employer_profiles?.verified && (
              <span style={{ color: 'var(--success-text)', marginLeft: 6 }}>✦</span>
            )}
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)', lineHeight: 1.3, marginBottom: 6 }}>
            {job.title}
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {job.city && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                • {job.city}
              </span>
            )}
            {job.disciplines?.[0] && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                • {DISCIPLINE_LABELS[job.disciplines[0]] ?? job.disciplines[0]}
              </span>
            )}
            {job.duration_type && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                • {DURATION_LABELS[job.duration_type] ?? job.duration_type}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {applied ? (
            <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--success-bg)', color: 'var(--success-text)', padding: '3px 8px', borderRadius: 'var(--radius-full)', fontFamily: 'var(--font)' }}>
              Aplicado ✓
            </span>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>
              {job.is_paid ? 'Negoc.' : 'Voluntario'}
            </span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font)', letterSpacing: '0.04em' }}>
            {days === 0 ? 'HOY' : `${days} DÍA${days !== 1 ? 'S' : ''}`}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'var(--red)' : 'none'} stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}
