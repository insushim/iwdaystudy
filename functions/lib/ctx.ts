// Typed accessors for values the middleware puts on `context.data`.
// Pages Functions hand each handler its own context object, so middleware state
// must travel through `data` — never by mutating `context` itself.

export interface AuthData extends Record<string, unknown> {
  userId?: string;
  userEmail?: string | null;
  cronAuthenticated?: boolean;
}

export function authUserId(data: unknown): string | undefined {
  const v = (data as AuthData | undefined)?.userId;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function authUserEmail(data: unknown): string | undefined {
  const v = (data as AuthData | undefined)?.userEmail;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function isCronAuthenticated(data: unknown): boolean {
  return (data as AuthData | undefined)?.cronAuthenticated === true;
}
