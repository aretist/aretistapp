import { createServiceClient } from '@/lib/supabase/service'

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
  // No crear notificación si el actor es el mismo usuario
  if (userId === actorId) return

  const service = createServiceClient()

  await service.from('notifications').insert({
    user_id: userId,
    type,
    actor_id: actorId,
    entity_id: entityId ?? null,
  })
}
