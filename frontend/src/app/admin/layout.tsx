import { AdminDemoProvider } from "@/components/admin/admin-demo-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDemoProvider>{children}</AdminDemoProvider>;
}
