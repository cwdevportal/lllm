import { db } from '@/lib/db'
import React from 'react'
export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });

    const publishedChaptersIds = publishedChapters.map((chapter) => chapter.id);

    if (publishedChaptersIds.length === 0) {
      // No chapters published yet, return default progress (e.g., 2)
      return 2;
    }

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId: userId,
        chapterId: {
          in: publishedChaptersIds,
        },
        isCompleted: true,
      },
    });

    const progressPercentage =
      (validCompletedChapters / publishedChaptersIds.length) * 100;

    // If progress is 0 (user hasn't completed any), fallback to default value 2
    return progressPercentage > 0 ? progressPercentage : 2;
  } catch (error) {
    return 2; // Default value on error
  }
};
