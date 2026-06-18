import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { targetUserId } = await request.json()

  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
  }

  // Comprobar si ya lo sigue
  const { data: existing } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    // Deja de seguir
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)

    return NextResponse.json({ following: false })
  }

  // Empieza a seguir
  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: targetUserId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ following: true })
}
