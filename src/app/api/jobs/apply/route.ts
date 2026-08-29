import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendApplicationNotificationEmail } from '@/lib/resend/emails'

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
      const { error } = await supabase
        .from('job_applications')
        .update({ saved: !existing.saved })
        .eq('id', existing.id)

      if (error) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
      return NextResponse.json({ saved: !existing.saved })
    }

    const { error } = await supabase.from('job_applications').insert({
      job_id: jobId,
      applicant_id: user.id,
      saved: true,
      status: 'applied',
    })

    if (error) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
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

    if (error) return NextResponse.json({ error: 'Error al aplicar' }, { status: 500 })

    // Enviar email directamente — sin fetch interno, sin vuelta de red extra
    try {
      const [{ data: job }, { data: applicant }] = await Promise.all([
        supabase.from('jobs').select('title, employer_id').eq('id', jobId).single(),
        supabase.from('users').select('full_name, username').eq('id', user.id).single(),
      ])

      if (job && applicant) {
        const [{ data: employerAuth }, { data: employer }] = await Promise.all([
          supabase.auth.admin.getUserById(job.employer_id),
          supabase.from('users').select('full_name').eq('id', job.employer_id).single(),
        ])

        if (employerAuth?.user?.email && employer) {
          await sendApplicationNotificationEmail({
            to: employerAuth.user.email,
            employerName: employer.full_name,
            jobTitle: job.title,
            applicantName: applicant.full_name,
            applicantUsername: applicant.username,
          })
        }
      }
    } catch (emailError) {
      // El email falla silenciosamente — la candidatura ya está guardada
      console.error('Error enviando email de candidatura:', emailError)
    }

    return NextResponse.json({ applied: true })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
