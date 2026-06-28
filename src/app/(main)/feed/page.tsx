import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostComposer from './PostComposer'
import PostCard from './PostCard'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const { data: connections } = await supabase
    .from('connections')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const followingIds = following?.map((f) => f.following_id) ?? []
  const connectionIds =
    connections?.map((c) => (c.requester_id === user.id ? c.addressee_id : c.requester_id)) ?? []

  const visibleUserIds = Array.from(new Set([user.id, ...followingIds, ...connectionIds]))

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      users!posts_user_id_fkey(id, full_name, username, avatar_url),
      post_likes(user_id),
      post_comments(*, users(full_name, username, avatar_url))
    `)
    .in('user_id', visibleUserIds)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 20 }}>Inicio</h1>

      <PostComposer userId={user.id} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {!posts?.length && (
          <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '40px 0' }}>
            Aún no hay publicaciones. Sigue a otros artistas o publica algo tú mismo.
          </p>
        )}

        {posts?.map((post: any) => (
          <PostCard key={post.id} post={post} currentUserId={user.id} />
        ))}
      </div>
    </div>
  )
}
