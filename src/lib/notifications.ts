import { createServiceClient } from '@/lib/supabase/service'
import { sendPushNotification } from '@/lib/webpush'

type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'connection_request'
  | 'connection_accepted'
  | 'job_application'

export async function createNotification({
  userId,
  type,
  actorId,
  entityId,
}: {
  userId: string
  type: NotificationType
  actorId: string
  entityId?: string
}) {
  if (userId === actorId) return

  const service = createServiceClient()

  await service.from('notifications').insert({
    user_id: userId,
    type,
    actor_id: actorId,
    entity_id: entityId ?? null,
  })

  const { data: subscriptions } = await service
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subscriptions?.length) return

  // Obtener nombre del actor
  const { data: actor } = await service
    .from('users')
    .select('full_name')
    .eq('id', actorId)
    .single()

  const actorName = actor?.full_name ?? 'Alguien'

  const PUSH_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
    connection_request:  { title: 'Nueva solicitud de conexión', body: `${actorName} quiere conectar contigo` },
    connection_accepted: { title: 'Conexión aceptada', body: `${actorName} ha aceptado tu solicitud` },
    like:                { title: 'Nuevo like', body: `A ${actorName} le gusta tu publicación` },
    comment:             { title: 'Nuevo comentario', body: `${actorName} ha comentado tu publicación` },
    follow:              { title: 'Nuevo seguidor', body: `${actorName} ha empezado a seguirte` },
    job_application:     { title: 'Nueva candidatura', body: `${actorName} ha aplicado a tu oferta` },
  }

  const message = PUSH_MESSAGES[type]
  await Promise.all(
    subscriptions.map((sub) =>
      sendPushNotification(sub, {
        title: message.title,
        body: message.body,
        url: '/connections',
      })
    )
  )
}