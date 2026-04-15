// Security audit logger — records sensitive actions (auth, privilege changes,
// bulk operations, AI generation). Failures are swallowed so logging never
// blocks the user-facing response.

interface AuditEntry {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  ip?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function logAudit(
  db: D1Database,
  entry: AuditEntry,
): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO audit_logs (id, actor_id, actor_role, action, target_type, target_id, ip, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        entry.actorId ?? null,
        entry.actorRole ?? null,
        entry.action,
        entry.targetType ?? null,
        entry.targetId ?? null,
        entry.ip ?? null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        new Date().toISOString(),
      )
      .run();
  } catch {
    /* never fail the request due to audit logging */
  }
}

export function clientIp(request: Request): string | null {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    null
  );
}
