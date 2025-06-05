import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("unauthorized", { status: 404 });
    }

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      },
      include: {
        chapters: true // ✅ no muxData here
      }
    });

    if (!course) {
      return new NextResponse("course not found", { status: 404 });
    }

    const hasPublishedChapter = course.chapters.some((chapter) => chapter.isPublished);

    if (
      !hasPublishedChapter ||
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId
    ) {
      return new NextResponse("missing required fields", { status: 401 });
    }

    const publishedCourse = await db.course.update({
      where: {
        id: params.courseId,
        userId,
      },
      data: {
        isPublished: true,
      },
    });

    return NextResponse.json(publishedCourse);
  } catch (error) {
    return new NextResponse("internal error", { status: 500 });
  }
}
