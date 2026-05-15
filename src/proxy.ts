import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/email-verification(.*)',
])

const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export default proxy

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}