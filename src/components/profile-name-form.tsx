"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateUserName } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileNameFormProps {
  currentName: string | null;
}

export function ProfileNameForm({ currentName }: ProfileNameFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const hasChanges = name !== (currentName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    startTransition(async () => {
      const result = await updateUserName({ name });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Name updated successfully!");
        setOpen(false);
        router.refresh();
        window.location.reload();
      }
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset name to current value when closing without saving
      setName(currentName || "");
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Name</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {currentName || "Not set"}
        </p>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="h-auto px-2 py-1">
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Name</DialogTitle>
              <DialogDescription>
                Update your display name. This will be visible to other users.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isPending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !hasChanges}>
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
