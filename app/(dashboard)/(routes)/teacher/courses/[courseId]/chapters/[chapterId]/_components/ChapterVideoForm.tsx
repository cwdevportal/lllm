"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, VideoIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";

import { Button } from "@/components/ui/button";

interface ChapterVideoProps {
  initialData: Chapter;
  chapterId: string;
  courseId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

function getYouTubeEmbedUrl(videoUrl: string): string {
  try {
    const url = new URL(videoUrl);

    // Handles both youtu.be and youtube.com formats
    if (url.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }

    const videoId = url.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  } catch (e) {
    return "";
  }
}

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState(initialData.videoUrl || "");
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              {initialData.videoUrl ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit video
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add a video
                </>
              )}
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        !initialData.videoUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <VideoIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <iframe
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl(initialData.videoUrl)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-md w-full h-full"
            ></iframe>
          </div>
        )
      )}

      {isEditing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = formSchema.safeParse({ videoUrl: videoUrlInput });
            if (!parsed.success) {
              toast.error("Please enter a valid video URL");
              return;
            }
            onSubmit({ videoUrl: videoUrlInput });
          }}
        >
          <input
            type="text"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            placeholder="Paste YouTube video URL (e.g. https://youtu.be/xyz)"
            className="w-full px-4 py-2 border rounded-md mt-4"
          />
          <Button type="submit" className="mt-2">
            Save Video
          </Button>
          <div className="text-xs text-muted-foreground mt-2">
            Paste a valid YouTube link like: https://youtu.be/WvfAiue3ji8
          </div>
        </form>
      )}

      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          If the video doesn&apos;t appear, ensure it&apos;s a valid public YouTube video.
        </div>
      )}
    </div>
  );
};
