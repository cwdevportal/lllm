import { db } from "@/lib/db";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/CoursesList";
import { auth } from "@clerk/nextjs";
import { Categories } from "../search/_components/Categories";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";
import { CheckCircle, Clock } from "lucide-react";


export default async function Dashboard() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

  const dashboardData = (await getDashboardCourses(userId)) ?? {};
  const {
    completedCourses = [],      // default to empty array if undefined
    coursesInProgress = [],     // default to empty array if undefined
  } = dashboardData;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length ?? 0}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={completedCourses.length ?? 0}
          variant="success"
        />
      </div>
      
              <Categories items={categories} />
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}
