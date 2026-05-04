import { auth } from "@/lib/auth";
import { db } from "@/db/db";
import { user as userTable } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 const currentUser = await db.query.user.findFirst({
  where: eq(userTable.id, session.user.id),
  with: {
    accounts: {
      columns:{
        providerId:true,
      }
    }, 
  },
});
  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(currentUser);
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, image } = body;

    // BetterAuth might have its own way to update these, 
    // but the user specifically asked for a custom route.
    // Note: Updating email might require verification depending on BetterAuth config.
    
    const updatedUser = await db
      .update(userTable)
      .set({
        name: name ?? undefined,
        email: email ?? undefined,
        image: image ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id))
      .returning();

    return NextResponse.json(updatedUser[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
