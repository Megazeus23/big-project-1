"use client";

import { signOut } from "next-auth/react";
import { Button } from "@biolab/ui/components/button";
import { Bell, LogOut, User } from "lucide-react";

export function Header({ user }: { user: { name?: string | null } | null | undefined }) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Benvenuto, {user?.name || "User"}</h2>
          <p className="text-sm text-gray-500">Gestisci le tue certificazioni biologiche</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="outline" onClick={() => signOut()} className="gap-2">
            <LogOut className="h-4 w-4" />
            Esci
          </Button>
        </div>
      </div>
    </header>
  );
}
