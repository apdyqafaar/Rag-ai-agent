import { auth } from "@/lib/auth";
import { db } from "@/db/db";
import { session as sessionTable } from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.userId, session.user.id));

    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Ensure the user owns the session they are trying to delete
    await db
      .delete(sessionTable)
      .where(
        and(
          eq(sessionTable.id, sessionId),
          eq(sessionTable.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to revoke session" }, { status: 500 });
  }
}
