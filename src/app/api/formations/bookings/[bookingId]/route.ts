import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status } = await req.json()

  const { data: booking } = await supabase
    .from('formation_bookings')
    .select('id, formation_id, formations(teacher_id)')
    .eq('id', bookingId)
    .single()

  if (!booking || (booking.formations as any)?.teacher_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await supabase
    .from('formation_bookings')
    .update({ status })
    .eq('id', bookingId)

  return NextResponse.json({ ok: true })
}