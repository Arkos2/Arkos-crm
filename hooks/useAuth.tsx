"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types/auth";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  isLoading: boolean;
  loading: boolean; // Alias for compatibility with legacy AuthContext
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isLoading: true,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const mapUserFromMetadata = useCallback((sbUser: User): UserProfile => {
    return {
      id: sbUser.id,
      email: sbUser.email || "",
      fullName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || "Administrador",
      name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || "Administrador",
      firstName: (sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || "Administrador").split(" ")[0],
      lastName: "",
      role: sbUser.user_metadata?.role || "admin",
      isActive: true,
      createdAt: sbUser.created_at,
      updatedAt: sbUser.updated_at || sbUser.created_at,
    };
  }, []);

  const fetchProfile = useCallback(async (userId: string, sbUser?: User) => {
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
          name: profile.full_name, // Alias
          firstName: profile.first_name || profile.full_name.split(" ")[0],
          lastName: profile.last_name || "",
          avatarUrl: profile.avatar_url,
          role: profile.role,
          phone: profile.phone,
          department: profile.department,
          isActive: profile.is_active,
          companyName: profile.company_name,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        });
      } else if (sbUser) {
        // Fallback para metadata se não encontrar perfil na tabela
        setUser(mapUserFromMetadata(sbUser));
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      if (sbUser) {
        setUser(mapUserFromMetadata(sbUser));
      }
    }
  }, [supabase, mapUserFromMetadata]);

  const refreshUser = useCallback(async () => {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      setSupabaseUser(sbUser);
      await fetchProfile(sbUser.id, sbUser);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchProfile(session.user.id, session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listener de mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchProfile(session.user.id, session.user);
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
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      // Forçar reload para garantir que todos os estados sejam limpos e cookies removidos
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      // Fallback para garantir redirecionamento mesmo se o signOut falhar
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      isLoading,
      loading: isLoading,
      isAuthenticated: !!supabaseUser,
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
