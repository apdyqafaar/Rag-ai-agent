import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

    // THIS IS NOT SECURE!
    // This is the recommended approach to optimistically redirect users
    // We recommend handling auth checks in each page/route
    const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    if(isAuthRoute && sessionCookie){
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
	if (!sessionCookie && isDashboard) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/auth/:path*","/dashboard/:path*"], // Specify the routes the middleware applies to
};