"use client";

import type { UserWithReportStats } from "@/actions/user.actions";
import { banUser, getUsersWithReportStats } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [users, setUsers] = useState<UserWithReportStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsersWithReportStats();
      setUsers(data);
    };
    fetchData();
  }, []);

  const handleBan = async (userId: string) => {
    setLoading(true);
    try {
      const data = await banUser();
      if (data.success) toast.success("User banned successfully");
      else throw new Error("Failed to ban user");
      setUsers((prev) => prev.filter((u) => u.id !== userId)); // remove banned user from table
    } catch (error) {
      toast.error("Failed to ban user");
      console.error("Error banning user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>

      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-gray-300">User</th>
            <th className="p-2 border border-gray-300">Email</th>
            <th className="p-2 border border-gray-300">Accepted Reports</th>
            <th className="p-2 border border-gray-300">Rejected Reports</th>
            <th className="p-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="p-2 border border-gray-300">{user.name ?? "—"}</td>
              <td className="p-2 border border-gray-300">
                {user.email ?? "—"}
              </td>
              <td className="p-2 border border-gray-300">
                {user.acceptedCount}
              </td>
              <td className="p-2 border border-gray-300">
                {user.rejectedCount}
              </td>
              <td className="p-2 border border-gray-300">
                <Button
                  variant="destructive"
                  disabled={loading}
                  onClick={() => handleBan(user.id)}>
                  Ban User
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
