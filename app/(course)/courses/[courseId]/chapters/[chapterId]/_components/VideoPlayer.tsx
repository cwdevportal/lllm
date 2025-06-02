"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiSrore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  videoUrl: string | null;
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
  videoUrl,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();
  const confetti = useConfettiSrore();
  const playerRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<YT.Player>();

  // Extract the YouTube video ID from a full watch URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

  // Called when the video ends (you can still track via the IFrame API)
  const onEnd = useCallback(async () => {
    try {
      await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        { isCompleted: true }
      );

      if (!nextChapterId) confetti.onOpen();

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

  // Initialize the YouTube IFrame API if videoId is valid and not locked
  useEffect(() => {
    if (!videoId || isLocked) return;

    let player: YT.Player;
    const loadPlayer = () => {
      player = new window.YT.Player(playerRef.current!, {
        videoId,
        playerVars: {
          autoplay: 0,           // don’t autoplay so we can manually trigger play
          controls: 0,           // hide all built-in YouTube controls
          modestbranding: 1,     // hide YouTube logo
          rel: 0,                // no related videos from other channels
          disablekb: 1,          // disable keyboard shortcuts
          iv_load_policy: 3,     // hide video annotations
          fs: 0,                 // disable fullscreen button
          showinfo: 0,           // no video title bar
        },
        events: {
          onReady: () => {
            ytPlayerRef.current = player;
            setIsReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnd();
              setIsPlaying(false);
            }
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    // Load the IFrame API script if not already present
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
  }, [videoId, isLocked, onEnd]);

  if (!videoId) return <p>Invalid video URL</p>;

  const togglePlayPause = () => {
    if (!ytPlayerRef.current) return;

    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
    } else {
      ytPlayerRef.current.playVideo();
    }
  };

  return (
    <div className="relative aspect-video" onContextMenu={(e) => e.preventDefault()}>
      {/* Spinner while the YT player is loading */}
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="w-4 h-4 animate-spin text-secondary" />
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-secondary gap-y-2">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}

      {/* The actual YT iframe (no native controls, no right-click) */}
      {!isLocked && (
        <iframe
          ref={playerRef}
          title={title}
          className={cn(!isReady && "hidden")}
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&controls=0&iv_load_policy=3&disablekb=1&fs=0`}
          style={{ border: "none", pointerEvents: "none" }}
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
        />
      )}

      {/* Custom Play/Pause button overlay */}
      {!isLocked && isReady && (
        <button
          onClick={togglePlayPause}
          className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
        >
          <Play className="h-5 w-5 text-gray-800" />
        </button>
      )}
    </div>
  );
};
