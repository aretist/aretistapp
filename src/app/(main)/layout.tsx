import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [
    { data: profile },
    { count: unreadCount },
  ] = await Promise.all([
    supabase.from('users').select('username, full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  if (!profile) redirect('/onboarding')

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding-bottom: calc(60px + env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
      <Navbar
        username={profile.username}
        avatarUrl={profile.avatar_url}
        fullName={profile.full_name}
        unreadCount={unreadCount ?? 0}
      />
      <main className="main-content" style={{ paddingTop: 56 }}>
        {children}
      </main>
    </>
  )
}
