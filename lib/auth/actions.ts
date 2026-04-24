"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  UpdatePasswordFormData,
} from "@/lib/types/auth";

// ─── LOGIN ───
export async function login(formData: LoginFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return {
      error: error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos"
        : "Erro ao fazer login. Tente novamente.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── REGISTER ───
export async function register(formData: RegisterFormData) {
  const supabase = await createClient();

  if (formData.password !== formData.confirmPassword) {
    return { error: "As senhas não coincidem" };
  }

  if (formData.password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        company_name: formData.companyName,
        phone: formData.phone,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado" };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // O perfil será criado automaticamente pela Trigger no Supabase (SQL)
  // Mas podemos garantir aqui também se necessário, ou apenas retornar sucesso.

  return {
    success: true,
    message: "Conta criada! Verifique seu e-mail para confirmar.",
    requiresVerification: !data.session,
  };
}

// ─── LOGOUT ───
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

// ─── RESET PASSWORD ───
export async function resetPassword(formData: ResetPasswordFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return { error: "Erro ao enviar e-mail. Verifique o endereço." };
  }

  return {
    success: true,
    message: "E-mail enviado! Verifique sua caixa de entrada.",
  };
}

// ─── UPDATE PASSWORD ───
export async function updatePassword(formData: UpdatePasswordFormData) {
  const supabase = await createClient();

  if (formData.password !== formData.confirmPassword) {
    return { error: "As senhas não coincidem" };
  }

  if (formData.password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres" };
  }

  const { error } = await supabase.auth.updateUser({
    password: formData.password,
  });

  if (error) {
    return { error: "Erro ao atualizar senha. Tente novamente." };
  }

  redirect("/dashboard");
}

// ─── GET CURRENT USER ───
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email!,
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
  };
}
