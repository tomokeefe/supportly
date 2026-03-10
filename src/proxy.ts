import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isReferralRoute = createRouteMatcher(["/", "/sign-up(.*)", "/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // ── Affiliate referral tracking ──
  // When someone visits with ?ref=CODE, set a 90-day attribution cookie
  if (isReferralRoute(req)) {
    const ref = req.nextUrl.searchParams.get("ref");
    if (ref && /^[a-z0-9-]{3,50}$/i.test(ref)) {
      const existing = req.cookies.get("resolvly_ref")?.value;
      if (!existing) {
        const url = req.nextUrl.clone();
        url.searchParams.delete("ref");
        const res = NextResponse.redirect(url);
        res.cookies.set("resolvly_ref", ref, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 90, // 90 days
          path: "/",
        });
        return res;
      }
    }
  }

  const { userId } = await auth();

  // Signed-in users hitting sign-in/sign-up → redirect to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protected routes require auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
