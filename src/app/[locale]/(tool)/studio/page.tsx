import { StudioPageShell } from "@/components/studio/studio-page-shell";
import type { Locale } from "@/config/i18n-config";
import { getCurrentUser } from "@/lib/auth";
import { getLocalizedPath } from "@/lib/auth/callback-url";
import { redirect } from "next/navigation";
import StudioContent from "./StudioContent";

export const dynamic = "force-dynamic";

interface StudioPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function buildQueryString(
  searchParams: Record<string, string | string[] | undefined>
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export default async function StudioPage({
  params,
  searchParams,
}: StudioPageProps) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    const resolvedSearchParams = (await searchParams) ?? {};
    const studioPath = getLocalizedPath(locale, "/studio");
    const loginPath = getLocalizedPath(locale, "/login");
    const from = `${studioPath}${buildQueryString(resolvedSearchParams)}`;

    redirect(`${loginPath}?from=${encodeURIComponent(from)}`);
  }

  return (
    <StudioPageShell>
      <StudioContent />
    </StudioPageShell>
  );
}
