/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de produção
  compress: true,
  poweredByHeader: false,

  // Imagens externas permitidas
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // Ignorar erros de TypeScript no build (apenas se necessário, recomendado false)
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint no build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
