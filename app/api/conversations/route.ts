import { NextResponse } from 'next/server';
import { getConversations } from '@/lib/supabase/services/conversations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conversations = await getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erro na API de conversas:', error);
    return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 });
  }
}
