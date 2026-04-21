"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types/auth";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile && !error) {
        setUser({
          id: userId,
          email: profile.email,
          fullName: profile.full_name,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
          role: profile.role,
          phone: profile.phone,
          department: profile.department,
          isActive: profile.is_active,
          companyName: profile.company_name,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      setSupabaseUser(sbUser);
      await fetchProfile(sbUser.id);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listener de mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      isLoading,
      isAuthenticated: !!user,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
