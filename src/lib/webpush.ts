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
    console.log('✅ Push enviado a:', subscription.endpoint.slice(0, 50))
  } catch (err: any) {
    console.error('❌ Error enviando push:', err.statusCode, err.message)
    if (err.statusCode === 410) return { expired: true }
  }
}

export default webpush