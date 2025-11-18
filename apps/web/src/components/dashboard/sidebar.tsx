"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@biolab/ui";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Calendar,
  FileCheck,
  DollarSign,
  BookOpen,
  Settings,
  Leaf,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Clienti", href: "/clients" },
  { icon: FileText, label: "Documenti", href: "/documents" },
  { icon: CheckSquare, label: "Task", href: "/tasks" },
  { icon: Calendar, label: "Sopralluoghi", href: "/inspections" },
  { icon: FileCheck, label: "Preventivi", href: "/quotes" },
  { icon: DollarSign, label: "Fatture", href: "/invoices" },
  { icon: BookOpen, label: "Knowledge Base", href: "/knowledge" },
  { icon: Settings, label: "Impostazioni", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 p-6 border-b border-gray-200 dark:border-gray-700">
        <Leaf className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-xl font-bold">BioLab</h1>
          <p className="text-xs text-gray-500">Consulting Platform</p>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
