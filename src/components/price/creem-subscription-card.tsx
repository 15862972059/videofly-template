"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import * as Icons from "@/components/ui/icons";
import { toast } from "sonner";
import { useSubscriptionStatus } from "@/hooks/use-subscription";

interface CreemSubscriptionCardProps {
  dict: Record<string, string>;
}

export function CreemSubscriptionCard({ dict }: CreemSubscriptionCardProps) {
  const {
    data,
    isLoading,
    openPortal,
    isOpeningPortal,
  } = useSubscriptionStatus();

  const hasAccess = !!data?.hasAccess;
  const planLabel = data?.productId ?? null;
  const endsAt = useMemo(
    () => (data?.periodEnd ? new Date(data.periodEnd) : null),
    [data?.periodEnd]
  );

  const handlePortal = () => {
    openPortal()
      .then((portal) => {
        if (!portal?.url) {
          toast.error("Portal error", {
            description: "Missing portal URL from Creem.",
          });
          return;
        }

        window.location.href = portal.url;
      })
      .catch((error: Error) => {
        toast.error("Portal error", {
          description: error.message ?? "Failed to open customer portal.",
        });
      });
  };

  const content = hasAccess && planLabel && endsAt
    ? dict.subscriptionInfo
        .replace("{plan}", planLabel)
        .replace("{date}", endsAt.toLocaleDateString())
    : dict.noSubscription;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <p dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {hasAccess ? (
          <Button onClick={handlePortal} disabled={isOpeningPortal || isLoading}>
            {dict.manage_subscription}
          </Button>
        ) : (
          <Button asChild>
            <Link href="/pricing">{dict.upgrade}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
