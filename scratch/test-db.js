import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing pipelines...");
  const { data: pData, error: pErr } = await supabase.from("pipelines").select("*");
  console.log("Pipelines:", pData, pErr);

  console.log("Testing deals...");
  const { data: dData, error: dErr } = await supabase.from("deals").select("*").limit(5);
  console.log("Deals:", dData, dErr);

  console.log("Testing columns of pipelines...");
  const { data: cols, error: errCols } = await supabase.rpc('get_schema');
  
  if (errCols) {
    const { data: q1 } = await supabase.from('deals').select().limit(1);
    console.log("Deals format:", q1);
    
    // Teste de inserts para ver erros
    const { error: eOrg } = await supabase.from('organizations').insert({ name: "Teste" }).select();
    console.log("Org insert error:", eOrg);

    const { error: eDeal } = await supabase.from('deals').insert({ title: "Teste" }).select();
    console.log("Deal insert error:", eDeal);
  }
}
test();
