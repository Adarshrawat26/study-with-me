interface DashboardShellProps {
  children: React.ReactNode;
}

/** Full-width dashboard wrapper (no sidebar — use main site navbar). */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="donezo-layout min-h-screen bg-gradient-to-b from-[#FAFAFA] via-[#FDF2F8]/30 to-[#F5F5F5]">
      <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
