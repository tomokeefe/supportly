import { cookies } from "next/headers";

export type AuthContext = {
  userId: string;
  orgId: string | null;
  orgSlug: string | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  // 1. Try Clerk auth first
  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      if (user) {
        const meta = user.publicMetadata as {
          orgId?: string;
          orgSlug?: string;
        };
        return {
          userId,
          orgId: meta.orgId ?? null,
          orgSlug: meta.orgSlug ?? null,
        };
      }
    }
  } catch {
    // Clerk not configured — fall through to cookie auth
  }

  // 2. Fallback: read org from cookie (set during onboarding)
  try {
    const cookieStore = await cookies();
    const orgId = cookieStore.get("resolvly_org_id")?.value ?? null;
    const orgSlug = cookieStore.get("resolvly_org_slug")?.value ?? null;

    if (orgId) {
      return {
        userId: "cookie-user",
        orgId,
        orgSlug,
      };
    }
  } catch {
    // cookies() not available in this context
  }

  return null;
}
