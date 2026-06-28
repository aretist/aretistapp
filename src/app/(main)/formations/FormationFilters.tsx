'use client'

import { useRouter, usePathname } from 'next/navigation'

const DISCIPLINES = [
  { value: '', label: 'Todas' },
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'opera', label: 'Ópera' },
  { value: 'music', label: 'Música' },
]

const SUBDISCIPLINES: Record<string, { value: string; label: string }[]> = {
  dance: [
    { value: 'jazz', label: 'Jazz' },
    { value: 'urban', label: 'Urbano' },
    { value: 'classical', label: 'Clásico' },
    { value: 'contemporary', label: 'Contemporáneo' },
    { value: 'flamenco', label: 'Flamenco' },
    { value: 'ballroom', label: 'Salón' },
  ],
  theater: [
    { value: 'clown', label: 'Clown' },
    { value: 'physical', label: 'Físico' },
    { value: 'musical', label: 'Musical' },
    { value: 'improv', label: 'Impro' },
  ],
}

interface Props {
  currentFilters: { discipline?: string; subdiscipline?: string; city?: string }
}

export default function FormationFilters({ currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (currentFilters.discipline) params.set('discipline', currentFilters.discipline)
    if (currentFilters.subdiscipline) params.set('subdiscipline', currentFilters.subdiscipline)
    if (currentFilters.city) params.set('city', currentFilters.city)
    if (value) { params.set(key, value) } else { params.delete(key) }
    if (key === 'discipline') params.delete('subdiscipline')
    router.push(`${pathname}?${params.toString()}`)
  }

  const chipBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'var(--font)',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    background: 'white',
    color: 'var(--text-primary)',
  }

  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: 'var(--black)',
    color: 'white',
    border: '1px solid var(--black)',
  }

  const subdisciplineOptions = currentFilters.discipline
    ? SUBDISCIPLINES[currentFilters.discipline] ?? []
    : []

  const hasFilters = currentFilters.discipline || currentFilters.city || currentFilters.subdiscipline

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Búsqueda ciudad */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-full)',
        padding: '0 16px',
        height: 40,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Ciudad..."
          defaultValue={currentFilters.city ?? ''}
          onBlur={(e) => updateFilter('city', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && updateFilter('city', (e.target as HTMLInputElement).value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 14,
            fontFamily: 'var(--font)',
            color: 'var(--text-primary)',
            width: '100%',
          }}
        />
      </div>

      {/* Chips disciplina */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {DISCIPLINES.map((d) => {
          const isActive = (currentFilters.discipline ?? '') === d.value
          return (
            <button key={d.value} onClick={() => updateFilter('discipline', d.value)} style={isActive ? chipActive : chipBase}>
              {d.label}
            </button>
          )
        })}
      </div>

      {/* Chips subdisciplina */}
      {subdisciplineOptions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {subdisciplineOptions.map((s) => {
            const isActive = currentFilters.subdiscipline === s.value
            return (
              <button key={s.value} onClick={() => updateFilter('subdiscipline', s.value)} style={isActive ? chipActive : chipBase}>
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          style={{ ...chipBase, color: 'var(--red)', borderColor: 'var(--red)', alignSelf: 'flex-start' }}
        >
          Limpiar filtros ×
        </button>
      )}
    </div>
  )
}
