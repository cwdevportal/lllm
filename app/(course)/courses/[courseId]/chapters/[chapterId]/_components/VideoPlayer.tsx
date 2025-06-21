"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiSrore } from "@/hooks/use-confetti-store";
import { Button } from "@/components/ui/button"; // Ensure you have this

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  videoUrl: string | null;
  youtubeUrl?: string;
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
  videoUrl,
  youtubeUrl = "https://www.youtube.com/watch?v=zomiRD6ZQfo",
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const confetti = useConfettiSrore();
  const playerRef = useRef<HTMLIFrameElement>(null);

  const actualVideoUrl = videoUrl || youtubeUrl;

  const getGoogleDriveId = (url: string) => {
    const match = url.match(/\/file\/d\/(.*?)(\/|$)/);
    return match ? match[1] : null;
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const driveId = actualVideoUrl ? getGoogleDriveId(actualVideoUrl) : null;
  const videoId = actualVideoUrl ? getYouTubeVideoId(actualVideoUrl) : null;

  const onEnd = useCallback(async () => {
    try {
      await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        isCompleted: true,
      });

      setCompleted(true);

      if (!nextChapterId) {
        confetti.onOpen();
      }

      toast.success("Progress updated");
      router.refresh();

      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }
    } catch (err) {
      console.error("Error in onEnd:", err);
      toast.error("Something went wrong");
    }
  }, [courseId, chapterId, nextChapterId, router, confetti]);

  useEffect(() => {
    if (!videoId || isLocked || driveId) return;

    let player: YT.Player;

    const loadPlayer = () => {
      player = new window.YT.Player(playerRef.current!, {
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              if (completeOnEnd) {
                onEnd();
              }
            }
          },
        },
      });
    };

    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
      (window as any).onYouTubeIframeAPIReady = loadPlayer;
    } else if (window.YT?.Player) {
      loadPlayer();
    }

    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId, onEnd, isLocked, driveId, completeOnEnd]);

  if (!videoId && !driveId) return <p>Invalid video URL</p>;

  return (
    <div className="relative aspect-video space-y-4">
      {!isReady && !isLocked && !driveId && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-secondary" />
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary z-10">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}

      {!isLocked && (
        <>
          {driveId ? (
            <iframe
              title={title}
              className="w-full h-full"
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <iframe
              ref={playerRef}
              title={title}
              className={cn("w-full h-full", !isReady && "hidden")}
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </>
      )}

      {/* Fallback Mark Complete Button for Google Drive */}
      {!isLocked && driveId && !completed && (
        <div className="pt-4">
          <Button onClick={onEnd} className="w-full">
            Mark as complete
          </Button>
        </div>
      )}
    </div>
  );
};
