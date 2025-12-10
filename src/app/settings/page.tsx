import { redirect } from "next/navigation";

import { DeveloperRoleToggle } from "@/components/developer-role-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and developer status
        </p>
      </div>

      <Separator />

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Name</p>
            <p className="text-muted-foreground text-sm">
              {session.user.name || "Not set"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Email</p>
            <p className="text-muted-foreground text-sm">
              {session.user.email || "Not set"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Current Role</p>
            <div>
              <Badge
                variant={
                  session.user.role === "developer" ? "default" : "secondary"
                }
              >
                {session.user.role === "developer" ? "Developer" : "User"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Role Toggle */}
      <DeveloperRoleToggle currentRole={session.user.role} />
    </div>
  );
}
