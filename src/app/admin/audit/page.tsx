import type { Metadata } from "next";
import { getAuditLogsAction } from "@/server/actions/admin.actions";
import { ScrollText, User, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Audit Log",
  description: "View platform audit trail.",
};

export default async function AdminAuditPage() {
  const logs = await getAuditLogsAction();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Security and compliance event trail
        </p>
      </div>

      {(logs as Array<Record<string, unknown>>).length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {(logs as Array<Record<string, unknown>>).map((log) => {
                  const user = log.user as { name: string; email: string } | null;
                  return (
                    <tr key={log.id as string} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {log.action as string}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{user?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {log.entityType as string}:{" "}
                        <span className="font-mono text-xs">{(log.entityId as string)?.slice(0, 8)}…</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.createdAt as string).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed">
          <ScrollText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold">No audit entries</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Privileged actions will be logged here.
          </p>
        </div>
      )}
    </div>
  );
}
