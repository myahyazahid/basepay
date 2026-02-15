import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

interface MonthlyCashflow {
  inflow: number
  outflow: number
}

export const useMonthlyCashflow = (walletAddress: string | undefined) => {
  const [cashflow, setCashflow] = useState<MonthlyCashflow>({ inflow: 0, outflow: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false)
      return
    }

    const fetchMonthlyCashflow = async () => {
      try {
        setLoading(true)

        // Get user_id
        const { data: userData } = await supabase
          .from('user')
          .select('id_user')
          .eq('wallet', walletAddress.toLowerCase())
          .single()

        if (!userData) {
          setCashflow({ inflow: 0, outflow: 0 })
          setLoading(false)
          return
        }

        // Get current month range
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

        // Fetch transactions for current month
        const { data: transactions } = await supabase
          .from('transactions')
          .select('direction, amount, currency')
          .eq('id_user', userData.id_user)
          .eq('status', 'success')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)

        if (!transactions) {
          setCashflow({ inflow: 0, outflow: 0 })
          setLoading(false)
          return
        }

        // Calculate inflow and outflow (assume USDC)
        const inflow = transactions
          .filter(tx => tx.direction === 'inflow')
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

        const outflow = transactions
          .filter(tx => tx.direction === 'outflow')
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

        setCashflow({ inflow, outflow })
      } catch (err) {
        console.error('Error fetching monthly cashflow:', err)
        setCashflow({ inflow: 0, outflow: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyCashflow()
  }, [walletAddress])

  return { cashflow, loading }
}