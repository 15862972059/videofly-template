interface StudioPageShellProps {
  children: React.ReactNode;
}

export function StudioPageShell({ children }: StudioPageShellProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}
