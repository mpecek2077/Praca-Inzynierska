import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminNav />
      {children}
    </div>
  );
}
