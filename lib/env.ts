// Valida que todas as variáveis obrigatórias estão definidas
function getEnvVar(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `❌ Variável de ambiente obrigatória não definida: ${key}\n` +
        `Configure esta variável no seu painel do Vercel.`
      );
    }
    console.warn(`⚠️ Variável de ambiente não definida: ${key}`);
    return "";
  }

  return value || "";
}

export const env = {
  // Supabase
  supabaseUrl: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", false),

  // Anthropic
  anthropicApiKey: getEnvVar("ANTHROPIC_API_KEY", false),

  // App
  appUrl: getEnvVar("NEXT_PUBLIC_APP_URL"),
  appName: getEnvVar("NEXT_PUBLIC_APP_NAME"),

  // Ambiente
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;
