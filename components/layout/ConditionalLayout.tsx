"use client";

import { usePathname } from "next/navigation";
import { MainLayout } from "./MainLayout";

// Rotas que NÃO usam o layout com Sidebar/Header (tela cheia)
const publicRoutes = ["/login", "/signup", "/"];

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
