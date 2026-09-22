import { createServiceClient } from '@/lib/supabase/service'
import { sendPushNotification } from '@/lib/webpush'

type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'connection_request'
  | 'connection_accepted'
  | 'job_application'

const PUSH_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
  connection_request:  { title: 'Nueva solicitud de conexión', body: 'Alguien quiere conectar contigo en Aretist' },
  connection_accepted: { title: 'Conexión aceptada', body: 'Han aceptado tu solicitud de conexión' },
  like:                { title: 'Te han dado un like', body: 'A alguien le gusta tu publicación' },
  comment:             { title: 'Nuevo comentario', body: 'Alguien ha comentado tu publicación' },
  follow:              { title: 'Nuevo seguidor', body: 'Alguien ha empezado a seguirte' },
  job_application:     { title: 'Nueva candidatura', body: 'Alguien ha aplicado a tu oferta de empleo' },
}

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

  // Enviar push notification si el usuario tiene suscripciones activas
  const { data: subscriptions } = await service
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subscriptions?.length) return

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