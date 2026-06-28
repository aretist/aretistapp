'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  username: string
  avatarUrl: string | null
  fullName: string
}

const NAV_ITEMS = [
  { href: '/feed', label: 'Inicio', icon: '🏠' },
  { href: '/jobs', label: 'Empleos', icon: '💼' },
  { href: '/formations', label: 'Formaciones', icon: '🎓' },
  { href: '/connections', label: 'Mi red', icon: '👥' },
]

export default function Navbar({ username, avatarUrl, fullName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      background: 'white',
      borderBottom: '1px solid #e5e5e5',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/feed" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 34,
          height: 34,
          background: '#534AB7',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 16,
        }}>
          A
        </div>
      </Link>

      {/* Buscador */}
      <form onSubmit={handleSearch} style={{ flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#EEF3F8',
          borderRadius: 4,
          padding: '0 12px',
          height: 34,
          width: 220,
        }}>
          <span style={{ fontSize: 14, color: '#666' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 14,
              width: '100%',
            }}
          />
        </div>
      </form>

      {/* Tabs centrales */}
      <div style={{
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        gap: 4,
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '4px 16px',
                textDecoration: 'none',
                color: isActive ? '#534AB7' : '#666',
                borderBottom: isActive ? '2px solid #534AB7' : '2px solid transparent',
                height: 56,
                minWidth: 70,
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 11, fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Avatar + menú */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            color: showMenu ? '#534AB7' : '#666',
          }}
        >
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#EEEDFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: '#534AB7',
            flexShrink: 0,
          }}>
            {!avatarUrl && fullName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 11 }}>Yo ▾</span>
        </button>

        {showMenu && (
          <div style={{
            position: 'absolute',
            top: 60,
            right: 0,
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            minWidth: 200,
            zIndex: 200,
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
              <p style={{ fontWeight: 500, fontSize: 14 }}>{fullName}</p>
              <p style={{ fontSize: 12, color: '#666', marginTop: 2 }}>@{username}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setShowMenu(false)}
              style={{ display: 'block', padding: '10px 16px', fontSize: 14, textDecoration: 'none', color: '#333' }}
            >
              Ver perfil
            </Link>
            <Link
              href={`/u/${username}`}
              onClick={() => setShowMenu(false)}
              style={{ display: 'block', padding: '10px 16px', fontSize: 14, textDecoration: 'none', color: '#333' }}
            >
              Perfil público
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                fontSize: 14,
                color: '#c00',
                background: 'none',
                border: 'none',
                borderTop: '1px solid #eee',
                cursor: 'pointer',
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
