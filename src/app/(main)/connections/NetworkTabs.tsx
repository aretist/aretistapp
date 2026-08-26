'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PendingConnectionActions from './PendingConnectionActions'

const NOTIFICATION_LABELS: Record<string, (actor: string) => string> = {
  like: (actor) => `${actor} ha dado me gusta a tu publicación`,
  comment: (actor) => `${actor} ha comentado tu publicación`,
  follow: (actor) => `${actor} ha empezado a seguirte`,
  connection_request: (actor) => `${actor} quiere conectar contigo`,
  connection_accepted: (actor) => `${actor} ha aceptado tu solicitud de conexión`,
  job_application: (actor) => `${actor} ha aplicado a tu oferta de trabajo`,
}

const NOTIFICATION_ICONS: Record<string, string> = {
  like: '♥',
  comment: '💬',
  follow: '👤',
  connection_request: '🤝',
  connection_accepted: '✓',
  job_application: '💼',
}

function Avatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: 'var(--pink)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.32,
      fontWeight: 700,
      color: 'var(--red)',
      fontFamily: 'var(--font)',
    }}>
      {url ? (
        <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : initials}
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora mismo'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

interface Props {
  userId: string
  notifications: any[]
  pendingRequests: any[]
  acceptedConnections: any[]
}

export default function NetworkTabs({ userId, notifications, pendingRequests, acceptedConnections }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'notifications' | 'connections'>('notifications')
  const [markingRead, setMarkingRead] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  async function handleMarkAllRead() {
    setMarkingRead(true)
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setMarkingRead(false)
    router.refresh()
  }

 const tabStyle = (tab: 'notifications' | 'connections'): React.CSSProperties => ({
  flex: 1,
  padding: '12px 0',
  textAlign: 'center',
  fontFamily: 'var(--font)',
  fontSize: 14,
  fontWeight: activeTab === tab ? 600 : 400,
  color: activeTab === tab ? 'var(--red)' : 'var(--text-secondary)',
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: activeTab === tab ? '2px solid var(--red)' : '2px solid var(--border)',
  cursor: 'pointer',
  transition: 'color 0.15s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  })

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 20 }}>
        Mi aretist
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', marginBottom: 20 }}>
        <button onClick={() => setActiveTab('notifications')} style={tabStyle('notifications')}>
          Notificaciones
          {unreadCount > 0 && (
            <span style={{
              background: 'var(--red)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 20,
              fontFamily: 'var(--font)',
            }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('connections')} style={tabStyle('connections')}>
          Conexiones
          {pendingRequests.length > 0 && (
            <span style={{
              background: 'var(--red)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 20,
              fontFamily: 'var(--font)',
            }}>
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab: Notificaciones */}
      {activeTab === 'notifications' && (
        <div>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                onClick={handleMarkAllRead}
                disabled={markingRead}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--red)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  opacity: markingRead ? 0.6 : 1,
                }}
              >
                Marcar todas como leídas
              </button>
            </div>
          )}

          {notifications.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', textAlign: 'center', paddingTop: 40 }}>
              No tienes notificaciones todavía
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((notif: any) => {
              const actor = notif.actor
              const label = actor
                ? NOTIFICATION_LABELS[notif.type]?.(actor.full_name) ?? notif.type
                : notif.type
              const icon = NOTIFICATION_ICONS[notif.type] ?? '•'

              return (
                <Link
                  key={notif.id}
                  href={actor ? `/u/${actor.username}` : '#'}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: notif.read ? 'transparent' : 'var(--bg-highlight)',
                    border: notif.read ? '0.5px solid transparent' : '0.5px solid var(--border)',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {actor ? (
                        <Avatar url={actor.avatar_url} name={actor.full_name} size={40} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {icon}
                        </div>
                      )}
                      <span style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'white',
                        border: '0.5px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                      }}>
                        {icon}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', lineHeight: 1.4 }}>
                        {label}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 2 }}>
                        {formatTimeAgo(notif.created_at)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Conexiones */}
      {activeTab === 'connections' && (
        <div>
          {/* Solicitudes pendientes */}
          {pendingRequests.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Solicitudes pendientes ({pendingRequests.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingRequests.map((req: any) => (
                  <div key={req.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'white',
                    border: '0.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <Link href={`/u/${req.requester.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, textDecoration: 'none' }}>
                      <Avatar url={req.requester.avatar_url} name={req.requester.full_name} />
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>
                          {req.requester.full_name}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                          @{req.requester.username}
                        </p>
                      </div>
                    </Link>
                    <PendingConnectionActions connectionId={req.id} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conexiones aceptadas */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mis conexiones {acceptedConnections.length > 0 ? `(${acceptedConnections.length})` : ''}
            </p>

            {acceptedConnections.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', textAlign: 'center', paddingTop: 20 }}>
                Aún no tienes conexiones. Busca artistas y conecta con ellos.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {acceptedConnections.map((conn: any) => {
                const other = conn.requester_id === userId ? conn.addressee : conn.requester
                return (
                  <Link key={conn.id} href={`/u/${other.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: 'white',
                      border: '0.5px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <Avatar url={other.avatar_url} name={other.full_name} />
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>
                          {other.full_name}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
                          @{other.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
