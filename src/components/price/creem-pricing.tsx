"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Balancer from "react-wrap-balancer";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { creem } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import * as Icons from "@/components/ui/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSigninModal } from "@/hooks/use-signin-modal";
import {
  getLocalizedOnetimePackages,
  getLocalizedSubscriptionPackages,
  type CreditsDictionary,
  type LocalizedPackage,
} from "@/hooks/use-credit-packages";

interface CreemPricingProps {
  userId?: string;
  dictPrice: Record<string, string>;
  dictCredits: CreditsDictionary;
}

type PricingTab = "onetime" | "monthly";

function formatPrice(cents: number): string {
  const value = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${value}`;
}

export function CreemPricing({
  userId,
  dictPrice,
  dictCredits,
}: CreemPricingProps) {
  const [activeTab, setActiveTab] = useState<PricingTab>("onetime");
  const [hasAccess, setHasAccess] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const signInModal = useSigninModal();

  const allSubscriptionProducts = useMemo(
    () =>
      getLocalizedSubscriptionPackages(dictCredits).sort(
        (a, b) => a.credits - b.credits
      ),
    [dictCredits]
  );

  const onetimeProducts = useMemo(
    () =>
      getLocalizedOnetimePackages(dictCredits).sort(
        (a, b) => a.credits - b.credits
      ),
    [dictCredits]
  );

  const monthlyProducts = useMemo(
    () => allSubscriptionProducts.filter((product) => product.billingPeriod === "month"),
    [allSubscriptionProducts]
  );

  useEffect(() => {
    if (!userId) return;

    let active = true;
    setIsCheckingAccess(true);

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
        setActiveProductId(subscription?.productId ?? null);
      })
      .finally(() => {
        if (active) setIsCheckingAccess(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const handleCheckout = (product: LocalizedPackage) => {
    if (!userId) {
      signInModal.onOpen();
      return;
    }

    setLoadingProductId(product.id);
    startTransition(async () => {
      const origin = window.location.origin;
      const currentPath = window.location.pathname;
      const returnTo = encodeURIComponent(currentPath);

      const { data, error } = await creem.createCheckout({
        productId: product.id,
        successUrl: `${origin}/credits?payment=success&returnTo=${returnTo}`,
        metadata: {
          plan: product.id,
        },
      });

      if (error) {
        toast.error("Checkout error", {
          description: error.message ?? "Failed to create checkout session.",
        });
        setLoadingProductId(null);
        return;
      }

      if (!data || !("url" in data) || !data.url) {
        toast.error("Checkout error", {
          description: "Missing checkout URL from Creem.",
        });
        setLoadingProductId(null);
        return;
      }

      window.location.href = data.url;
    });
  };

  const handlePortal = async () => {
    const { data, error } = await creem.createPortal();
    if (error) {
      toast.error("Portal error", {
        description: error.message ?? "Failed to open customer portal.",
      });
      return;
    }

    if (!data || !("url" in data) || !data.url) {
      toast.error("Portal error", {
        description: "Missing portal URL from Creem.",
      });
      return;
    }

    window.location.href = data.url;
  };

  return (
    <section className="container py-12 md:py-20">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {dictPrice.pricing}
        </p>
        <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
          {dictPrice.slogan}
        </h2>
        <p className="mt-4 text-muted-foreground">
          Choose between flexible one-time credit packs and monthly subscriptions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PricingTab)} className="w-full">
        <TabsList className="mx-auto grid max-w-xl grid-cols-2">
          <TabsTrigger value="onetime">一次性积分包</TabsTrigger>
          <TabsTrigger value="monthly">按月订阅</TabsTrigger>
        </TabsList>

        <TabsContent value="onetime" className="mt-8">
          <PricingGrid
            products={onetimeProducts}
            activeProductId={activeProductId}
            hasAccess={hasAccess}
            userId={userId}
            isPending={isPending}
            isCheckingAccess={isCheckingAccess}
            loadingProductId={loadingProductId}
            isOnetime
            dictPrice={dictPrice}
            dictCredits={dictCredits}
            onCheckout={handleCheckout}
            onPortal={handlePortal}
            signInModal={signInModal}
          />
        </TabsContent>

        <TabsContent value="monthly" className="mt-8">
          <PricingGrid
            products={monthlyProducts}
            activeProductId={activeProductId}
            hasAccess={hasAccess}
            userId={userId}
            isPending={isPending}
            isCheckingAccess={isCheckingAccess}
            loadingProductId={loadingProductId}
            isOnetime={false}
            dictPrice={dictPrice}
            dictCredits={dictCredits}
            onCheckout={handleCheckout}
            onPortal={handlePortal}
            signInModal={signInModal}
          />
        </TabsContent>
      </Tabs>

      <p className="mt-16 text-center text-base text-muted-foreground">
        <Balancer>
          Email{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:support@ai2art.net"
          >
            support@ai2art.net
          </a>{" "}
          {dictPrice.contact}
          <br />
          <strong>{dictPrice.contact_2}</strong>
        </Balancer>
      </p>
    </section>
  );
}

interface PricingGridProps {
  products: LocalizedPackage[];
  activeProductId: string | null;
  hasAccess: boolean;
  userId?: string;
  isPending: boolean;
  isCheckingAccess: boolean;
  loadingProductId: string | null;
  isOnetime: boolean;
  dictPrice: Record<string, string>;
  dictCredits: CreditsDictionary;
  onCheckout: (product: LocalizedPackage) => void;
  onPortal: () => void;
  signInModal: { onOpen: () => void };
}

function PricingGrid({
  products,
  activeProductId,
  hasAccess,
  userId,
  isCheckingAccess,
  loadingProductId,
  isOnetime,
  dictPrice,
  dictCredits,
  onCheckout,
  onPortal,
  signInModal,
}: PricingGridProps) {
  const buyCreditsLabel = dictCredits.buy_credits ?? "Buy Credits";

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        暂无可用产品
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
      {products.map((product) => {
        const isRecommended = product.popular;
        const isCurrent = activeProductId === product.id && hasAccess;
        const isLoading = loadingProductId === product.id;
        const isFreeUserAccessible = isOnetime && product.allowFreeUser === true;

        return (
          <Card
            key={product.id}
            className={[
              "relative flex flex-col transition-shadow hover:shadow-lg",
              isRecommended ? "border-2 border-primary" : "",
            ].join(" ").trim()}
          >
            {isRecommended && (
              <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground shadow-md">
                推荐
              </div>
            )}

            <CardHeader className={isRecommended ? "pb-4 pt-6" : "pb-4"}>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{product.displayName}</CardTitle>
                {isFreeUserAccessible && (
                  <div className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    免费用户可买
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {formatPrice(product.price.amount)}
                  </span>
                  {product.billingPeriod && (
                    <span className="text-sm text-muted-foreground">
                      /{product.billingPeriod === "year" ? "年" : "月"}
                    </span>
                  )}
                </div>
              </div>

              {product.displayDescription ? (
                <CardDescription>{product.displayDescription}</CardDescription>
              ) : null}
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {product.localizedFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {userId ? (
                isCurrent ? (
                  <Button variant="default" className="w-full" onClick={onPortal}>
                    {dictPrice.manage_cancel_subscription ?? dictPrice.manage_subscription}
                  </Button>
                ) : (
                  <Button
                    variant={isRecommended ? "default" : "outline"}
                    className="w-full"
                    disabled={isLoading || isCheckingAccess}
                    onClick={() => onCheckout(product)}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </span>
                    ) : product.billingPeriod ? (
                      dictPrice.upgrade
                    ) : (
                      buyCreditsLabel
                    )}
                  </Button>
                )
              ) : (
                <Button
                  variant={isRecommended ? "default" : "outline"}
                  onClick={signInModal.onOpen}
                >
                  {dictPrice.signup}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
