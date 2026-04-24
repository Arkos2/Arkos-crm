import { createClient } from "@/lib/supabase/client";
import { Deal, DealStage } from "@/lib/types/deal";

const supabase = createClient();

// ─── TIPOS DO BANCO ───
export interface DealRow {
  id: string;
  title: string;
  pipeline_id: string;
  stage: string;
  contact_id: string | null;
  organization_id: string | null;
  owner_id: string;
  value: number;
  currency: string;
  probability: number;
  expected_close_date: string | null;
  bant_budget: number;
  bant_authority: number;
  bant_need: number;
  bant_timeline: number;
  bant_total: number;
  current_state: string | null;
  desired_state: string | null;
  gap_level: string | null;
  urgency: number;
  status: string;
  temperature: string;
  lost_reason: string | null;
  ai_score: number | null;
  ai_suggestions: any[];
  last_activity_at: string | null;
  stage_entered_at: string;
  won_at: string | null;
  lost_at: string | null;
  created_at: string;
  updated_at: string;
  // joins
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    job_title: string | null;
    is_decision_maker: boolean;
    avatar_url: string | null;
  };
  organization?: {
    id: string;
    name: string;
    industry: string | null;
    size: string | null;
    website: string | null;
  };
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

// ─── CONVERTER LINHA DO BANCO → TIPO DO FRONTEND ───
export function rowToDeal(row: DealRow): Deal {
  return {
    id: row.id,
    title: row.title,
    pipelineId: row.pipeline_id,
    stage: row.stage as DealStage,
    contact: row.contact
      ? {
          id: row.contact.id,
          firstName: row.contact.first_name,
          lastName: row.contact.last_name || "",
          email: row.contact.email || undefined,
          phone: row.contact.phone || undefined,
          whatsapp: row.contact.whatsapp || undefined,
          jobTitle: row.contact.job_title || undefined,
          isDecisionMaker: row.contact.is_decision_maker,
          avatarUrl: row.contact.avatar_url || undefined,
        }
      : {
          id: "unknown",
          firstName: "Sem",
          lastName: "Contato",
        },
    organization: row.organization
      ? {
          id: row.organization.id,
          name: row.organization.name,
          industry: row.organization.industry || undefined,
          size: row.organization.size || undefined,
          website: row.organization.website || undefined,
        }
      : {
          id: "unknown",
          name: "Sem Empresa",
        },
    ownerId: row.owner_id,
    ownerName: row.owner?.full_name || "Sem responsável",
    ownerAvatar: row.owner?.avatar_url || undefined,
    value: row.value,
    currency: row.currency,
    probability: row.probability,
    expectedCloseDate: row.expected_close_date || undefined,
    bant: {
      budget: row.bant_budget,
      authority: row.bant_authority,
      need: row.bant_need,
      timeline: row.bant_timeline,
      total: row.bant_total,
    },
    gap: {
      currentState: row.current_state || "",
      desiredState: row.desired_state || "",
      gapLevel: (row.gap_level as "low" | "medium" | "high") || "low",
      urgency: row.urgency,
    },
    status: row.status as "active" | "won" | "lost",
    temperature: row.temperature as "hot" | "warm" | "cold" | "rotting",
    lostReason: row.lost_reason || undefined,
    aiScore: row.ai_score || undefined,
    aiSuggestions: (row.ai_suggestions || []) as Deal["aiSuggestions"],
    activities: [],
    documents: [],
    tasks: [],
    lastActivityAt: row.last_activity_at || undefined,
    stageEnteredAt: row.stage_entered_at,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    wonAt: row.won_at || undefined,
    lostAt: row.lost_at || undefined,
    isRotting: row.temperature === "rotting",
  };
}

