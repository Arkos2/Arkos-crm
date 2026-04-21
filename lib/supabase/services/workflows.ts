import { createClient } from "@/lib/supabase/client";
import { Workflow, WorkflowStatus } from "@/lib/types/settings";

const supabase = createClient();

export interface WorkflowRow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  status: string;
  execution_count: number;
  success_count: number;
  last_executed_at: string | null;
  last_error: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  created_by_profile?: { full_name: string };
}

function rowToWorkflow(row: WorkflowRow): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    trigger: row.trigger_type as Workflow["trigger"],
    triggerConfig: row.trigger_config,
    conditions: row.conditions as unknown as Workflow["conditions"],
    actions: row.actions as unknown as Workflow["actions"],
    status: row.status as WorkflowStatus,
    executionCount: row.execution_count,
    successCount: row.success_count,
    lastExecutedAt: row.last_executed_at || undefined,
    lastError: row.last_error || undefined,
    createdBy: row.created_by_profile?.full_name || row.created_by || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getWorkflows() {
  const { data, error } = await supabase
    .from("workflows")
    .select(`*, created_by_profile:profiles(full_name)`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as WorkflowRow[]).map(rowToWorkflow);
}

export async function createWorkflow(input: Partial<Workflow> & { createdBy: string }) {
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      name: input.name,
      description: input.description,
      trigger_type: input.trigger,
      trigger_config: input.triggerConfig || {},
      conditions: input.conditions || [],
      actions: input.actions || [],
      status: input.status || "draft",
      created_by: input.createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkflow(id: string, updates: Partial<Workflow>) {
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.trigger !== undefined) mapped.trigger_type = updates.trigger;
  if (updates.conditions !== undefined) mapped.conditions = updates.conditions;
  if (updates.actions !== undefined) mapped.actions = updates.actions;
  if (updates.status !== undefined) mapped.status = updates.status;

  const { data, error } = await supabase
    .from("workflows")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleWorkflow(id: string, currentStatus: WorkflowStatus) {
  const newStatus: WorkflowStatus =
    currentStatus === "active" ? "paused" : "active";

  return updateWorkflow(id, { status: newStatus });
}

export async function deleteWorkflow(id: string) {
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) throw error;
}

export async function logWorkflowExecution(
  id: string,
  success: boolean,
  error?: string
) {
  const { data: current } = await supabase
    .from("workflows")
    .select("execution_count, success_count")
    .eq("id", id)
    .single();

  if (!current) return;

  await supabase
    .from("workflows")
    .update({
      execution_count: (current.execution_count || 0) + 1,
      success_count: success
        ? (current.success_count || 0) + 1
        : (current.success_count || 0),
      last_executed_at: new Date().toISOString(),
      last_error: error || null,
    })
    .eq("id", id);
}
