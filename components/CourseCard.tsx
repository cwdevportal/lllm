"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";
import { useTransition, useState } from "react";

import { IconBadge } from "@/components/icon-badge";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/CourseProgress";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;   // original prop
  category: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress: incomingProgress,   // rename to avoid clash
  category,
}: CourseCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Fallback to 3 if progress is null or undefined
  const progress = incomingProgress ?? 3;

  const handleClick = () => {
    setIsLoading(true);
    startTransition(() => {
      router.push(`/courses/${id}`);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-left w-full group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full"
    >
      <div className="relative w-full aspect-video rounded-md overflow-hidden">
        <Image fill className="object-cover" alt={title} src={imageUrl} />
        {isLoading && isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Loader2 className="animate-spin text-sky-700 w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex flex-col pt-2">
        <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
          {title}
        </div>

        <p className="text-xs text-muted-foreground">{category}</p>

        <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
          <div className="flex items-center gap-x-1 text-slate-500">
            <IconBadge size="sm" icon={BookOpen} />
            <span>
              {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
            </span>
          </div>
        </div>

        {/* Show progress bar if progress exists, otherwise price */}
        {incomingProgress !== null ? (
          <CourseProgress
            variant={progress === 100 ? "success" : "default"}
            size="sm"
            value={progress}
          />
        ) : (
          <p className="text-md md:text-sm font-medium text-slate-700">
            {formatPrice(price)}
          </p>
        )}
      </div>
    </button>
  );
};
