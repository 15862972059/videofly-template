"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui";
import { creem } from "@/lib/auth/client";

interface SubscriptionManagementCardProps {
  className?: string;
}

export function SubscriptionManagementCard({ className }: SubscriptionManagementCardProps) {
  const t = useTranslations("dashboard.subscription");
  const locale = useLocale();
  const [hasAccess, setHasAccess] = useState(false);
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    creem
      .hasAccessGranted()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Creem access check failed:", error);
          return;
        }

        const subscription =
          data && "subscription" in data ? data.subscription : undefined;
        setHasAccess(!!data?.hasAccessGranted);
        setPeriodEnd(
          subscription?.periodEnd ? new Date(subscription.periodEnd) : null
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handlePortal = () => {
    startTransition(async () => {
      const { data, error } = await creem.createPortal();
      if (error) {
        toast.error(t("portalErrorTitle"), {
          description: error.message ?? t("portalErrorDescription"),
        });
        return;
      }

      if (data && "url" in data && data.url) {
        window.location.href = data.url;
        return;
      }

      toast.error(t("portalErrorTitle"), {
        description: t("missingPortalDescription"),
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
            disabled={isLoading || isPending}
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
