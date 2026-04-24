import { AdminSidebar } from "@/components/AdminSidebar";
import { StorageOverview } from "@/components/admin/StorageOverview";
import { VideosList } from "@/components/admin/VideosList";

export default function AdminStorage() {
  return (
    <div className="flex h-screen overflow-hidden bg-secondary">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Storage</h1>
            <p className="text-muted-foreground mt-1">Manage system storage and files</p>
          </div>

          <div className="space-y-6">
            <StorageOverview />
            <VideosList />
          </div>
        </div>
      </main>
    </div>
  );
}