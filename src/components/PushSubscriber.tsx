'use client'

import { useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function PushSubscriber() {
  const { permission, requestAndSubscribe } = usePushNotifications()

  useEffect(() => {
    if (permission === 'granted') {
      // Ya tiene permiso — suscribir silenciosamente
      requestAndSubscribe()
    }
    // Si es 'default' no pedimos permiso automáticamente,
    // lo pediremos desde un botón en la UI
  }, [])

  return null
}