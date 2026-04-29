import axios from "axios";

// ─── TIPOS ───
export interface WhatsAppTextMessage {
  type: "text";
  to: string;
  body: string;
  previewUrl?: boolean;
}

export interface WhatsAppTemplateMessage {
  type: "template";
  to: string;
  templateName: string;
  languageCode: string;
  components?: TemplateComponent[];
}

export interface WhatsAppInteractiveMessage {
  type: "interactive";
  to: string;
  interactiveType: "button" | "list";
  body: string;
  buttons?: Array<{ id: string; title: string }>;
  sections?: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}

export interface WhatsAppMediaMessage {
  type: "image" | "document" | "audio";
  to: string;
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export type WhatsAppMessage =
  | WhatsAppTextMessage
  | WhatsAppTemplateMessage
  | WhatsAppInteractiveMessage
  | WhatsAppMediaMessage;

interface TemplateComponent {
  type: "header" | "body" | "button";
  parameters: Array<{
    type: "text" | "image" | "document";
    text?: string;
    image?: { link: string };
  }>;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

// ─── CONFIGURAÇÃO ───
const GRAPH_API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

import { getEnv } from "./env";

function getHeaders() {
  return {
    Authorization: `Bearer ${getEnv("META_ACCESS_TOKEN")}`,
    "Content-Type": "application/json",
  };
}

function getPhoneNumberId() {
  return getEnv("WABA_PHONE_NUMBER_ID")!;
}

// ─── FORMATAR NÚMERO ───
export function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é número
  const digits = phone.replace(/\D/g, "");

  // Adicionar código do Brasil se não tiver
  if (digits.startsWith("55") && digits.length >= 12) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `55${digits.slice(1)}`;
  }

  if (digits.length === 11) {
    return `55${digits}`;
  }

  if (digits.length === 10) {
    // Adicionar 9 para celular (padrão BR)
    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);
    return `55${ddd}9${number}`;
  }

  return digits;
}

