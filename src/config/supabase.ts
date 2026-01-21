import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const supabaseUrl = 'https://zyvphtqwraoksmuphzdq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dnBodHF3cmFva3NtdXBoemRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzIxMTUsImV4cCI6MjA4NDQwODExNX0.qIJbx8qkjDIRMc5NeR8ct-hCn3SkWY4KNvvrc7gnGdQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types berdasarkan schema database kamu
export interface Transaction {
  id: string
  id_user: string
  type: string
  direction: 'inflow' | 'outflow'
  amount: number
  currency: string
  from_wallet: string
  to_wallet: string
  from_name: string | null
  to_name: string | null
  note: string | null
  tx_hash: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface User {
  id_user: string
  wallet: string
  username: string | null
  avatar: string | null
  email: string | null
  created_at: string
}

export interface BasepayName {
  id: string
  id_user: string
  name: string
  is_primary: boolean
  is_active: boolean
  created_at: string
}