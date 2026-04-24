export type AIProvider = "gemini" | "anthropic";

export interface AIConfig {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