// ─── ENVIAR MENSAGEM DE TEXTO ───
export async function sendTextMessage(
  to: string,
  body: string,
  previewUrl = false
): Promise<SendResult> {
  const formattedPhone = formatPhoneNumber(to);

  try {
    const response = await axios.post(
      `${BASE_URL}/${getPhoneNumberId()}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: previewUrl,
          body,
        },
      },
      { headers: getHeaders() }
    );

    const messageId = response.data?.messages?.[0]?.id;
    console.log(`✅ WhatsApp enviado para ${formattedPhone}: ${messageId}`);

    return { success: true, messageId };
  } catch (error) {
    const err = error as {
      response?: { data?: { error?: { message?: string; code?: number } }; status?: number };
      message?: string;
    };
    const errorMessage =
      err.response?.data?.error?.message || err.message || "Erro desconhecido";
    const statusCode = err.response?.status;

    console.error(`❌ Erro ao enviar WhatsApp para ${formattedPhone}:`, {
      error: errorMessage,
      statusCode,
      phone: formattedPhone,
    });

    return {
      success: false,
      error: errorMessage,
      statusCode,
    };
  }
}

// ─── ENVIAR MENSAGEM COM BOTÕES ───
export async function sendButtonMessage(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>,
  header?: string,
  footer?: string
): Promise<SendResult> {
  const formattedPhone = formatPhoneNumber(to);

  try {
    const response = await axios.post(
      `${BASE_URL}/${getPhoneNumberId()}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "interactive",
        interactive: {
          type: "button",
          ...(header && {
            header: { type: "text", text: header },
          }),
          body: { text: body },
          ...(footer && {
            footer: { text: footer },
          }),
          action: {
            buttons: buttons.slice(0, 3).map((btn) => ({
              type: "reply",
              reply: { id: btn.id, title: btn.title.slice(0, 20) },
            })),
          },
        },
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
    };
  } catch (error) {
    const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// ─── ENVIAR TEMPLATE ───
export async function sendTemplate(
  to: string,
  templateName: string,
  languageCode = "pt_BR",
  components: TemplateComponent[] = []
): Promise<SendResult> {
  const formattedPhone = formatPhoneNumber(to);

  try {
    const response = await axios.post(
      `${BASE_URL}/${getPhoneNumberId()}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
    };
  } catch (error) {
    const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// ─── ENVIAR IMAGEM ───
export async function sendImage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<SendResult> {
  const formattedPhone = formatPhoneNumber(to);

  try {
    const response = await axios.post(
      `${BASE_URL}/${getPhoneNumberId()}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "image",
        image: {
          link: imageUrl,
          ...(caption && { caption }),
        },
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
    };
  } catch (error) {
    const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// ─── ENVIAR DOCUMENTO ───
export async function sendDocument(
  to: string,
  documentUrl: string,
  filename: string,
  caption?: string
): Promise<SendResult> {
  const formattedPhone = formatPhoneNumber(to);

  try {
    const response = await axios.post(
      `${BASE_URL}/${getPhoneNumberId()}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "document",
        document: {
          link: documentUrl,
          filename,
          ...(caption && { caption }),
        },
      },
      { headers: getHeaders() }
    );

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
    };
  } catch (error) {
    const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
    return {
      success: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// ─── MARCAR COMO LIDO ───
export async function markAsRead(messageId: string): Promise<void> {
  try {
    await axios.post(
      `${BASE_URL}/${getPhoneNumberId()}/messages`,
      {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      },
      { headers: getHeaders() }
    );
  } catch (error) {
    // Silencioso — não crítico
    console.warn("Não foi possível marcar mensagem como lida:", messageId);
  }
}

// ─── VERIFICAR STATUS DA CONTA ───
export async function checkAccountStatus(): Promise<{
  valid: boolean;
  phoneNumber?: string;
  displayName?: string;
  error?: string;
}> {
  try {
    const response = await axios.get(
      `${BASE_URL}/${getPhoneNumberId()}`,
      {
        headers: getHeaders(),
        params: {
          fields: "display_phone_number,verified_name,quality_rating",
        },
      }
    );

    return {
      valid: true,
      phoneNumber: response.data.display_phone_number,
      displayName: response.data.verified_name,
    };
  } catch (error) {
    const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
    return {
      valid: false,
      error: err.response?.data?.error?.message || err.message,
    };
  }
}

// ─── ENVIO COM RETRY ───
export async function sendWithRetry(
  to: string,
  body: string,
  maxRetries = 3
): Promise<SendResult> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendTextMessage(to, body);

    if (result.success) return result;

    lastError = result.error;

    // Não tentar novamente se erro não é temporário
    const nonRetryableCodes = [400, 401, 403, 404];
    if (result.statusCode && nonRetryableCodes.includes(result.statusCode)) {
      break;
    }

    // Aguardar antes de tentar novamente (exponencial)
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }

  return { success: false, error: lastError };
}

// ─── DIVIDIR MENSAGEM LONGA ───
export async function sendLongMessage(
  to: string,
  body: string,
  maxLength = 4000
): Promise<SendResult[]> {
  if (body.length <= maxLength) {
    return [await sendTextMessage(to, body)];
  }

  const parts: string[] = [];
  let remaining = body;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    // Quebrar em ponto final ou quebra de linha mais próxima
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex < maxLength * 0.7) {
      splitIndex = remaining.lastIndexOf(". ", maxLength);
    }
    if (splitIndex < 0) {
      splitIndex = maxLength;
    }

    parts.push(remaining.slice(0, splitIndex + 1).trim());
    remaining = remaining.slice(splitIndex + 1).trim();
  }

  const results: SendResult[] = [];
  for (const part of parts) {
    const result = await sendTextMessage(to, part);
    results.push(result);
    // Delay entre partes para não parecer spam
    if (parts.indexOf(part) < parts.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}
