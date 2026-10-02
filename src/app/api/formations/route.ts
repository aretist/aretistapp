import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeRichText } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const {
    title, description, discipline, subdiscipline,
    city, location, address, level,
    what_to_bring, cancellation_policy,
    startDate, endDate, price, capacity,
    payment_methods, bizum_number, iban,
  } = body

  if (!title || !description || !discipline || !city || !startDate || !endDate || !capacity) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('formations')
    .insert({
      teacher_id: user.id,
      title,
      description: sanitizeRichText(description),
      discipline,
      subdiscipline: subdiscipline || null,
      city,
      location: location || null,
      address: address || null,
      level: level || null,
      what_to_bring: what_to_bring || null,
      cancellation_policy: cancellation_policy || null,
      start_date: startDate,
      end_date: endDate,
      price: price ?? 0,
      capacity: parseInt(capacity),
      spots_left: parseInt(capacity),
      payment_methods: payment_methods ?? ['bizum', 'transferencia', 'efectivo'],
      bizum_number: bizum_number || null,
      iban: iban || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const {
    id, title, description, discipline, subdiscipline,
    city, location, address, level,
    what_to_bring, cancellation_policy,
    start_date, end_date, price, capacity,
    payment_methods, bizum_number, iban,
  } = body

  if (!id || !title || !discipline || !city || !start_date || !end_date) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('formations')
    .select('teacher_id')
    .eq('id', id)
    .single()

  if (!existing || existing.teacher_id !== user.id) {
    return NextResponse.json({ error: 'No tienes permiso para editar esta formación' }, { status: 403 })
  }

  const { error } = await supabase
    .from('formations')
    .update({
      title,
      description: description ? sanitizeRichText(description) : '',
      discipline,
      subdiscipline: subdiscipline || null,
      city,
      location: location || null,
      address: address || null,
      level: level || null,
      what_to_bring: what_to_bring || null,
      cancellation_policy: cancellation_policy || null,
      start_date,
      end_date,
      price: price ?? null,
      capacity: capacity ? parseInt(capacity) : null,
      payment_methods: payment_methods ?? null,
      bizum_number: bizum_number || null,
      iban: iban || null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}