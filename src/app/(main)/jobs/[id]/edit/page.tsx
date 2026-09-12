import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EditJobForm from './EditJobForm'

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .in('status', ['published', 'pending'])
    .maybeSingle()

  if (!job) notFound()

  // Solo el creador puede editar
  if (job.employer_id !== user.id) redirect(`/jobs/${id}`)

  return <EditJobForm job={job} />
}
