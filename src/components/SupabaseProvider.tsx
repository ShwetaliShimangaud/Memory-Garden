'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Database } from '@/types/supabase' // Optional: auto-generated types

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabaseClient = createClientComponentClient<Database>()


  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  )
}
