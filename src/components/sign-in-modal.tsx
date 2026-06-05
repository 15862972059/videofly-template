"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import * as Icons from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { toast } from "sonner";

interface SignInModalContentProps {
  lang: string;
}

export const SignInModalContent = ({ lang }: SignInModalContentProps) => {
  const t = useTranslations("SignInModal");
  const signInModal = useSigninModal();
  const searchParams = useSearchParams();
  const [signInClicked, setSignInClicked] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const callbackURL = searchParams?.get("from") ?? `/${lang}${siteConfig.routes.defaultLoginRedirect}`;

  const handleSocialLogin = async (provider: "google") => {
    setSignInClicked(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (error) {
      console.error(`${provider} signIn error:`, error);
      setSignInClicked(null);
      toast.error("Login failed", {
        description: `Could not sign in with ${provider}. Please try again.`,
      });
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setSignInClicked("email");

    try {
      await authClient.signIn.magicLink({
        email: email.toLowerCase(),
        callbackURL,
      });

      toast.success("Check your email", {
        description: "We sent you a login link. Be sure to check your spam too.",
      });

      setEmail("");
      signInModal.onClose();
    } catch (error) {
      console.error("Magic link signIn error:", error);
      toast.error("Something went wrong", {
        description: "Your sign in request failed. Please try again.",
      });
    } finally {
      setSignInClicked(null);
    }
  };

  const isLoading = signInClicked !== null;

  return (
    <div className="w-full bg-white">
      <div className="border-b border-slate-200/80 bg-slate-50/80 px-5 pb-5 pt-6 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-slate-400" />
          AI2ART Access
        </div>
        <h3 className="mt-4 font-urban text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900">
          {t("signin_title")}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t("signin_subtitle")}
        </p>
      </div>

      <div className="space-y-5 bg-white px-5 py-5 sm:px-6">
        {siteConfig.auth.enableGoogleLogin && (
          <Button
            variant="default"
            className="h-11 w-full rounded-xl text-sm font-medium shadow-none transition-transform duration-200 hover:-translate-y-0.5"
            disabled={isLoading}
            onClick={() => handleSocialLogin("google")}
          >
            {signInClicked === "google" ? (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.Google className="mr-2 h-4 w-4" />
            )}
            {t("continue_google")}
            {signInClicked !== "google" && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        )}

        {siteConfig.auth.enableMagicLinkLogin && (
          <>
            {siteConfig.auth.enableGoogleLogin && (
              <div className="relative py-0.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 font-medium tracking-wide text-slate-400">
                    {t("or_continue_with")}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleMagicLinkLogin} className="grid gap-3">
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-slate-600" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className={cn(
                    "h-11 rounded-xl border-slate-200 bg-white shadow-none transition-colors placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-200",
                    emailError && "border-red-500 focus-visible:ring-red-100"
                  )}
                />
                {emailError && (
                  <p className="px-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <Button
                type="submit"
                variant={siteConfig.auth.enableGoogleLogin ? "outline" : "default"}
                className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 shadow-none transition-colors hover:bg-slate-100 hover:text-slate-950"
                disabled={isLoading}
              >
                {signInClicked === "email" ? (
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.Mail className="mr-2 h-4 w-4" />
                )}
                {t("continue_email")}
              </Button>
            </form>
          </>
        )}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p className="text-xs leading-5 text-slate-500">
              {t("terms_notice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
