import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudioContent from "./StudioContent";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <StudioPageShell>
      <StudioContent />
    </StudioPageShell>
  );
}
