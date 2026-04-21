import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ARKOS CRM",
    template: "%s | ARKOS CRM",
  },
  description: "CRM Enterprise com Agentes de IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#13151b",
              border: "1px solid #1e2433",
              color: "#F0F2F5",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
