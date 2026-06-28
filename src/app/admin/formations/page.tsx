import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import AdminFormationActions from './AdminFormationActions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AdminFormationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/feed')

  const service = createServiceClient()

  const { data: pendingFormations } = await service
    .from('formations')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: publishedFormations } = await service
    .from('formations')
    .select('*')
    .in('status', ['published', 'full'])
    .order('start_date', { ascending: true })
    .limit(20)

  // Traer profesores por separado
  const allFormations = [...(pendingFormations ?? []), ...(publishedFormations ?? [])]
  const teacherIds = [...new Set(allFormations.map((f) => f.teacher_id))]

  const { data: teachers } = teacherIds.length
    ? await service.from('users').select('id, full_name').in('id', teacherIds)
    : { data: [] }

  const teacherMap = new Map(teachers?.map((t) => [t.id, t]))

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>🛡️ Admin — Formaciones</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>
        Revisa y modera las formaciones antes de publicarlas.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Pendientes de revisión {pendingFormations?.length ? `(${pendingFormations.length})` : ''}
        </h2>

        {!pendingFormations?.length && (
          <p style={{ fontSize: 13, color: '#999' }}>No hay formaciones pendientes</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingFormations?.map((f: any) => (
            <div key={f.id} style={{ border: '1px solid #FAEEDA', borderRadius: 10, padding: 16, background: '#FFFDF7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{f.title}</p>
                  <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                    {teacherMap.get(f.teacher_id)?.full_name ?? 'Profesor'}
                  </p>
                  <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    📍 {f.city} · 📅 {format(new Date(f.start_date), "d MMM yyyy", { locale: es })} · {f.price === 0 ? 'Gratis' : `${f.price}€`} · {f.capacity} plazas
                  </p>
                  <p style={{ fontSize: 13, color: '#444', marginTop: 8, lineHeight: 1.5 }}>
                    {f.description.length > 150 ? f.description.slice(0, 150) + '...' : f.description}
                  </p>
                </div>
                <AdminFormationActions formationId={f.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Publicadas {publishedFormations?.length ? `(${publishedFormations.length})` : ''}
        </h2>

        {!publishedFormations?.length && (
          <p style={{ fontSize: 13, color: '#999' }}>No hay formaciones publicadas</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {publishedFormations?.map((f: any) => (
            <div key={f.id} style={{ border: '1px solid #E1F5EE', borderRadius: 10, padding: 14, background: '#F8FFFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: '#666' }}>
                    {teacherMap.get(f.teacher_id)?.full_name ?? 'Profesor'} · {f.city} · {f.spots_left}/{f.capacity} plazas
                  </p>
                </div>
                <AdminFormationActions formationId={f.id} currentStatus={f.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
