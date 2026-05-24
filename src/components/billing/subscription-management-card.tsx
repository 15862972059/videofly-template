"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui";
import { useSubscriptionStatus } from "@/hooks/use-subscription";

interface SubscriptionManagementCardProps {
  className?: string;
}

export function SubscriptionManagementCard({ className }: SubscriptionManagementCardProps) {
  const t = useTranslations("dashboard.subscription");
  const locale = useLocale();
  const {
    data,
    isLoading,
    openPortal,
    isOpeningPortal,
  } = useSubscriptionStatus();

  const hasAccess = !!data?.hasAccess;
  const periodEnd = data?.periodEnd ? new Date(data.periodEnd) : null;

  const handlePortal = () => {
    openPortal()
      .then((portal) => {
        if (!portal?.url) {
          toast.error(t("portalErrorTitle"), {
            description: t("missingPortalDescription"),
          });
          return;
        }

        window.location.href = portal.url;
      })
      .catch((error: Error) => {
        toast.error(t("portalErrorTitle"), {
          description: error.message ?? t("portalErrorDescription"),
        });
      });
  };

  const statusText = isLoading
    ? t("loading")
    : hasAccess
      ? t("activeLabel")
      : t("inactiveLabel");

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
              <CreditCard className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{t("title")}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              hasAccess
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {statusText}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("portalHint")}</span>
          </div>
          {hasAccess && periodEnd && (
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>
                {t("periodEnd", { date: periodEnd.toLocaleDateString() })}
              </span>
            </div>
          )}
        </div>

        {hasAccess ? (
          <Button
            type="button"
            onClick={handlePortal}
            disabled={isLoading || isOpeningPortal}
            className="w-full cursor-pointer gap-2"
          >
            {t("manageCancelButton")}
            <ExternalLink className="h-4 w-4" />
          </Button>
        ) : (
          <Button asChild className="w-full cursor-pointer gap-2">
            <Link href={`/${locale}/pricing`}>
              {t("viewPlansButton")}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
