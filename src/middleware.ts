import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/admin');
  const isLoginRoute = req.nextUrl.pathname.startsWith('/admin/login');

  if ((isAdminRoute || isApiAdminRoute) && !isLoginRoute && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
