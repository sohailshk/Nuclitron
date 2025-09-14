import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// List of allowed admin emails (move to environment variables in production)
const ADMIN_EMAILS = [
  'naitikmehta114@gmail.com',
  // Add more admin emails here
];

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(['/']);

// This example protects all routes including api/trpc routes
export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const userEmail = sessionClaims?.email as string | undefined;
  const isPublicRouteMatch = isPublicRoute(req);
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isProtectedRoute = [
    '/dashboard(.*)',
    '/explorer(.*)',
    
  ].some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)));

  // Handle public routes
  if (isPublicRouteMatch) {
    return NextResponse.next();
  }

    // Handle home page redirection for authenticated users
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Handle admin route access
  if (isAdminRoute) {
    if (!userId) {
      // If user tries to access admin route but is not signed in
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Ensure userEmail exists and is in the allowed admin list
    if (!userEmail || !ADMIN_EMAILS.some(email => email.toLowerCase() === userEmail.toLowerCase())) {
      // Redirect to unauthorized page or dashboard if not authorized
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Handle other protected routes
  if (isProtectedRoute && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow the request to continue if all checks pass
  return NextResponse.next();
},
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};