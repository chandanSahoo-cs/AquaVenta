import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2">
        <Button className="bg-white text-[#193b57] border-3 border-[#193b57] hover:bg-muted  w-36">
          Accept
        </Button>
        <Button className="w-36">Reject</Button>
      </div>
    </div>
  );
}
