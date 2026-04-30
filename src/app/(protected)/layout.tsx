import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from "@/components/sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  // Check if any user exists — redirect to setup if not
  const userCount = await db.user.count();
  if (userCount === 0) redirect("/setup");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={{ name: session.user.name ?? "", email: session.user.email ?? "" }} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
