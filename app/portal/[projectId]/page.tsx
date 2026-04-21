import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCK_PROJECTS } from "@/lib/mock/portal";
import { PortalView } from "@/components/portal/PortalView";

interface PageProps {
  params: { projectId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = MOCK_PROJECTS.find(
    (p) => p.accessToken === params.projectId || p.id === params.projectId
  );

  return {
    title: project
      ? `${project.companyName} — Portal ARKOS`
      : "Portal ARKOS",
  };
}

export default function PortalPage({ params }: PageProps) {
  const project = MOCK_PROJECTS.find(
    (p) => p.accessToken === params.projectId || p.id === params.projectId
  );

  if (!project) notFound();

  return <PortalView project={project} />;
}
