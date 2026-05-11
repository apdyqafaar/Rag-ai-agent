import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createConversation } from "@/db/actions/messages_and_conversation";
import { getDocumentById } from "@/db/actions/document";

export async function POST(req: Request) {
  try {
    // 1. Check user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { documentId, title } = await req.json();

    // 2. Validate input
    if (!documentId) {
      return NextResponse.json({ success: false, message: "Document ID is required", error: "Document ID is required" }, { status: 400 });
    }

    // 3. Check if document exists and belongs to the user (or just exists if shared)
    // The requirement said "check userid and docuemtid exist"
    const document = await getDocumentById(documentId);
    if (!document) {
      return NextResponse.json({ success: false, message: "Document not found", error: "Document not found" }, { status: 404 });
    }

    // Optional: Verify ownership if needed
    if (document.userId !== userId) {
        return NextResponse.json({ success: false, message: "You do not have access to this document", error: "You do not have access to this document" }, { status: 403 });
    }

    // 4. Create the conversation
    const conversationId = await createConversation(userId, documentId, title);

    return NextResponse.json({
      success: true,
      message: "Conversation created successfully",
      data: { conversationId }
    });
  } catch (error) {
    console.error("Error in create-conversation route:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
