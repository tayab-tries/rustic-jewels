import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/admin/dashboard");
  const isLoginRoute = pathname === "/admin/login";

  // Check if credentials are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const isSupabaseConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("placeholder-change-me") &&
    !supabaseAnonKey.includes("placeholder-change-me");

  if (!isSupabaseConfigured) {
    // ---- DEMO / MOCK AUTHENTICATION ROUTING ----
    const mockSession = request.cookies.get("rustic_mock_admin_session")?.value;
    const isMockAuthenticated = mockSession === "authenticated";

    if (isDashboardRoute && !isMockAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (isLoginRoute && isMockAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // ---- REAL SUPABASE AUTHENTICATION ROUTING ----
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseClient = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request,
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (isDashboardRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
