import { supabase } from '../config/supabase'

export const ensureUserExists = async (walletAddress: string): Promise<boolean> => {
  try {
    const normalizedAddress = walletAddress.toLowerCase()

    // 1. Cek apakah user sudah ada
    const { data: existingUser } = await supabase
      .from('user')
      .select('id_user, wallet')
      .eq('wallet', normalizedAddress)
      .single()

    // Kalau user sudah ada, return true
    if (existingUser) {
      console.log('✅ User already exists:', existingUser)
      return true
    }

    // 2. Kalau user belum ada, insert user baru
    console.log('🆕 Creating new user for wallet:', normalizedAddress)
    
    const { data: newUser, error: insertError } = await supabase
      .from('user')
      .insert([
        {
          wallet: normalizedAddress,
          username: null, // Bisa diisi nanti di profile
          avatar: null,
          email: null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating user:', insertError)
      return false
    }

    console.log('✅ New user created:', newUser)
    return true

  } catch (error) {
    console.error('❌ Error in ensureUserExists:', error)
    return false
  }
}