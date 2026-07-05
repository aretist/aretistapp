import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { jobId, action } = await request.json()

  if (!jobId || !action) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  // Comprobar si ya hay una candidatura
  const { data: existing } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .maybeSingle()

  if (action === 'save') {
    if (existing) {
      // Toggle: si ya existe, actualizamos saved
      const { error } = await supabase
        .from('job_applications')
        .update({ saved: !existing.saved })
        .eq('id', existing.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ saved: !existing.saved })
    }

    // Nueva candidatura solo guardada
    const { error } = await supabase.from('job_applications').insert({
      job_id: jobId,
      applicant_id: user.id,
      saved: true,
      status: 'applied',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ saved: true })
  }

  if (action === 'apply') {
    if (existing) {
      return NextResponse.json({ error: 'Ya has aplicado a esta oferta' }, { status: 400 })
    }

    const { error } = await supabase.from('job_applications').insert({
      job_id: jobId,
      applicant_id: user.id,
      saved: false,
      status: 'applied',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notificar al empleador por email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
    } catch {}

    return NextResponse.json({ applied: true })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
