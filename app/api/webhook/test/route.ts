import { NextRequest, NextResponse } from "next/server";
import { sendTextMessage } from "@/lib/whatsapp";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: "phone e message são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await sendTextMessage(phone, message);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao realizar teste", details: String(error) },
      { status: 500 }
    );
  }
}
