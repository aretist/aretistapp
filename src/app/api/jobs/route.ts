import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, disciplines, city, country, durationType, startDate, endDate, isPaid } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Título y descripción son obligatorios' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      employer_id: user.id,
      title,
      description,
      disciplines: disciplines ?? [],
      city: city || null,
      country: country || 'ES',
      duration_type: durationType || null,
      start_date: startDate || null,
      end_date: endDate || null,
      is_paid: isPaid ?? true,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }

  return NextResponse.json({ job: data })
}

// Edición por el creador de la oferta
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { jobId, title, description, disciplines, city, durationType, startDate, endDate, isPaid } = body

  if (!jobId || !title || !description) {
    return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
  }

  // Verificar que el empleo pertenece al usuario
  const { data: existing } = await supabase
    .from('jobs')
    .select('employer_id')
    .eq('id', jobId)
    .single()

  if (!existing || existing.employer_id !== user.id) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { error } = await supabase
    .from('jobs')
    .update({
      title,
      description,
      disciplines: disciplines ?? [],
      city: city || null,
      duration_type: durationType || null,
      start_date: startDate || null,
      end_date: endDate || null,
      is_paid: isPaid ?? true,
      status: 'pending', // vuelve a revisión tras editar
    })
    .eq('id', jobId)

  if (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// Admin: cambiar status de una oferta
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

  const { jobId, status } = await request.json()

  const { createServiceClient } = await import('@/lib/supabase/service')
  const service = createServiceClient()

  const { error } = await service
    .from('jobs')
    .update({ status })
    .eq('id', jobId)

  if (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
