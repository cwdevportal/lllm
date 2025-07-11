"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  isCompleted,
  courseId,
  isLocked,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : PlayCircle;
  const isActive = pathname?.includes(id);

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 dark:text-gray-400 text-sm font-medium pl-6 transition-all",
        "hover:text-slate-600 dark:hover:text-gray-100 hover:bg-slate-300/20 dark:hover:bg-gray-700/40",
        isActive &&
          "text-slate-700 dark:text-white bg-slate-200/20 dark:bg-gray-800 hover:bg-slate-200/20 dark:hover:bg-gray-800",
        isCompleted &&
          "text-emerald-700 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400",
        isCompleted &&
          isActive &&
          "bg-emerald-200/20 dark:bg-emerald-900/30"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn(
            "text-slate-500 dark:text-gray-400",
            isActive && "text-slate-700 dark:text-white",
            isCompleted && "text-emerald-700 dark:text-emerald-400"
          )}
        />
        {label}
      </div>
      <div
        className={cn(
          "ml-auto opacity-0 border-2 border-slate-700 dark:border-gray-300 h-full transition-all",
          isActive && "opacity-100",
          isCompleted && "border-emerald-700 dark:border-emerald-400"
        )}
      />
    </button>
  );
};
