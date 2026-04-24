import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortalView } from "@/components/portal/PortalView";

interface PageProps {
  params: { projectId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: "Portal ARKOS" };
}

export default function PortalPage({ params }: PageProps) {
  notFound();
}