// ─── GET ALL DEALS ───
export async function getDeals(filters?: {
  status?: string;
  ownerId?: string;
  stage?: string;
  pipelineId?: string;
}) {
  let query = supabase
    .from("deals")
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone,
                       whatsapp, job_title, is_decision_maker, avatar_url),
      organization:organizations(id, name, industry, size, website),
      owner:profiles(id, full_name, avatar_url)
    `)
    .order("updated_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters?.stage) query = query.eq("stage", filters.stage);
  if (filters?.pipelineId) query = query.eq("pipeline_id", filters.pipelineId);

  const { data, error } = await query;
  if (error) throw error;
  return (data as DealRow[]).map(rowToDeal);
}

// ─── GET DEAL BY ID ───
export async function getDealById(id: string) {
  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      contact:contacts(id, first_name, last_name, email, phone,
                       whatsapp, job_title, is_decision_maker, avatar_url),
      organization:organizations(id, name, industry, size, website),
      owner:profiles(id, full_name, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return rowToDeal(data as DealRow);
}

// ─── CREATE DEAL ───
export async function createDeal(input: {
  title: string;
  pipelineId: string;
  stage?: DealStage;
  contactId?: string;
  organizationId?: string;
  ownerId: string;
  value?: number;
  expectedCloseDate?: string;
}) {
  const { data, error } = await supabase
    .from("deals")
    .insert({
      title: input.title,
      pipeline_id: input.pipelineId,
      stage: input.stage || "prospecting",
      contact_id: input.contactId,
      organization_id: input.organizationId,
      owner_id: input.ownerId,
      value: input.value || 0,
      expected_close_date: input.expectedCloseDate,
      stage_entered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── UPDATE DEAL STAGE ───
export async function updateDealStage(id: string, stage: DealStage) {
  const { data, error } = await supabase
    .from("deals")
    .update({
      stage,
      stage_entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── UPDATE DEAL ───
export async function updateDeal(
  id: string,
  updates: Partial<{
    title: string;
    value: number;
    probability: number;
    expectedCloseDate: string;
    status: string;
    temperature: string;
    lostReason: string;
    bantBudget: number;
    bantAuthority: number;
    bantNeed: number;
    bantTimeline: number;
    currentState: string;
    desiredState: string;
    gapLevel: string;
    urgency: number;
    aiScore: number;
  }>
) {
  const mapped: Record<string, unknown> = {};
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.value !== undefined) mapped.value = updates.value;
  if (updates.probability !== undefined) mapped.probability = updates.probability;
  if (updates.expectedCloseDate !== undefined) mapped.expected_close_date = updates.expectedCloseDate;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.temperature !== undefined) mapped.temperature = updates.temperature;
  if (updates.lostReason !== undefined) mapped.lost_reason = updates.lostReason;
  if (updates.bantBudget !== undefined) mapped.bant_budget = updates.bantBudget;
  if (updates.bantAuthority !== undefined) mapped.bant_authority = updates.bantAuthority;
  if (updates.bantNeed !== undefined) mapped.bant_need = updates.bantNeed;
  if (updates.bantTimeline !== undefined) mapped.bant_timeline = updates.bantTimeline;
  if (updates.currentState !== undefined) mapped.current_state = updates.currentState;
  if (updates.desiredState !== undefined) mapped.desired_state = updates.desiredState;
  if (updates.gapLevel !== undefined) mapped.gap_level = updates.gapLevel;
  if (updates.urgency !== undefined) mapped.urgency = updates.urgency;
  if (updates.aiScore !== undefined) mapped.ai_score = updates.aiScore;

  const { data, error } = await supabase
    .from("deals")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── DELETE DEAL ───
export async function deleteDeal(id: string) {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
}

// ─── PIPELINE STATS ───
export async function getPipelineStats() {
  const { data, error } = await supabase
    .from("pipeline_summary")
    .select("*");

  if (error) throw error;
  return data;
}

// ─── REALTIME SUBSCRIPTION ───
export function subscribeToDeals(
  callback: (deal: DealRow, event: "INSERT" | "UPDATE" | "DELETE") => void
) {
  return supabase
    .channel("deals-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "deals" },
      (payload: any) => {
        callback(
          payload.new as DealRow,
          payload.eventType as "INSERT" | "UPDATE" | "DELETE"
        );
      }
    )
    .subscribe();
}
