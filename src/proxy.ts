import { NextResponse } from "next/server";

// Clerk auth is handled client-side via ClerkProvider + useAuth().
// The proxy just passes requests through.
// Protected route redirection happens in the dashboard layout.
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
