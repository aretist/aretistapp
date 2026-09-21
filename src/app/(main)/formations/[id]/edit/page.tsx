import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import EditFormationForm from './EditFormationForm'

export default async function EditFormationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: formation } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!formation) notFound()

  // Solo el creador puede editar
  if (formation.teacher_id !== user.id) redirect(`/formations/${id}`)

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link
        href={`/formations/${id}`}
        style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font)', fontWeight: 500 }}
      >
        ← Volver a la formación
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 20, marginBottom: 24, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
        Editar formación
      </h1>

      <EditFormationForm formation={formation} />
    </div>
  )
}
