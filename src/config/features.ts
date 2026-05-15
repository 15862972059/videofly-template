export const featureFlags = {
  showVideoFeatures: process.env.NEXT_PUBLIC_SHOW_VIDEO_FEATURES === "true",
  showImageFeatures: true,
} as const;
