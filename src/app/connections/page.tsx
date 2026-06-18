import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PendingConnectionActions from './PendingConnectionActions'

export default async function ConnectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: pendingRequests } = await supabase
    .from('connections')
    .select('*, requester:users!connections_requester_id_fkey(id, username, full_name, avatar_url)')
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  const { data: acceptedConnections } = await supabase
    .from('connections')
    .select(`
      *,
      requester:users!connections_requester_id_fkey(id, username, full_name, avatar_url),
      addressee:users!connections_addressee_id_fkey(id, username, full_name, avatar_url)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>Conexiones</h1>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Solicitudes pendientes {pendingRequests?.length ? `(${pendingRequests.length})` : ''}
        </h2>

        {!pendingRequests?.length && (
          <p style={{ fontSize: 13, color: '#999' }}>No tienes solicitudes pendientes</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingRequests?.map((req: any) => (
            <div
              key={req.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                background: '#fafafa',
                borderRadius: 8,
              }}
            >
              <Link href={`/u/${req.requester.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: req.requester.avatar_url ? `url(${req.requester.avatar_url})` : '#EEEDFE',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{req.requester.full_name}</p>
                  <p style={{ fontSize: 12, color: '#999' }}>@{req.requester.username}</p>
                </div>
              </Link>
              <PendingConnectionActions connectionId={req.id} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Mis conexiones {acceptedConnections?.length ? `(${acceptedConnections.length})` : ''}
        </h2>

        {!acceptedConnections?.length && (
          <p style={{ fontSize: 13, color: '#999' }}>Aún no tienes conexiones</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {acceptedConnections?.map((conn: any) => {
            const other = conn.requester_id === user.id ? conn.addressee : conn.requester
            return (
              <Link
                key={conn.id}
                href={`/u/${other.username}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  background: '#fafafa',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: other.avatar_url ? `url(${other.avatar_url})` : '#EEEDFE',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{other.full_name}</p>
                  <p style={{ fontSize: 12, color: '#999' }}>@{other.username}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
