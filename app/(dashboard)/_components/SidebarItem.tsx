"use client"

import { cn } from "@/lib/utils";
import { LucideIcon, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState } from "react";

interface SideBarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const SidebarItem = ({ icon: Icon, label, href }: SideBarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => {
    setIsLoading(true);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <button
      onClick={onClick}
      type="button"
      disabled={isPending}
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive && "text-sky-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700",
        isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        {isLoading && isPending ? (
          <Loader2 size={22} className="animate-spin text-sky-700" />
        ) : (
          <Icon size={22} className={cn("text-slate-500", isActive && "text-sky-700")} />
        )}
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-sky-700 h-full transition-all",
          isActive && "opacity-100"
        )}
      />
    </button>
  );
};
