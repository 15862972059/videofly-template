"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderOpen, Gem, ImagePlay, Images, Sparkles, Type, User, Video } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/components/ui";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { sidebarNavigation } from "@/config/navigation";
import { ShineBorder } from "@/registry/magicui/shine-border";
import { useCredits } from "@/stores/credits-store";

const iconMap = {
  ImagePlay,
  Type,
  Video,
  FolderOpen,
  Gem,
  User,
  Sparkles,
  Images,
};

interface SidebarProps {
  lang?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ lang = "en", mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pathWithoutLang = pathname.replace(new RegExp(`^/${lang}`), "");
  const t = useTranslations("Sidebar");
  const { openModal } = useUpgradeModal();
  const { balance } = useCredits();

  const isFreeUser = useMemo(() => true, []);

  const navItemLabelMap: Record<string, string> = {
    studio: t("items.studio"),
    generations: t("items.generations"),
    credits: t("items.credits"),
    settings: t("items.settings"),
  };

  const groupLabelMap: Record<string, string> = {
    image: t("groups.image"),
  };

  const handleUpgradeClick = () => {
    openModal({ reason: "upgrade" });
  };

  const renderNavItem = (item: (typeof sidebarNavigation)[number]["items"][number], isActive: boolean) => {
    const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;
    const href = `/${lang}${item.href}`;

    return (
      <Link
        key={item.id}
        href={href}
        prefetch
        onMouseEnter={() => router.prefetch(href)}
        onFocus={() => router.prefetch(href)}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{navItemLabelMap[item.id] ?? item.title}</span>
        {item.id === "credits" && balance && (
          <span className="ml-auto shrink-0 text-xs font-semibold text-amber-500">
            {balance.availableCredits}
          </span>
        )}
      </Link>
    );
  };

  const DesktopNav = () => (
    <div className="flex h-full flex-col py-4">
      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        {sidebarNavigation.map((group) => (
          <div key={group.id} className="space-y-1">
            {group.title && (
              <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                {groupLabelMap[group.id] ?? group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => renderNavItem(item, pathWithoutLang === item.href))}
            </div>
          </div>
        ))}
      </nav>

      {isFreeUser && (
        <div className="border-t border-border/50 px-3 pt-4">
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="group relative w-full overflow-hidden rounded-xl bg-background p-[1px] text-left transition-transform hover:-translate-y-0.5"
          >
            <ShineBorder
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              borderWidth={1}
            />
            <div className="relative rounded-xl bg-gradient-to-br from-primary/15 via-background to-primary/5 p-3">
              <div className="relative mb-1 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {t("upgradeTitle")}
                </span>
              </div>
              <p className="relative text-xs text-muted-foreground">
                {t("upgradeSubtitle")}
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  const MobileNav = () => (
    <div className="flex h-full flex-col py-4">
      <nav className="flex-1 space-y-6 overflow-y-auto px-3">
        {sidebarNavigation.map((group) => (
          <div key={group.id} className="space-y-1">
            {group.title && (
              <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                {groupLabelMap[group.id] ?? group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathWithoutLang === item.href;
                const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;

                return (
                  <SheetClose key={item.id} asChild>
                    <Link
                      href={`/${lang}${item.href}`}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{navItemLabelMap[item.id] ?? item.title}</span>
                      {item.id === "credits" && balance && (
                        <span className="ml-auto shrink-0 text-xs font-semibold text-amber-500">
                          {balance.availableCredits}
                        </span>
                      )}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {isFreeUser && (
        <div className="border-t border-border/50 px-3 pt-4">
          <SheetClose asChild>
            <button
              type="button"
              onClick={handleUpgradeClick}
              className="group relative w-full overflow-hidden rounded-xl bg-background p-[1px] text-left transition-transform hover:-translate-y-0.5"
            >
              <ShineBorder
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                borderWidth={1}
              />
              <div className="relative rounded-xl bg-gradient-to-br from-primary/15 via-background to-primary/5 p-3">
                <div className="relative mb-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {t("upgradeTitle")}
                  </span>
                </div>
                <p className="relative text-xs text-muted-foreground">
                  {t("upgradeSubtitle")}
                </p>
              </div>
            </button>
          </SheetClose>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden w-[200px] flex-col border-r border-border bg-background lg:flex">
        <DesktopNav />
      </aside>

      {mobileOpen && (
        <Sheet open={mobileOpen} onOpenChange={onMobileClose ? () => onMobileClose() : undefined}>
          <SheetContent position="left" className="w-[280px] p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="sr-only">
                <SheetTitle>{t("title")}</SheetTitle>
              </SheetHeader>
              <MobileNav />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
