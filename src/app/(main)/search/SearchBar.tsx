'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialQuery: string
  initialRole: string
  initialDiscipline: string
  initialCity: string
  disciplines: { value: string; label: string }[]
}

export default function SearchBar({
  initialQuery,
  initialRole,
  initialDiscipline,
  initialCity,
  disciplines,
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [role, setRole] = useState(initialRole)
  const [discipline, setDiscipline] = useState(initialDiscipline)
  const [city, setCity] = useState(initialCity)

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (role) params.set('role', role)
    if (discipline) params.set('discipline', discipline)
    if (city.trim()) params.set('city', city.trim())
    router.push(`/search?${params.toString()}`)
  }

  function clearAll() {
    setQuery('')
    setRole('')
    setDiscipline('')
    setCity('')
    router.push('/search')
  }

  const hasFilters = query || role || discipline || city

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre, username o ciudad..."
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            background: '#534AB7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); }}
          style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
        >
          <option value="">Todos los roles</option>
          <option value="artist">Artista</option>
          <option value="teacher">Profesor</option>
          <option value="employer">Empleador</option>
        </select>

        <select
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
        >
          {disciplines.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          style={{
            padding: '7px 14px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Aplicar filtros
        </button>

        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              padding: '7px 14px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              cursor: 'pointer',
              color: '#666',
            }}
          >
            Limpiar ×
          </button>
        )}
      </div>
    </div>
  )
}
