import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getConversationsByDocument, createConversation } from "@/db/actions/messages_and_conversation";
import { Loader2 } from "lucide-react";

export default async function DocumentChatPage({
  params
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Fetch existing conversations
  const conversations = await getConversationsByDocument(documentId);

  let targetConversationId: string;

  if (conversations && conversations.length > 0) {
    // Redirect to the first conversation
    targetConversationId = conversations[0].id;
  } else {
    // Create a new conversation
    targetConversationId = await createConversation(session.user.id, documentId, "New Conversation");
  }

  // Perform redirect
  redirect(`/chat/${documentId}/${targetConversationId}`);

  // This will only render briefly if redirect is delayed
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Setting up your conversation...</p>
      </div>
    </div>
  );
}