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

  // Obtener datos del empleo y del empleador
  const { data: job } = await supabase
    .from('jobs')
    .select('title, employer_id')
    .eq('id', jobId)
    .single()

  if (!job) {
    return NextResponse.json({ error: 'Empleo no encontrado' }, { status: 404 })
  }

  // Obtener datos del empleador (email + nombre)
  const { data: employerAuth } = await supabase.auth.admin.getUserById(job.employer_id)
  const { data: employer } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', job.employer_id)
    .single()

  // Obtener datos del candidato
  const { data: applicant } = await supabase
    .from('users')
    .select('full_name, username')
    .eq('id', user.id)
    .single()

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
