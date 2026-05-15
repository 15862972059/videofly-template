"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GenerationJobData } from "@/types/ai-photo";
import { GenerationHistoryGrid } from "@/components/generations/generation-history-grid";

export default function GenerationsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<GenerationJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/image/generations?limit=50");
      if (!res.ok) throw new Error("Failed to fetch generations");
      const data = await res.json();
      if (data.success) {
        setJobs(data.data.jobs);
      } else {
        throw new Error(data.error || "Failed to fetch generations");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Generations</h1>
        <p className="text-muted-foreground text-lg">
          View your AI generation history and download your creations.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : (
        <GenerationHistoryGrid
          jobs={jobs}
          onSelect={(job) => {
            if (job.result_image_key) {
              router.push(`/studio?result=${job.id}`);
            }
          }}
        />
      )}
    </div>
  );
}
