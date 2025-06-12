"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function NavTabs() {
  const pathname = usePathname();
  const navigationItems = [
    { href: "/settings/", label: "Account" },
    { href: "/settings/customization", label: "Customization" },
    { href: "/settings/history", label: "History & Export" },
    { href: "/settings/models", label: "Models" },
    { href: "/settings/api-keys", label: "API Keys" },
  ];

  const currentTab =
    navigationItems.find((item) => pathname === item.href)?.href ||
    navigationItems[0]?.href;

  return (
    <Tabs value={currentTab} className="overflow-x-auto no-scrollbar mb-2">
      <TabsList>
        {navigationItems.map((item) => (
          <TabsTrigger
            key={item.href}
            value={item.href}
            className="flex-1"
            asChild
          >
            <Link href={item.href}>{item.label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
