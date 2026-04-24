export type ProspectFlow = "inbound" | "outbound";

export type ProspectStatus =
  | "new"           // recém chegou
  | "enriching"     // agente enriquecendo dados
  | "enriched"      // dados completos
  | "scoring"       // calculando fit score
  | "scored"        // score calculado
  | "ready"         // pronto para abordagem
  | "contacted"     // já foi contatado
  | "converted"     // virou negócio no pipeline
  | "discarded";    // descartado

export type LeadSource =
  // INBOUND
  | "website_form"
  | "chatbot"
  | "whatsapp"
  | "email_reply"
  | "referral"
  | "social_media"
  | "event"
  // OUTBOUND
  | "prospector_ai"
  | "linkedin"
  | "cold_list"
  | "cnpj_search"
  | "manual";

export type CompanySize =
  | "micro"     // 1-9
  | "small"     // 10-49
  | "medium"    // 50-199
  | "large"     // 200-999
  | "enterprise"; // 1000+

// ─── ICP (IDEAL CUSTOMER PROFILE) ───
export interface ICPConfig {
  industries: string[];
  companySizes: CompanySize[];
  revenueMin?: number;
  revenueMax?: number;
  decisionRoles: string[];
  painPoints: string[];
  geographies: string[];
  excludeKeywords: string[];
  ticketMin?: number;
  ticketMax?: number;
}

// ─── DADOS ENRIQUECIDOS DA EMPRESA ───
export interface EnrichedCompany {
  name: string;
  cnpj?: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  employeeCount?: number;
  estimatedRevenue?: string;
  city?: string;
  state?: string;
  linkedinUrl?: string;
  description?: string;
  technologies?: string[];       // stack tech que usam
  recentNews?: string[];         // notícias recentes
  jobOpenings?: string[];        // vagas abertas (sinal de crescimento)
  socialSignals?: {
    linkedinFollowers?: number;
    hasActiveLinkedin?: boolean;
  };
}

// ─── CONTATO ENCONTRADO ───
export interface ProspectContact {
  firstName: string;
  lastName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  isDecisionMaker?: boolean;
  seniorityLevel?: "c_level" | "director" | "manager" | "analyst" | "other";
}

// ─── SINAL DE COMPRA ───
export interface BuyingSignal {
  type:
    | "hiring"           // contratando cargos relevantes
    | "funding"          // recebeu investimento
    | "expansion"        // abrindo nova unidade
    | "pain_mention"     // mencionou dor em público
    | "competitor_issue" // reclamou do concorrente
    | "technology_change"// mudando de tecnologia
    | "event_trigger";   // participou de evento relevante
  description: string;
  strength: "weak" | "medium" | "strong";
  detectedAt: string;
}

// ─── FIT SCORE ───
export interface FitScore {
  total: number;         // 0-100
  industry: number;      // 0-25
  size: number;          // 0-25
  role: number;          // 0-25
  signals: number;       // 0-25
  breakdown: string[];   // explicações
  recommendation: "high_priority" | "medium_priority" | "low_priority" | "discard";
  suggestedApproach?: string;
}

// ─── PROSPECT (LEAD PROSPECTADO) ───
export interface Prospect {
  id: string;
  flow: ProspectFlow;
  status: ProspectStatus;
  source: LeadSource;

  // Dados básicos (o que chegou)
  rawData: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    message?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    pageVisited?: string;
  };

  // Dados enriquecidos (o que o agente descobriu)
  company?: EnrichedCompany;
  contact?: ProspectContact;

  // Inteligência
  fitScore?: FitScore;
  buyingSignals?: BuyingSignal[];
  aiSummary?: string;
  suggestedMessage?: string;
  suggestedSequence?: string;

  // Atribuição
  assignedTo?: string;
  assignedToName?: string;

  // Timestamps
  receivedAt: string;
  enrichedAt?: string;
  scoredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── RESULTADO DE BUSCA OUTBOUND ───
export interface OutboundSearchResult {
  query: OutboundSearchQuery;
  prospects: Prospect[];
  totalFound: number;
  searchedAt: string;
  tokensUsed?: number;
}

// ─── QUERY DE BUSCA OUTBOUND ───
export interface OutboundSearchQuery {
  industries: string[];
  sizes: CompanySize[];
  roles: string[];
  locations: string[];
  painPoints?: string[];
  keywords?: string[];
  limit?: number;
  nicheDescription?: string;
  icpDetails?: string;
}

// ─── ESTATÍSTicas DO PROSPECTOR ───
export interface ProspectorStats {
  inbound: {
    today: number;
    week: number;
    avgFitScore: number;
    conversionRate: number;
    topSource: string;
  };
  outbound: {
    searchesToday: number;
    prospectsFound: number;
    avgFitScore: number;
    contactRate: number;
  };
  total: {
    inQueue: number;
    enriched: number;
    converted: number;
    discarded: number;
  };
}
