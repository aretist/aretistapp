import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend/emails'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { email, fullName, username } = await request.json()

  if (!email || !fullName || !username) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  try {
    await sendWelcomeEmail({ to: email, fullName, username })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}
