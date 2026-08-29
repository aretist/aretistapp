import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PAGE_SIZE = 12

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') // created_at del último post cargado

  const [{ data: following }, { data: connections }] = await Promise.all([
    supabase.from('follows').select('following_id').eq('follower_id', user.id),
    supabase.from('connections').select('requester_id, addressee_id').eq('status', 'accepted').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
  ])

  const followingIds = following?.map((f) => f.following_id) ?? []
  const connectionIds = connections?.map((c) => c.requester_id === user.id ? c.addressee_id : c.requester_id) ?? []
  const visibleUserIds = Array.from(new Set([user.id, ...followingIds, ...connectionIds]))

  let query = supabase
    .from('posts')
    .select(`
      *,
      users!posts_user_id_fkey(id, full_name, username, avatar_url),
      post_likes(user_id),
      post_comments(*, users(full_name, username, avatar_url))
    `)
    .in('user_id', visibleUserIds)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  // Paginación por cursor — cargar posts más antiguos que el último
  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: posts, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Error al cargar posts' }, { status: 500 })
  }

  return NextResponse.json({
    posts: posts ?? [],
    hasMore: (posts ?? []).length === PAGE_SIZE,
    nextCursor: posts?.length ? posts[posts.length - 1].created_at : null,
  })
}
