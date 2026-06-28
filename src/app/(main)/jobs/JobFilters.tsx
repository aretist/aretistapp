'use client'

import { useRouter, usePathname } from 'next/navigation'

interface Props {
  disciplines: { value: string; label: string }[]
  currentFilters: { discipline?: string; city?: string; duration?: string }
}

export default function JobFilters({ disciplines, currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()
    if (currentFilters.discipline) params.set('discipline', currentFilters.discipline)
    if (currentFilters.city) params.set('city', currentFilters.city)
    if (currentFilters.duration) params.set('duration', currentFilters.duration)

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <select
        value={currentFilters.discipline ?? ''}
        onChange={(e) => updateFilter('discipline', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
      >
        {disciplines.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Ciudad..."
        defaultValue={currentFilters.city ?? ''}
        onBlur={(e) => updateFilter('city', e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && updateFilter('city', (e.target as HTMLInputElement).value)}
        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 140 }}
      />

      <select
        value={currentFilters.duration ?? ''}
        onChange={(e) => updateFilter('duration', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
      >
        <option value="">Cualquier duración</option>
        <option value="permanent">Contrato fijo</option>
        <option value="temporary">Temporal</option>
        <option value="gig">Caché / Proyecto</option>
      </select>

      {(currentFilters.discipline || currentFilters.city || currentFilters.duration) && (
        <button
          onClick={() => router.push(pathname)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: 'white' }}
        >
          Limpiar filtros ×
        </button>
      )}
    </div>
  )
}
