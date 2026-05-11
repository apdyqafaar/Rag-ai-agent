import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getConversationByDocAndId, getConversationMessages } from "@/db/actions/messages_and_conversation";
import { getDocumentById } from "@/db/actions/document";
import { ChatArea } from "@/app/chat/_components/ChatArea";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ documentId: string; conversationId: string }>
}) {
  const { documentId, conversationId } = await params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const document = await getDocumentById(documentId);
  if (!document) {
    redirect("/dashboard");
  }

  const conversation = await getConversationByDocAndId(documentId, conversationId);
  if (!conversation || conversation.userId !== session.user.id) {
    redirect(`/chat/${documentId}`);
  }

  const initialMessages = await getConversationMessages(conversationId);

  return (

    <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-muted/20">
      <ChatArea 
        documentId={documentId} 
        conversationId={conversationId} 
        initialMessages={initialMessages} 
      />
    </div>
  );
}
