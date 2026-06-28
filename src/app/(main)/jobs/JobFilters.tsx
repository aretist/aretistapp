'use client'

import { useRouter, usePathname } from 'next/navigation'

interface Props {
  disciplines: { value: string; label: string }[]
  currentFilters: { discipline?: string; city?: string; duration?: string }
}

const DURATION_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'permanent', label: 'Fijo' },
  { value: 'temporary', label: 'Temporal' },
  { value: 'gig', label: 'Caché' },
]

export default function JobFilters({ disciplines, currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (currentFilters.discipline) params.set('discipline', currentFilters.discipline)
    if (currentFilters.city) params.set('city', currentFilters.city)
    if (currentFilters.duration) params.set('duration', currentFilters.duration)
    if (value) { params.set(key, value) } else { params.delete(key) }
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
  }

  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: 'var(--black)',
    color: 'white',
    border: '1px solid var(--black)',
  }

  const chipInactive: React.CSSProperties = {
    ...chipBase,
    background: 'white',
    color: 'var(--text-primary)',
  }

  return (
    <div>
      {/* Búsqueda por ciudad */}
      <div style={{ marginBottom: 12 }}>
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
            placeholder="Buscar castings, compañías, categorías..."
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
      </div>

      {/* Chips de disciplina */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {disciplines.map((d) => {
          const isActive = (currentFilters.discipline ?? '') === d.value
          return (
            <button
              key={d.value}
              onClick={() => updateFilter('discipline', d.value)}
              style={isActive ? chipActive : chipInactive}
            >
              {d.label}
            </button>
          )
        })}
        {(currentFilters.discipline || currentFilters.city || currentFilters.duration) && (
          <button
            onClick={() => router.push(pathname)}
            style={{ ...chipInactive, color: 'var(--red)', borderColor: 'var(--red)' }}
          >
            Limpiar ×
          </button>
        )}
      </div>
    </div>
  )
}
