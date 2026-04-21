import { NextResponse } from "next/server";
import { checkAccountStatus } from "@/lib/whatsapp";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const status = await checkAccountStatus();

    return NextResponse.json({
      whatsapp: status,
      config: {
        hasAccessToken: !!process.env.META_ACCESS_TOKEN,
        hasPhoneNumberId: !!process.env.WABA_PHONE_NUMBER_ID,
        hasWebhookToken: !!process.env.META_WEBHOOK_VERIFY_TOKEN,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao verificar status", details: String(error) },
      { status: 500 }
    );
  }
}
