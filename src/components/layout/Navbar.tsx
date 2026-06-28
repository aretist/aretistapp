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

function IconFeed({ active }: { active: boolean }) {
  const c = active ? 'var(--red)' : 'var(--text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function IconJobs({ active }: { active: boolean }) {
  const c = active ? 'var(--red)' : 'var(--text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="12.01" strokeWidth="2"/>
      <path d="M2 12h20"/>
    </svg>
  )
}

function IconFormations({ active }: { active: boolean }) {
  const c = active ? 'var(--red)' : 'var(--text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}

function IconNetwork({ active }: { active: boolean }) {
  const c = active ? 'var(--red)' : 'var(--text-secondary)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/>
      <path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
      <path d="M0 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>
      <path d="M16 15a4 4 0 0 1 4 4v2"/>
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/feed', label: 'Inicio', Icon: IconFeed },
  { href: '/jobs', label: 'Empleos', Icon: IconJobs },
  { href: '/formations', label: 'Formaciones', Icon: IconFormations },
  { href: '/connections', label: 'Mi red', Icon: IconNetwork },
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
      setSearch('')
    }
  }

  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--navbar-height)',
      background: 'white',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/feed" style={{
        fontFamily: 'var(--font)',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--red)',
        letterSpacing: '-0.5px',
        flexShrink: 0,
        textDecoration: 'none',
      }}>
        aretist
      </Link>

      {/* Buscador */}
      <form onSubmit={handleSearch} style={{ flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '0 14px',
          height: 36,
          width: 240,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artistas, empresas..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              fontFamily: 'var(--font)',
              color: 'var(--text-primary)',
              width: '100%',
            }}
          />
        </div>
      </form>

      {/* Tabs */}
      <div style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: 2 }}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '0 16px',
                textDecoration: 'none',
                color: isActive ? 'var(--red)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--red)' : '2px solid transparent',
                height: 'var(--navbar-height)',
                minWidth: 72,
                transition: 'color 0.15s',
                fontFamily: 'var(--font)',
              }}
            >
              <Icon active={isActive} />
              <span style={{ fontSize: 11, fontWeight: isActive ? 500 : 400 }}>{label}</span>
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
            fontFamily: 'var(--font)',
            color: showMenu ? 'var(--red)' : 'var(--text-secondary)',
          }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: avatarUrl ? 'transparent' : 'var(--pink)',
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--red)',
            flexShrink: 0,
            fontFamily: 'var(--font)',
          }}>
            {!avatarUrl && initials}
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font)' }}>Yo ▾</span>
        </button>

        {showMenu && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
            <div style={{
              position: 'absolute',
              top: 60,
              right: 0,
              background: 'white',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              minWidth: 200,
              zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--border)' }}>
                <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{fullName}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font)' }}>@{username}</p>
              </div>
              <Link href="/profile" onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font)', borderBottom: '0.5px solid var(--border)', textDecoration: 'none' }}>
                Editar perfil
              </Link>
              <Link href={`/u/${username}`} onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '11px 16px', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font)', borderBottom: '0.5px solid var(--border)', textDecoration: 'none' }}>
                Ver perfil público
              </Link>
              <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 14, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}
