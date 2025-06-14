// app/api/admins/add/route.ts
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const body = await req.json();
    const { newAdminUserId } = body;

    // Only existing admins can add new admins
    const admin = await isAdmin(userId);
    if (!admin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!newAdminUserId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const existing = await db.admin.findUnique({
      where: { userId: newAdminUserId },
    });

    if (existing) {
      return new NextResponse("User is already an admin", { status: 400 });
    }

    const newAdmin = await db.admin.create({
      data: { userId: newAdminUserId },
    });

    return NextResponse.json(newAdmin);
  } catch (error) {
    console.error("[ADMIN_ADD]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
