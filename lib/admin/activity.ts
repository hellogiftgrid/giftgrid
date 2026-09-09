import { createAdminClient } from "@/lib/supabase/admin";

export async function logActivity({
  actorId,
  action,
  entityType,
  entityId,
  metadata = {},
}: {
  actorId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  await supabase.from("activity_logs").insert({
    actor_id: actorId || null,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    metadata,
  });
}
