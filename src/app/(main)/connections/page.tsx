import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NetworkTabs from './NetworkTabs'

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

  return (
    <NetworkTabs
      userId={user.id}
      notifications={notifications ?? []}
      pendingRequests={pendingRequests ?? []}
      acceptedConnections={acceptedConnections ?? []}
    />
  )
}
