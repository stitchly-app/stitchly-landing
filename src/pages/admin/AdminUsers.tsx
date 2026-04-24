import { AdminSidebar } from "@/components/AdminSidebar";
import { UsersManagement } from "@/components/admin/UsersManagement";

export default function AdminUsers() {
  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Users</h1>
          <UsersManagement />
        </div>
      </main>
    </div>
  );
}
