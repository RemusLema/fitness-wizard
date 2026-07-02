// src/app/gym/[slug]/dashboard/page.tsx
// Server component wrapper — resolves async params cleanly
import GymDashboard from "./GymDashboard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { slug } = await params;
  return <GymDashboard slug={slug} />;
}
