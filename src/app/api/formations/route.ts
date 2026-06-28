import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, discipline, subdiscipline, city, startDate, endDate, price, capacity } = body

  if (!title || !description || !discipline || !city || !startDate || !endDate || !capacity) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('formations')
    .insert({
      teacher_id: user.id,
      title,
      description,
      discipline,
      subdiscipline: subdiscipline || null,
      city,
      start_date: startDate,
      end_date: endDate,
      price: price ?? 0,
      capacity: parseInt(capacity),
      spots_left: parseInt(capacity),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ formation: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { formationId, status } = await request.json()

  const service = createServiceClient()

  const { error } = await service
    .from('formations')
    .update({ status })
    .eq('id', formationId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
