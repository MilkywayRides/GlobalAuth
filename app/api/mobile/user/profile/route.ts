import { NextRequest } from "next/server";
import { validateMobileToken, createMobileResponse } from "@/lib/mobile-auth-middleware";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const validation = await validateMobileToken(req);
  
  if (validation.error || !validation.user) {
    return createMobileResponse({ error: validation.error || "Unauthorized" }, validation.status || 401);
  }

  try {
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, validation.user.id))
      .limit(1);

    if (!userData.length) {
      return createMobileResponse({ error: "User not found" }, 404);
    }

    return createMobileResponse({
      user: {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
        image: userData[0].image,
        createdAt: userData[0].createdAt,
      },
    });
  } catch (error) {
    return createMobileResponse({ error: "Failed to fetch profile" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const validation = await validateMobileToken(req);
  
  if (validation.error || !validation.user) {
    return createMobileResponse({ error: validation.error || "Unauthorized" }, validation.status || 401);
  }

  try {
    const { name, image } = await req.json();

    await db
      .update(user)
      .set({ name, image })
      .where(eq(user.id, validation.user.id));

    return createMobileResponse({ success: true, message: "Profile updated" });
  } catch (error) {
    return createMobileResponse({ error: "Failed to update profile" }, 500);
  }
}
