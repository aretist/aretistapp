import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { action, targetUserId, connectionId } = await request.json()

  // ENVIAR solicitud de conexión
  if (action === 'request') {
    if (!targetUserId || targetUserId === user.id) {
      return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 })
    }

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      addressee_id: targetUserId,
      status: 'pending',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notificar al destinatario
    await createNotification({
      userId: targetUserId,
      type: 'connection_request',
      actorId: user.id,
    })

    return NextResponse.json({ status: 'pending' })
  }

  // ACEPTAR solicitud
  if (action === 'accept') {
    // Obtener la conexión para saber quién la envió
    const { data: connection } = await supabase
      .from('connections')
      .select('requester_id')
      .eq('id', connectionId)
      .single()

    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .eq('addressee_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notificar al que envió la solicitud
    if (connection) {
      await createNotification({
        userId: connection.requester_id,
        type: 'connection_accepted',
        actorId: user.id,
      })
    }

    return NextResponse.json({ status: 'accepted' })
  }

  // RECHAZAR solicitud
  if (action === 'reject') {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
      .eq('addressee_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'rejected' })
  }

  // CANCELAR solicitud propia o eliminar conexión existente
  if (action === 'cancel') {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'cancelled' })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
