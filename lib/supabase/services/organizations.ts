import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface OrganizationRow {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export async function getOrganizations(search?: string) {
  let query = supabase
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as OrganizationRow[];
}

export async function createOrganization(input: {
  name: string;
  industry?: string;
  size?: string;
  website?: string;
}) {
  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
      industry: input.industry,
      size: input.size,
      website: input.website,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrganizationRow;
}

export async function findOrCreateOrganization(input: {
  name: string;
  industry?: string;
  size?: string;
  website?: string;
}) {
  // Tentar encontrar por nome (aproximado ou exato)
  const { data: existing } = await supabase
    .from("organizations")
    .select("*")
    .ilike("name", input.name)
    .maybeSingle();

  if (existing) return existing as OrganizationRow;

  return createOrganization(input);
}
