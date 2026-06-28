export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout relative min-h-screen bg-[#F5F5F5]">
      {children}
    </div>
  );
}
