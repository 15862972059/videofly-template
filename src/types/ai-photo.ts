export interface ClassicImageData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  subcategory?: string | null;
  prompt_template: string;
  hero_image_url: string;
  thumbnail_url: string;
  is_active?: boolean;
  created_at?: string;
}

export interface GenerationJobData {
  id: string;
  user_id: string;
  customer_id?: string | null;
  type: "remix" | "text";
  status: "queued" | "running" | "succeeded" | "failed";
  classic_image_id?: string | null;
  prompt?: string | null;
  source_image_key?: string | null;
  result_image_key?: string | null;
  result_image_url?: string | null;
  credits_reserved: number;
  error_message?: string | null;
  created_at?: string;
  completed_at?: string | null;
}

export interface StudioViewer {
  userId?: string;
  user?: {
    email?: string;
    name?: string;
    image?: string;
  };
  credits: number;
}

export interface StudioHistoryItem {
  id: string;
  type: "remix" | "text";
  status: "queued" | "running" | "succeeded" | "failed";
  prompt: string | null;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  resultUrl: string | null;
  sourceUrl: string | null;
  scene: { title: string; hero_image_url: string } | null;
}

export interface UploadedImage {
  objectKey: string;
  publicUrl: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export type GenerationType = "remix" | "text";
export type GenerationStatus = "queued" | "running" | "succeeded" | "failed";
