"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Gem, Menu, Moon, Monitor, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/components/ui";
import { LocaleChange } from "@/components/locale-change";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { LocaleLink, useLocaleRouter } from "@/i18n/navigation";
import { authClient, useSession, type User } from "@/lib/auth/client";
import { useCredits } from "@/stores/credits-store";

export function LandingHeader({ user }: { user?: User | null }) {
  const { data: session } = useSession();
  const currentUser = user ?? session?.user ?? null;
  const t = useTranslations();
  const tHeader = useTranslations("LandingHeader");
  const tTheme = useTranslations("Theme");
  const signInModal = useSigninModal();
  const router = useLocaleRouter();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: t("Header.gallery"), href: "/gallery" },
    { label: t("Header.studio"), href: "/studio" },
    { label: t("Header.pricing"), href: "/pricing" },
    { label: tHeader("faq"), href: "/#faq" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-emerald-900/10 bg-background/80 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md",
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="hidden h-16 items-center justify-between lg:flex">
          <LocaleLink href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800 dark:text-white">
            <Image src="/logo.svg" alt="AI2ART" width={28} height={28} className="rounded-md" />
            AI2ART
          </LocaleLink>

          <div className="flex items-center gap-1 rounded-full border border-emerald-900/10 bg-white/60 p-1 shadow-sm backdrop-blur dark:bg-white/5">
            {navItems.map((item) => (
              <LocaleLink
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
              >
                {item.label}
              </LocaleLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LocaleChange />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={tTheme("toggle")}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                  <Sun className="mr-2 h-4 w-4" />
                  {tTheme("light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                  <Moon className="mr-2 h-4 w-4" />
                  {tTheme("dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                  <Monitor className="mr-2 h-4 w-4" />
                  {tTheme("system")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentUser && (
              <div className="flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Gem className="h-4 w-4" />
                <CreditsDisplay />
              </div>
            )}

            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 transition-opacity hover:opacity-80 dark:bg-emerald-500/15 dark:text-emerald-200">
                    {currentUser.name?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <LocaleLink href="/generations">{t("Header.generations")}</LocaleLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <LocaleLink href="/credits">{t("Header.credits")}</LocaleLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    {t("Common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={signInModal.onOpen}>
                  {t("Common.login")}
                </Button>
                <Button size="sm" asChild className="rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700">
                  <LocaleLink href="/register">{t("Common.signup")}</LocaleLink>
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="flex h-16 items-center justify-between lg:hidden">
          <LocaleLink href="/" className="flex items-center gap-2 text-lg font-bold">
            <Image src="/logo.svg" alt="AI2ART" width={28} height={28} className="rounded-md" />
            AI2ART
          </LocaleLink>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                <Gem className="h-3 w-3" />
                <CreditsDisplay />
              </div>
            )}
            <LocaleChange compact />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={tHeader("menu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="AI2ART" width={26} height={26} className="rounded-md" />
                    AI2ART
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <LocaleLink key={item.href} href={item.href} className="rounded-lg px-3 py-2 font-medium hover:bg-muted">
                      {item.label}
                    </LocaleLink>
                  ))}
                  <div className="my-4 h-px bg-border" />
                  {currentUser ? (
                    <button type="button" onClick={handleSignOut} className="rounded-lg px-3 py-2 text-left font-medium text-destructive hover:bg-destructive/10">
                      {t("Common.logout")}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={signInModal.onOpen}>
                        {t("Common.login")}
                      </Button>
                      <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <LocaleLink href="/register">{t("Common.signup")}</LocaleLink>
                      </Button>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    {tTheme("label")}
                    {(["light", "dark", "system"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTheme(mode)}
                        className={cn("rounded-md px-2 py-1", theme === mode ? "bg-muted text-foreground" : "hover:text-foreground")}
                      >
                        {tTheme(mode)}
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function CreditsDisplay() {
  const { balance } = useCredits();
  return <span>{balance?.availableCredits ?? 0}</span>;
}
