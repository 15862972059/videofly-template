import { StudioPageShell } from "@/components/studio/studio-page-shell";
import { Loader2 } from "lucide-react";

export default function StudioLoading() {
  return (
    <StudioPageShell>
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-slate-950 dark:border-t-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-950 dark:text-white">Loading Studio</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preparing your creative workspace...</p>
          </div>
        </div>
      </div>
    </StudioPageShell>
  );
}