import { auth } from "@/lib/auth";
import { getProcessingDocumentsByUser } from "@/db/actions/document";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const documents = await getProcessingDocumentsByUser(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Processing documents fetched successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Error in GET /api/document/processing:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
