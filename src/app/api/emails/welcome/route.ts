import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/resend/emails'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Obtener datos del usuario desde la sesión, nunca del body
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, username')
    .eq('id', user.id)
    .single()

  if (!profile || !user.email) {
    return NextResponse.json({ error: 'Datos de usuario incompletos' }, { status: 400 })
  }

  try {
    await sendWelcomeEmail({
      to: user.email,
      fullName: profile.full_name,
      username: profile.username,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}
