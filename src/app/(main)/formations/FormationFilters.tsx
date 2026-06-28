'use client'

import { useRouter, usePathname } from 'next/navigation'

const DISCIPLINES = [
  { value: '', label: 'Todas las disciplinas' },
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
    { value: 'ballroom', label: 'Baile de salón' },
  ],
  theater: [
    { value: 'clown', label: 'Clown' },
    { value: 'physical', label: 'Teatro físico' },
    { value: 'musical', label: 'Musical' },
    { value: 'improv', label: 'Improvisación' },
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

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Si cambia la disciplina, resetear subdisciplina
    if (key === 'discipline') params.delete('subdiscipline')

    router.push(`${pathname}?${params.toString()}`)
  }

  const subdisciplineOptions = currentFilters.discipline
    ? SUBDISCIPLINES[currentFilters.discipline] ?? []
    : []

  const hasFilters = currentFilters.discipline || currentFilters.city || currentFilters.subdiscipline

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <select
        value={currentFilters.discipline ?? ''}
        onChange={(e) => updateFilter('discipline', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
      >
        {DISCIPLINES.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      {subdisciplineOptions.length > 0 && (
        <select
          value={currentFilters.subdiscipline ?? ''}
          onChange={(e) => updateFilter('subdiscipline', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">Todos los estilos</option>
          {subdisciplineOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      )}

      <input
        type="text"
        placeholder="Ciudad..."
        defaultValue={currentFilters.city ?? ''}
        onBlur={(e) => updateFilter('city', e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && updateFilter('city', (e.target as HTMLInputElement).value)}
        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 140 }}
      />

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'white' }}
        >
          Limpiar ×
        </button>
      )}
    </div>
  )
}
