import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { 
  getConversationByDocAndId, 
  deleteConversation,
  getConversationMessages 
} from "@/db/actions/messages_and_conversation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ documentId: string; conversationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, conversationId } = await params;
    const conversation = await getConversationByDocAndId(documentId, conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // const messages = await getConversationMessages(conversationId);

    return NextResponse.json(conversation );
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ documentId: string; conversationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, conversationId } = await params;
    const conversation = await getConversationByDocAndId(documentId, conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteConversation(conversationId);

    return NextResponse.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
