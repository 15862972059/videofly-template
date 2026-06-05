"use client";

import { SignInModalContent } from "@/components/sign-in-modal";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { useMounted } from "@/hooks/use-mounted";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "next-intl";

export const ModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mounted = useMounted();
  const signInModal = useSigninModal();
  const locale = useLocale();

  return (
    <>
      {children}
      {mounted && (
        <Dialog open={signInModal.isOpen} onOpenChange={(open) => {
          if (open) {
            signInModal.onOpen();
          } else {
            signInModal.onClose();
          }
        }}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-[28rem] gap-0 overflow-hidden rounded-[28px] border border-slate-200/90 bg-white p-0 shadow-[0_24px_80px_rgba(15,23,42,0.16)] md:rounded-[28px]">
            {/* Hidden title for accessibility */}
            <DialogTitle className="sr-only">
              Sign In
            </DialogTitle>
            <SignInModalContent lang={locale} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
