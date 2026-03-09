import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthContext = {
  userId: string;
  orgId: string | null;
  orgSlug: string | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    const meta = user.publicMetadata as {
      orgId?: string;
      orgSlug?: string;
    };

    return {
      userId,
      orgId: meta.orgId ?? null,
      orgSlug: meta.orgSlug ?? null,
    };
  } catch {
    // Clerk not configured — return null gracefully
    return null;
  }
}
