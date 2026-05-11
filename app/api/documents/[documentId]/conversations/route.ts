import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getConversationsByDocument } from "@/db/actions/messages_and_conversation";
import { getDocumentById } from "@/db/actions/document";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

    // Check if document exists and user has access
    const document = await getDocumentById(documentId);
    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found", error: "Document not found" }, { status: 404 });
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
    }

    const conversations = await getConversationsByDocument(documentId);
    return NextResponse.json({ success: true, message: "Conversations fetched", data: conversations });
  } catch (error) {
    console.error("Error fetching document conversations:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error", error: "Internal Server Error" }, { status: 500 });
  }
}
