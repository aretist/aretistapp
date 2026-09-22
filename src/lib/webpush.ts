import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:aretistapp@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string }
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    )
  } catch (err: any) {
    // Si el endpoint ya no es válido (410), se puede borrar de la BD
    if (err.statusCode === 410) return { expired: true }
  }
}

export default webpush