"use client";

import Image from "next/image";
import type { GenerationJobData } from "@/types/ai-photo";

interface GenerationHistoryGridProps {
  jobs: GenerationJobData[];
  onSelect?: (job: GenerationJobData) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function GenerationCard({
  job,
  onSelect,
}: {
  job: GenerationJobData;
  onSelect?: (j: GenerationJobData) => void;
}) {
  const hasImage = !!job.result_image_key;
  const isLoading = job.status === "queued" || job.status === "running";

  return (
    <button
      onClick={() => onSelect?.(job)}
      className="group relative overflow-hidden rounded-xl bg-muted aspect-square text-left hover:ring-2 hover:ring-primary transition-all"
      disabled={isLoading}
    >
      {hasImage ? (
        <Image
          src={job.result_image_key!}
          alt={`Generation ${job.id}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground capitalize">
                {job.status}...
              </span>
            </div>
          ) : job.status === "failed" ? (
            <div className="text-destructive text-center p-4">
              <p className="text-sm font-medium">Generation Failed</p>
              {job.error_message && (
                <p className="text-xs text-muted-foreground mt-1">
                  {job.error_message}
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white/80 capitalize">
          {job.type} &bull; {formatDate(job.created_at ?? "")}
        </p>
      </div>
    </button>
  );
}

export function GenerationHistoryGrid({
  jobs,
  onSelect,
}: GenerationHistoryGridProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No generations yet. Start creating!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {jobs.map((job) => (
        <GenerationCard key={job.id} job={job} onSelect={onSelect} />
      ))}
    </div>
  );
}
