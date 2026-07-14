"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GenerationResultProps {
  result: {
    objectKey: string;
    publicUrl: string;
  };
  inline?: boolean;
  aspectRatio?: "1:1" | "3:4" | "9:16" | "16:9";
  showActions?: boolean;
}

const aspectRatioMap: Record<NonNullable<GenerationResultProps["aspectRatio"]>, string> = {
  "1:1": "1 / 1",
  "3:4": "3 / 4",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

export function GenerationResult({
  result,
  inline,
  aspectRatio = "3:4",
  showActions,
}: GenerationResultProps) {
  const t = useTranslations("Studio.generationResult");
  const [isMobileShareSupported, setIsMobileShareSupported] = useState(false);

  useEffect(() => {
    setIsMobileShareSupported(!!navigator.share);
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/v1/image/download?url=${encodeURIComponent(result.publicUrl)}`;
    link.download = "ai-art-generation.png";
    link.click();
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: t("shareTitle"),
        text: t("shareText"),
        url: result.publicUrl,
      });
    } catch {
      // user cancelled
    }
  };

  const handleShareX = () => {
    const text = t("shareText") || "Check out my AI-generated image!";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(result.publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareReddit = () => {
    const title = t("shareTitle") || "My AI Art Creation";
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(result.publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(result.publicUrl);
      toast.success(t("linkCopied") || "Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const displayActions = showActions ?? !inline;

  return (
    <div
      className={`relative rounded-[1.5rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}
      style={inline ? { aspectRatio: aspectRatioMap[aspectRatio] } : undefined}
    >
      <img
        src={result.publicUrl}
        alt={t("alt")}
        className="w-full h-full object-cover"
      />
      {displayActions && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent flex justify-between gap-2">
          <Button size="sm" className="gap-1.5 flex-1 bg-white text-slate-950 hover:bg-slate-100" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> {t("save")}
          </Button>
          {isMobileShareSupported ? (
            <Button size="sm" variant="secondary" className="gap-1.5 flex-1 bg-slate-950/55 text-white hover:bg-slate-950/70 border border-white/15" onClick={handleNativeShare}>
              <Share2 className="w-3.5 h-3.5" /> {t("share")}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="gap-1.5 flex-1 bg-slate-950/55 text-white hover:bg-slate-950/70 border border-white/15">
                  <Share2 className="w-3.5 h-3.5" /> {t("share")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleShareX}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <span>{t("shareX")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleShareReddit}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547a8.303 8.303 0 0 0-2.636-.152c-.042.004-.084.012-.126.02v.001h-.009c-.035.006-.069.011-.104.02h-.003c-.074.017-.148.038-.22.063l-.002.001c-.067.023-.133.049-.198.078a2.463 2.463 0 0 0-.17.073l-.006.004-.163.069s-.003 0-.003.002c-.05.025-.1.05-.149.078l-.008.007-.152.078a5.308 5.308 0 0 0-.264.154l-.026.017c-.242.15-.472.32-.688.51l-.02.018c-.023.022-.048.044-.07.067l-3.187-1.015a1.25 1.25 0 0 1-.931-.119 1.249 1.249 0 1 1-.68 2.315c-.084-.021-.164-.052-.239-.091l2.855 1.621a8.347 8.347 0 0 0-.34 1.124L7.256 10.5c.016.011.03.023.046.034l-.046-.034A1.248 1.248 0 0 0 6.3 12.076c.305.371.715.604 1.138.662.074.01.148.015.222.011.066-.003.131-.014.195-.031l.001.001c.197-.05.38-.14.543-.264l1.91 1.34c-.108.127-.177.26-.23.38-.553.242-.982.556-1.13.8-.097.179-.1.349.036.515.084.072.2.115.299.145.218.18.686.181.934.085.735-.344.85-1.49.85-1.49h.001s.092-.71.46-1.159c.376-.458 1.009-.71 2.198-.905 2.51-.48 3.912-1.433 4.102-1.776.08-.06.163-.126.249-.198l-.08.022s2.136-1.096 2.522-1.156c.24-.05.484-.054.73-.05.295-.38.53-.772.718-1.158a8.395 8.395 0 0 0-.28-1.468c-.309-.747-.707-1.416-1.187-1.952l2.682.588zM8.58 16.891s.166.635.674.873c.44.058 1.114-.057 1.334-.68.2-.7-.026-1.362-.248-1.627 0 0-.645.263-1.76 1.434zM8.906 17a.5.5 0 0 1 .254.064l-.254-.064zm5.473-.164c.257.147.435.263.645.358.545.177 1.314.214 1.83-.028a.868.868 0 0 0 .421-.421c.146-.386-.096-.846-.8-1.295-.71-.38-1.524-.5-2.05-.572-.034.09-.058.211-.013.333.027.053.06.107.097.16.177.262.501.448.883.553.135.03.269.05.408.07.084.05.172.113.246.175-.257.06-.526.116-.79.083l-.008-.004c-.306-.09-.544-.299-.643-.568-.033-.046-.046-.097-.036-.143-.022.078-.02.164.01.247.037.095.104.19.208.282.223.208.545.364.99.36l.008.001c.143.004.253-.021.355-.06-.281.267-.563.436-.811.46z"/></svg>
                  <span>{t("shareReddit")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleCopyLink}>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t("copyLink")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
