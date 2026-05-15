interface StudioPageShellProps {
  children: React.ReactNode;
}

export function StudioPageShell({ children }: StudioPageShellProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] p-8 dark:bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.06),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]">
      {children}
    </div>
  );
}
