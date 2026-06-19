"use client";

import type { ComponentProps } from "react";

import { useSigninModal } from "@/hooks/use-signin-modal";
import { LocaleLink } from "@/i18n/navigation";
import { useSession } from "@/lib/auth/client";

type StudioLinkProps = Omit<ComponentProps<typeof LocaleLink>, "href">;

export function StudioLink({ onClick, prefetch = false, ...props }: StudioLinkProps) {
  const signInModal = useSigninModal();
  const { data: session } = useSession();

  const handleClick: NonNullable<StudioLinkProps["onClick"]> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (!session?.user) {
      event.preventDefault();
      signInModal.onOpen();
    }
  };

  return (
    <LocaleLink
      href="/studio"
      onClick={handleClick}
      prefetch={prefetch}
      {...props}
    />
  );
}
