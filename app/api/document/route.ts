import { auth } from "@/lib/auth";
import { getDocumentsByUser } from "@/db/actions/document";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Read query params
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const result = await getDocumentsByUser(session.user.id, {
      page,
      limit,
      search,
      status,
    });

    return NextResponse.json({
      success: true,
      message: "Documents fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in GET /api/document:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}