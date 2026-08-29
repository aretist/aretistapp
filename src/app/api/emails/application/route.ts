import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendApplicationNotificationEmail } from '@/lib/resend/emails'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { jobId } = await request.json()

  if (!jobId) {
    return NextResponse.json({ error: 'Falta jobId' }, { status: 400 })
  }

  // Verificar que existe una candidatura real de este usuario a este empleo
  const { data: application } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('applicant_id', user.id)
    .eq('status', 'applied')
    .maybeSingle()

  if (!application) {
    return NextResponse.json({ error: 'No existe candidatura válida' }, { status: 403 })
  }

  // Obtener datos del empleo
  const { data: job } = await supabase
    .from('jobs')
    .select('title, employer_id')
    .eq('id', jobId)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Empleo no encontrado' }, { status: 404 })
  }

  // Obtener datos del empleador y candidato en paralelo
  const [
    { data: employerAuth },
    { data: employer },
    { data: applicant },
  ] = await Promise.all([
    supabase.auth.admin.getUserById(job.employer_id),
    supabase.from('users').select('full_name').eq('id', job.employer_id).single(),
    supabase.from('users').select('full_name, username').eq('id', user.id).single(),
  ])

  if (!employerAuth?.user?.email || !employer || !applicant) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  try {
    await sendApplicationNotificationEmail({
      to: employerAuth.user.email,
      employerName: employer.full_name,
      jobTitle: job.title,
      applicantName: applicant.full_name,
      applicantUsername: applicant.username,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error enviando email de candidatura:', error)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}
