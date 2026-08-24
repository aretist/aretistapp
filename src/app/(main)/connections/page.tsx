import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PendingConnectionActions from './PendingConnectionActions'
import MarkAllReadButton from './MarkAllReadButton'

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
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: url ? 'transparent' : 'var(--pink)',
      backgroundImage: url ? `url(${url})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.32,
      fontWeight: 700,
      color: 'var(--red)',
      flexShrink: 0,
      fontFamily: 'var(--font)',
    }}>
      {!url && initials}
    </div>
  )
}

export default async function ConnectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: notifications },
    { data: pendingRequests },
    { data: acceptedConnections },
  ] = await Promise.all([
    supabase
      .from('notifications')
      .select('*, actor:users!notifications_actor_id_fkey(id, full_name, username, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('connections')
      .select('*, requester:users!connections_requester_id_fkey(id, username, full_name, avatar_url)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('connections')
      .select('*, requester:users!connections_requester_id_fkey(id, username, full_name, avatar_url), addressee:users!connections_addressee_id_fkey(id, username, full_name, avatar_url)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
  ])

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 24 }}>
        Mi red
      </h1>

      {/* NOTIFICACIONES */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
              Notificaciones
            </h2>
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--red)',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 20,
                fontFamily: 'var(--font)',
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && <MarkAllReadButton />}
        </div>

        {!notifications?.length && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            No tienes notificaciones todavía
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications?.map((notif: any) => {
            const actor = notif.actor
            const label = actor
              ? NOTIFICATION_LABELS[notif.type]?.(actor.full_name) ?? notif.type
              : notif.type
            const icon = NOTIFICATION_ICONS[notif.type] ?? '•'
            const timeAgo = formatTimeAgo(notif.created_at)

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
                  background: notif.read ? 'transparent' : 'var(--bg-highlight)',
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
                      {timeAgo}
                    </p>
                  </div>

                  {!notif.read && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--red)',
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* SOLICITUDES PENDIENTES */}
      {pendingRequests && pendingRequests.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 14 }}>
            Solicitudes pendientes ({pendingRequests.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        </section>
      )}

      {/* MIS CONEXIONES */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 14 }}>
          Mis conexiones {acceptedConnections?.length ? `(${acceptedConnections.length})` : ''}
        </h2>

        {!acceptedConnections?.length && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            Aún no tienes conexiones. Busca artistas y conecta con ellos.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {acceptedConnections?.map((conn: any) => {
            const other = conn.requester_id === user.id ? conn.addressee : conn.requester
            return (
              <Link
                key={conn.id}
                href={`/u/${other.username}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
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
      </section>
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
