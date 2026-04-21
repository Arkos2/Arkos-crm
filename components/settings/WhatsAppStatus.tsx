"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge, Button, Card } from "@/components/ui";
import {
  MessageSquare, CheckCircle2, XCircle,
  RefreshCw, Send, Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppStatusData {
  whatsapp: {
    valid: boolean;
    phoneNumber?: string;
    displayName?: string;
    error?: string;
  };
  config: {
    hasAccessToken: boolean;
    hasPhoneNumberId: boolean;
    hasWebhookToken: boolean;
    webhookUrl: string;
  };
}

export function WhatsAppStatus() {
  const [status, setStatus] = useState<WhatsAppStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Esta é uma mensagem de teste do ARKOS CRM. 🚀");
  const [isSending, setIsSending] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/webhook/status");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      toast.error("Erro ao verificar status do WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTest = async () => {
    if (!testPhone) {
      toast.error("Digite um número de telefone");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, message: testMessage }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`Mensagem enviada! ID: ${result.messageId}`);
      } else {
        toast.error(`Erro: ${result.error}`);
      }
    } catch {
      toast.error("Erro ao enviar mensagem de teste");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-text-muted animate-spin" />
      </Card>
    );
  }

  const isConnected = status?.whatsapp?.valid;

  return (
    <div className="space-y-4">
      {/* Status geral */}
      <Card className={cn(
        "border",
        isConnected ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
      )}>
        <div className="flex items-start justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-2xl",
              isConnected ? "bg-green-500/10" : "bg-red-500/10"
            )}>
              <MessageSquare className={cn(
                "h-6 w-6",
                isConnected ? "text-green-500" : "text-red-500"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text-primary">
                  WhatsApp Business API
                </p>
                <Badge
                  variant={isConnected ? "success" : "danger"}
                >
                  {isConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
              {isConnected && status?.whatsapp && (
                <p className="text-xs text-text-muted mt-0.5">
                  {status.whatsapp.displayName} · {status.whatsapp.phoneNumber}
                </p>
              )}
              {!isConnected && status?.whatsapp?.error && (
                <p className="text-xs text-red-500 mt-0.5">
                  {status.whatsapp.error}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-2", isLoading && "animate-spin")} />
            Verificar
          </Button>
        </div>
      </Card>

      {/* Checklist de configuração */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-text-primary mb-4">
          Configuração
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "META_ACCESS_TOKEN",
              ok: status?.config?.hasAccessToken,
              desc: "Token de acesso da Meta API",
            },
            {
              label: "WABA_PHONE_NUMBER_ID",
              ok: status?.config?.hasPhoneNumberId,
              desc: "ID do número de telefone WABA",
            },
            {
              label: "META_WEBHOOK_VERIFY_TOKEN",
              ok: status?.config?.hasWebhookToken,
              desc: "Token de verificação do webhook",
            },
          ].map(({ label, ok, desc }) => (
            <div key={label} className="flex items-center gap-3">
              {ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-semibold text-text-primary">
                  {label}
                </p>
                <p className="text-[10px] text-text-muted">{desc}</p>
              </div>
              <Badge
                variant={ok ? "success" : "danger"}
              >
                {ok ? "OK" : "Faltando"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Webhook URL */}
        {status?.config?.webhookUrl && (
          <div className="mt-4 pt-4 border-t border-arkos-border">
            <p className="text-xs font-semibold text-text-secondary mb-2">
              URL do Webhook
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-arkos-surface-2 border border-arkos-border">
              <code className="text-[10px] text-text-primary flex-1 font-mono break-all">
                {status.config.webhookUrl}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(status.config.webhookUrl);
                  toast.success("URL copiada!");
                }}
                className="shrink-0 text-[10px] text-blue-500 hover:text-arkos-gold transition-colors"
              >
                Copiar
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5">
              Configure esta URL no painel do Meta Business → WhatsApp → Configuração → Webhooks
            </p>
          </div>
        )}
      </Card>

      {/* Enviar mensagem de teste */}
      {isConnected && (
        <Card className="p-4">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-green-500" />
            Testar Envio
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Número de destino (com DDI e DDD)
              </label>
              <input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="5511999999999"
                className="w-full h-9 px-3 rounded-xl text-sm bg-background border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Mensagem
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm resize-none bg-background border border-arkos-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <Button
              variant="primary"
              className="w-full"
              loading={isSending}
              onClick={handleTest}
            >
              <Send className="h-3.5 w-3.5 mr-2" />
              {isSending ? "Enviando..." : "Enviar Mensagem de Teste"}
            </Button>
          </div>
        </Card>
      )}

      {/* Link para o Meta Business */}
      {!isConnected && (
        <div className="flex justify-center">
          <a
            href="https://business.facebook.com/wa/manage/phone-numbers/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-blue-500 hover:text-arkos-gold transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Configurar no Meta Business Manager
          </a>
        </div>
      )}
    </div>
  );
}
