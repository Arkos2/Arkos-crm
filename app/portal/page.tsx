import { Metadata } from "next";
import { ClientProject } from "@/lib/types/portal";
import { Card, Badge, Button } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import {
  Building2, ExternalLink, Plus,
  CheckCircle2, Clock, AlertCircle, Users,
import Link from "next/link";
import { useState } from "react";
import { NewPortalModal } from "@/components/portal/NewPortalModal";

export const metadata: Metadata = { title: "Portal do Cliente" };

export default function PortalManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            Portal do Cliente
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Gerencie o onboarding dos seus clientes
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Novo Portal
        </Button>
      </div>

      {/* Cards dos projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {([] as ClientProject[]).length > 0 ? (
          ([] as ClientProject[]).map((project) => {
            const pendingClient = project.checklist.filter(
              (c) => c.assignedTo === "client" && c.status !== "completed"
            ).length;
            const currentStage = project.stages.find(
              (s) => s.id === project.currentStage
            );
            const daysLeft = Math.max(
              0,
              Math.ceil(
                (new Date(project.expectedEndDate).getTime() - Date.now()) /
                  86400000
              )
            );

            return (
              <Card key={project.id} variant="interactive" className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-arkos-blue/10 border border-arkos-blue/20 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-arkos-blue-light" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        {project.companyName}
                      </p>
                      <p className="text-xs text-text-muted truncate max-w-[180px]">
                        {project.projectName}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" dot dotAnimate size="sm">
                    Ativo
                  </Badge>
                </div>

                {/* Progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">
                      {currentStage?.label}
                    </span>
                    <span className="font-bold text-text-primary">
                      {project.overallProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-arkos-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-blue transition-all duration-700"
                      style={{ width: `${project.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: Clock,
                      label: "Dias restantes",
                      value: daysLeft,
                      color: daysLeft < 7 ? "text-warning" : "text-text-secondary",
                    },
                    {
                      icon: CheckCircle2,
                      label: "Docs assinados",
                      value: project.documents.filter(
                        (d) => d.status === "signed"
                      ).length,
                      color: "text-success",
                    },
                    {
                      icon: AlertCircle,
                      label: "Pendente cliente",
                      value: pendingClient,
                      color: pendingClient > 0 ? "text-warning" : "text-success",
                    },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-arkos-surface-2"
                    >
                      <Icon className={cn("h-3.5 w-3.5", color)} />
                      <span className={cn("text-base font-bold", color)}>
                        {value}
                      </span>
                      <span className="text-2xs text-text-muted text-center leading-tight">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-arkos-border">
                  <div className="text-xs text-text-muted flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {project.managerName} · {project.clientName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/portal/${project.accessToken}`} target="_blank">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={<ExternalLink className="h-3 w-3" />}
                      >
                        Ver portal
                      </Button>
                    </Link>
                    <Button variant="ghost" size="xs">
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-arkos-blue/10 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-arkos-blue" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Nenhum portal ativo</h3>
              <p className="text-sm text-text-muted mt-1 max-w-xs">
                Crie portais de onboarding para seus clientes acompanharem o progresso do projeto em tempo real.
              </p>
              <Button
                variant="gold"
                size="sm"
                className="mt-6"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setIsModalOpen(true)}
              >
                Novo Portal
              </Button>
            </Card>
          </div>
        )}
      </div>

      <NewPortalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
