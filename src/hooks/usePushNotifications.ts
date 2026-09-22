'use client'

import { useState, useEffect } from 'react'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      setSubscribed(true)
      return
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    const { endpoint, keys } = sub.toJSON() as any

    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
    })

    setPermission('granted')
    setSubscribed(true)
  }

  async function requestAndSubscribe() {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') await subscribe()
  }

  return { permission, subscribed, requestAndSubscribe }
}