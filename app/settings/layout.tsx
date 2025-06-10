import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex flex-col h-dvh items-center">
      <div className="w-full max-w-[1200px] px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeftIcon />
              Back to Chat
            </Link>
          </Button>
          <div className="flex gap-2 items-center">
            <ModeToggle />
            <Button variant="ghost">Sign out</Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}