import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const clerkConfigured = !!process.env.CLERK_SECRET_KEY;

async function clerkAuth(req: NextRequest) {
  const { clerkMiddleware, createRouteMatcher } = await import(
    "@clerk/nextjs/server"
  );

  const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/onboarding(.*)",
  ]);

  return clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  })(req, {} as never);
}

export default async function middleware(req: NextRequest) {
  if (!clerkConfigured) {
    return NextResponse.next();
  }
  return clerkAuth(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
