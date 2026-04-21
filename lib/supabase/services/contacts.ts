import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface ContactRow {
  id: string;
  organization_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  job_title: string | null;
  department: string | null;
  is_decision_maker: boolean;
  avatar_url: string | null;
  source: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
    industry: string | null;
  };
}

export async function getContacts(search?: string) {
  let query = supabase
    .from("contacts")
    .select(`
      *,
      organization:organizations(id, name, industry)
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ContactRow[];
}

export async function getContactById(id: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select(`*, organization:organizations(id, name, industry, size)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ContactRow;
}

export async function createContact(input: {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  jobTitle?: string;
  organizationId?: string;
  isDecisionMaker?: boolean;
  source?: string;
}) {
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      job_title: input.jobTitle,
      organization_id: input.organizationId,
      is_decision_maker: input.isDecisionMaker || false,
      source: input.source,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateContact(
  id: string,
  updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsapp: string;
    jobTitle: string;
    isDecisionMaker: boolean;
    organizationId: string;
  }>
) {
  const mapped: Record<string, unknown> = {};
  if (updates.firstName !== undefined) mapped.first_name = updates.firstName;
  if (updates.lastName !== undefined) mapped.last_name = updates.lastName;
  if (updates.email !== undefined) mapped.email = updates.email;
  if (updates.phone !== undefined) mapped.phone = updates.phone;
  if (updates.whatsapp !== undefined) mapped.whatsapp = updates.whatsapp;
  if (updates.jobTitle !== undefined) mapped.job_title = updates.jobTitle;
  if (updates.isDecisionMaker !== undefined) mapped.is_decision_maker = updates.isDecisionMaker;
  if (updates.organizationId !== undefined) mapped.organization_id = updates.organizationId;

  const { data, error } = await supabase
    .from("contacts")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContact(id: string) {
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}
