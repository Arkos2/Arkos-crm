'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Busca a sessão atual assim que o app carrega
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        mapUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    getSession()

    // Escuta mudanças de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          mapUser(session.user)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  function mapUser(supabaseUser: User) {
    // Puxa o nome e o cargo injetados no processo de sign up do metadata nativo
    const name = supabaseUser.user_metadata?.name || 'Administrador'
    const role = supabaseUser.user_metadata?.role || 'CEO / Diretor Executivo'

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name,
      role
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
