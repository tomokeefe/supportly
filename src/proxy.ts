import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/onboarding"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // Only invoke Clerk for protected routes
  if (isProtected && process.env.CLERK_SECRET_KEY) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import(
        "@clerk/nextjs/server"
      );
      const isProtectedRoute = createRouteMatcher([
        "/dashboard(.*)",
        "/onboarding(.*)",
      ]);
      const handler = clerkMiddleware(async (auth, request) => {
        if (isProtectedRoute(request)) {
          await auth.protect();
        }
      });
      return handler(req, {} as never);
    } catch (e) {
      console.error("Clerk middleware error:", e);
      // If Clerk fails, let the request through
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
