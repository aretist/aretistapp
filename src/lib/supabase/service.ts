import { createClient } from '@supabase/supabase-js'

// Este cliente bypasea RLS completamente.
// SOLO usar en rutas de servidor protegidas por verificación de is_admin.
// NUNCA exponer en el cliente (browser).
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
