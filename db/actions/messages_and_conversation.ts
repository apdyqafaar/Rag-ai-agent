import { db } from "@/db/db";
import { conversationsTable, IMessage, messagesTable } from "@/db/schema";
import { useGenerateId } from "@/lib/hooks";
import { UIMessage } from "ai";
import { eq, desc, and } from "drizzle-orm";

/**
 * CONVERSATION ACTIONS
 */

export async function createConversation(userId: string, documentId:string, title?: string) {
    if(!documentId) throw new Error("Document id is required")
    if(!userId) throw new Error("User id is required")
  const id = useGenerateId("conversation");
  await db.insert(conversationsTable).values({
    id,
    userId,
    title: title || "New Conversation",
    documentId
  });
  return id;
}

export async function getConversationById(id: string) {
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, id));
  return conversation;
}

export async function getUserConversations(userId: string) {
  return await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId))
    .orderBy(desc(conversationsTable.createdAt));
}

export async function getConversationsByDocument(documentId: string) {
  return await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.documentId, documentId))
    .orderBy(desc(conversationsTable.createdAt));
}

export async function getConversationByDocAndId(documentId: string, id: string) {
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.documentId, documentId),
        eq(conversationsTable.id, id)
      )
    );
  return conversation;
}

export async function updateConversationTitle(id: string, title: string) {
  await db
    .update(conversationsTable)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversationsTable.id, id));
}

export async function deleteConversation(id: string) {
  await db.delete(conversationsTable).where(eq(conversationsTable.id, id));
}

/**
 * MESSAGE ACTIONS
 */

export interface CreateMessageInput {
  id?: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  documentId?: string | null;
  context?: string | null;
}

// save msg
export const saveChat=async({conversationId, messages}: {conversationId:string, messages:UIMessage[]})=>{
     
    // get conversation first
    const conv=await getConversationById(conversationId)
  //  console.log("conv: ", conv)

    if(!conv) throw new Error("Conversation not Found")


    const exisitingMessages=await db.select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))

// collecting thier ids to filter latter
    const exisitingMessagesIds=new Set(exisitingMessages.map((m)=> m.id))

    // filtering to get the new messages and remove old ones which are in the database
    const newMessages= messages.filter((m)=> !exisitingMessagesIds.has(m.id))
    
 
    if(newMessages.length>0){

        // transforming to databse data
        const dbMessages:IMessage[]=newMessages.map((msg=>{
            const textPart=msg.parts.find(p=>p.type==="text")
            const content=textPart?.text || ""
          

            return{
                id:msg.id,
                content,
                conversationId:conversationId,
                role:msg.role,
                createdAt:new Date()
            }
        }))


        await db.insert(messagesTable).values(dbMessages)

        await db.update(conversationsTable)
        .set({updatedAt:new Date()})
        .where(eq(conversationsTable.id, conversationId))
    }
}



export async function getConversationMessages(conversationId: string) {
  return await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);
}

export async function deleteMessage(id: string) {
  await db.delete(messagesTable).where(eq(messagesTable.id, id));
}

export async function updateMessageContent(id: string, content: string) {
  await db
    .update(messagesTable)
    .set({ content })
    .where(eq(messagesTable.id, id));
}
