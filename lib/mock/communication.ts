export type MessageChannel = "whatsapp" | "email";

export type ChatMessage = {
  id: string;
  sender: "agent" | "lead";
  content: string;
  timestamp: string;
  read: boolean;
};

export type ChatThread = {
  id: string;
  leadName: string;
  leadCompany: string;
  channel: MessageChannel;
  status: "open" | "action_required" | "waiting";
  messages: ChatMessage[];
  avatar?: string;
};

export const MOCK_THREADS: ChatThread[] = [
  {
    id: "thr-1",
    leadName: "Roberto Ferreira",
    leadCompany: "MedClínica Saúde",
    channel: "whatsapp",
    status: "action_required",
    messages: [
      { id: "m1", sender: "agent", content: "Olá Roberto, vi que a MedClínica expandiu recentemente. Como estão lidando com a gestão manual dos 3 consultórios?", timestamp: "09:30", read: true },
      { id: "m2", sender: "lead", content: "Está bem caótico. O WhatsApp não dá mais conta. Vocês conseguem integrar com nosso sistema atual?", timestamp: "09:45", read: true }
    ]
  },
  {
    id: "thr-2",
    leadName: "Fernanda Costa",
    leadCompany: "TechSolutions",
    channel: "email",
    status: "open",
    messages: [
      { id: "m3", sender: "agent", content: "Olá Fernanda, tudo bem? Baseado no seu download de ontem, elaborei um ROI estimado da ARKOS para operações B2B.", timestamp: "Ontem", read: true },
      { id: "m4", sender: "lead", content: "Obrigada! Vou analisar com a diretoria.", timestamp: "Ontem", read: true },
      { id: "m5", sender: "agent", content: "Perfeito. Sugiro focarem na redução do ciclo médio de vendas.", timestamp: "08:15", read: true }
    ]
  },
  {
    id: "thr-3",
    leadName: "Carlos Alcantara",
    leadCompany: "LogiMax",
    channel: "whatsapp",
    status: "waiting",
    messages: [
      { id: "m6", sender: "agent", content: "Carlos, o contrato foi enviado para seu e-mail.", timestamp: "11:20", read: false }
    ]
  }
];
