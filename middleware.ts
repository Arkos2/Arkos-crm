import { type NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico
     * - arquivos de mídia
     * - api/webhook (webhook público do WhatsApp)
     * - api/health (health check público)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhook|api/health).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas — deixar passar
  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/portal",
    "/auth/callback",
  ];

  const isPublic = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Verificar cookie de sessão do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(
    /https:\/\/([^.]+)\.supabase\.co/
  )?.[1];

  // Cookies possíveis do Supabase
  const cookieNames = projectRef
    ? [
        `sb-${projectRef}-auth-token`,
        `sb-${projectRef}-auth-token.0`,
        `sb-${projectRef}-auth-token.1`,
      ]
    : [];

  const hasSession =
    cookieNames.some((name) => request.cookies.has(name)) ||
    request.cookies.has("sb-access-token") ||
    request.cookies.has("supabase-auth-token");

  // Sem sessão → redirecionar para login
  if (!hasSession && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Com sessão tentando acessar login → redirecionar para dashboard
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
