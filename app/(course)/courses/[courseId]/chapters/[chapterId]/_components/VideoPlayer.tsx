"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiSrore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  playbackId: string; // unused now but keep for interface compatibility
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  youtubeUrl?: string; // optional, defaults to your sample
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
  youtubeUrl = "https://www.youtube.com/watch?v=Big_aFLmekI&t=6268s",
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiSrore();

  // Extract YouTube video ID from the URL
  const getYouTubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(youtubeUrl);

  const playerRef = useRef<HTMLIFrameElement>(null);

  // Listen for video end event via YouTube IFrame API
  // For simplicity, we will add a YouTube iframe API to detect end

  useEffect(() => {
    if (!videoId) return;

    // Load YouTube Iframe API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    let player: YT.Player;

    // YouTube API ready callback
    (window as any).onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player(playerRef.current!, {
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // YT.PlayerState.ENDED === 0
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnd();
            }
          },
        },
      });
    };

    // If YT is already loaded, initialize player immediately
    if (window.YT && window.YT.Player) {
      player = new window.YT.Player(playerRef.current!, {
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnd();
            }
          },
        },
      });
    }

    return () => {
      if (player && player.destroy) player.destroy();
    };
  }, [videoId]);

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (!videoId) return <p>Invalid YouTube URL</p>;

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="w-4 h-4 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}
      {!isLocked && (
        <iframe
          ref={playerRef}
          title={title}
          className={cn(!isReady && "hidden")}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}
    </div>
  );
};
