import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis de ambiente do Supabase");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDB() {
  console.log("🧹 Iniciando limpeza do banco de dados...");
  
  // Tabelas a serem limpas na ordem correta para evitar violações de chave estrangeira
  const tables = [
    "activities",
    "messages",
    "deals",
    "contacts",
    "organizations",
    "leads",
    "notifications",
    "goals",
    "user_points",
    "pipeline_stages",
    "pipelines"
  ];

  for (const table of tables) {
    console.log(`Apagando dados de ${table}...`);
    // Passando o filtro neq("id", "xyz") como bypass para apagar tudo
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.warn(`Erro ao limpar ${table}:`, error.message);
    } else {
      console.log(`✅ ${table} limpa.`);
    }
  }

  console.log("✨ Limpeza concluída!");
}

cleanDB();
