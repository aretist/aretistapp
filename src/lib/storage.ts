import { createClient } from '@/lib/supabase/client'

export async function uploadFile(
  bucket: 'avatars' | 'portfolio' | 'posts-media' | 'formation-covers',
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(`Error al subir el archivo: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}

export function validateFile(
  file: File,
  type: 'image' | 'video',
  maxSizeMB: number
): string | null {
  const maxBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxBytes) {
    return `El archivo supera el tamaño máximo de ${maxSizeMB}MB`
  }

  if (type === 'image' && !file.type.startsWith('image/')) {
    return 'El archivo debe ser una imagen'
  }

  if (type === 'video' && !file.type.startsWith('video/')) {
    return 'El archivo debe ser un vídeo'
  }

  return null
}
