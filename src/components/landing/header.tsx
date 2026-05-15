"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Gem, Globe, Menu, Moon, Monitor, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
import { useSigninModal } from "@/hooks/use-signin-modal";
import { LocaleLink } from "@/i18n/navigation";
import { authClient, type User } from "@/lib/auth/client";
import { useCredits } from "@/stores/credits-store";

const navItems = [
  { label: "Gallery", href: "/gallery" },
  { label: "Studio", href: "/studio" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function LandingHeader({ user }: { user?: User | null }) {
  const t = useTranslations();
  const signInModal = useSigninModal();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      let newPath = pathname.replace(/^\/(zh|en)/, "");
      if (newPath === "") newPath = "/";
      router.push(newLocale === "zh" ? (newPath === "/" ? "/zh" : `/zh${newPath}`) : newPath);
      router.refresh();
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(`/${locale}`);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isPending}
                  className="flex h-9 items-center gap-1 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {locale.toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => switchLocale("en")} className="cursor-pointer">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale("zh")} className="cursor-pointer">
                  Chinese
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (
              <div className="flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Gem className="h-4 w-4" />
                <CreditsDisplay />
              </div>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 transition-opacity hover:opacity-80 dark:bg-emerald-500/15 dark:text-emerald-200">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
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
            {user && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                <Gem className="h-3 w-3" />
                <CreditsDisplay />
              </div>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
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
                  {user ? (
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
                    Theme:
                    {(["light", "dark", "system"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTheme(mode)}
                        className={cn("rounded-md px-2 py-1", theme === mode ? "bg-muted text-foreground" : "hover:text-foreground")}
                      >
                        {mode}
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
