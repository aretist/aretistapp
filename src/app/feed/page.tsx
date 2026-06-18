import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>
        🎭 Feed — Aretist
      </h1>

      <div style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Sesión activa</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Nombre:</strong> {profile?.full_name ?? '— pendiente de onboarding —'}</p>
        <p><strong>Username:</strong> {profile?.username ?? '—'}</p>
        <p><strong>Roles:</strong> {profile?.roles?.length ? profile.roles.join(', ') : '— ninguno —'}</p>
      </div>

      <p style={{ color: '#666', marginBottom: 16 }}>
        Esto es una página temporal. El feed real con posts vendrá en la siguiente fase.
      </p>

      <LogoutButton />
    </div>
  )
}
