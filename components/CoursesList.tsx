"use client";

import { useEffect, useState } from "react";
import { Category, Course } from "@prisma/client";
import { CourseCard } from "@/components/CourseCard";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface CoursesListProps {
  items: CourseWithProgressWithCategory[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
  const [filteredItems, setFilteredItems] = useState<CourseWithProgressWithCategory[]>([]);

  useEffect(() => {
    const formData = localStorage.getItem("formData");
    if (!formData) return;

    try {
      const parsed = JSON.parse(formData);
      const selectedCourseTitle = parsed?.course?.toLowerCase().trim();

      if (selectedCourseTitle) {
        const filtered = items.filter((course) => {
          const courseTitle = course.title?.toLowerCase().trim();
          return courseTitle === selectedCourseTitle;
        });

        console.log("🎯 Matching course(s):", filtered);
        setFilteredItems(filtered);
      }
    } catch (err) {
      console.error("❌ Error parsing formData:", err);
    }
  }, [items]);

  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {filteredItems.map((item, index) => {
          console.log(`📦 Rendering course #${index + 1}:`, {
            id: item.id,
            title: item.title,
            price: item.price,
            imageUrl: item.imageUrl,
            chaptersCount: item.chapters.length,
            progress: item.progress,
            category: item.category?.name,
          });

          return (
            <CourseCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl!}
              chaptersLength={item.chapters.length}
              price={item.price!}
              progress={item.progress}
              category={item.category?.name!}
            />
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No courses found
        </div>
      )}
    </div>
  );
};
