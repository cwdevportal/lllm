// /app/(teacher)/layout.tsx
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  const allowed = await isTeacher(userId);
  if (!allowed) {
    return redirect('/');
  }

  return <>{children}</>;
};

export default TeacherLayout;
