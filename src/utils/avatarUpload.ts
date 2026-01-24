import { supabase } from '../config/supabase'

export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image (JPG, PNG, WEBP, or GIF)')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Replace if exists
      })

    if (error) throw error

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrlData.publicUrl

  } catch (error: any) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

export const deleteAvatar = async (avatarUrl: string): Promise<boolean> => {
  try {
    // Extract filename from URL
    const fileName = avatarUrl.split('/').pop()
    if (!fileName) return false

    const { error } = await supabase.storage
      .from('avatars')
      .remove([fileName])

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return false
  }
}