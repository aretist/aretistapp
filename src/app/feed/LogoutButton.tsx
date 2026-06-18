'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '10px 16px',
        background: 'transparent',
        color: '#c00',
        border: '1px solid #c00',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      Cerrar sesión
    </button>
  )
}
