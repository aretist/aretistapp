import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'
import ExperienceSection from './ExperienceSection'
import EducationSection from './EducationSection'
import PortfolioSection from './PortfolioSection'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: profile },
    { data: artistProfile },
    { data: experiences },
    { data: education },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('artist_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('experiences').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
    supabase.from('education').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
  ])

  if (!profile) {
    redirect('/onboarding')
  }

  const isArtistOrTeacher = profile.roles?.includes('artist') || profile.roles?.includes('teacher')

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>Mi perfil</h1>

      <ProfileForm profile={profile} userId={user.id} />

      {isArtistOrTeacher && (
        <PortfolioSection artistProfile={artistProfile} userId={user.id} />
      )}

      <ExperienceSection experiences={experiences ?? []} userId={user.id} />

      <EducationSection education={education ?? []} userId={user.id} />
    </div>
  )
}
