import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/forget-password', '/verify-otp', '/reset-password'];
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    const token =
        request.cookies.get('accessToken')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
    const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path));
    const isRootPath = pathname === '/';

    // Root: authenticated → dashboard, guest → landing
    if (isRootPath) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Auth pages (login/register): authenticated → dashboard, guest → allow
    if (isAuthPath) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Public pages (forgot-password, verify-otp, reset-password): always allow
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Everything else is protected: no token → login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the intended destination so you can redirect back after login
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.ico$).*)',
    ],
};