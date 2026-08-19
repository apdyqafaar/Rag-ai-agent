// import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, createIdGenerator, stepCountIs, streamText, UIMessage, validateUIMessages } from "ai";
import { generateSingleEmbedding } from "@/lib/ai/embedding";
import { getSimilarity } from "@/lib/ai/pinecone";
import { NextResponse } from "next/server";
import { getConversationById, getConversationMessages, getDocumentById, saveChat, updateConversationTitle } from "@/db/actions";
import { auth } from "@/lib";
import { headers } from "next/headers";
import { generateConversationTitle } from "@/lib/ai/aihelper";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { messages, message: singleMessage, selectedDocumentId, conversationId } = await req.json();
    console.log("messages", messages)
    console.log("singleMessage", singleMessage)
    console.log("selectedDocumentId", selectedDocumentId)

    // first check if conversations exists
    const conversation = await getConversationById(conversationId)
    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }


    // Get the last message from the user
    // const lastMessage = messages[messages.length - 1];

    if (!selectedDocumentId || !conversationId) {
      return new Response("Document id and conversatiob id is required", { status: 400 });
    }

    let allMessages: any
    let messageText: string=singleMessage?.parts?.find((p:any)=>p.type==="text")?.text || ""
    if (singleMessage) {
      const previousMessage=await getConversationMessages(conversationId)
      // console.log("previousMessage", previousMessage)
      allMessages = [...previousMessage,singleMessage]
    } else if (messages && messages.length > 0) {
       allMessages = [...messages,singleMessage]
    } else {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

     const validatedMessages = allMessages.map((msg: any) => {
  // Normalize content
  let content = msg.content

  if (!content && msg.parts && Array.isArray(msg.parts)) {
    content = msg.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text || "")
      .join(" ")
  }

  // Return only fields convertToModelMessages needs
  return {
    id: msg.id,
    role: msg.role,
    content: content || "",
    parts: msg.parts ?? [{ type: "text", text: content || "" }],
  }
})

// console.log("validatedMessages", validatedMessages)
    let context = ""
    if (selectedDocumentId && messageText) {
      const doc = await getDocumentById(selectedDocumentId)
      if (!doc) {
        return new Response("Document not found", { status: 404 });
      }
      const embedding = await generateSingleEmbedding(messageText)
      const sources = await getSimilarity(embedding.embedding, 20, { documentId: { $eq: selectedDocumentId } })

      const chunkContext = sources.slice(0, 10).map((source, i) => `source:${i} -----Title: ${source.documentTitle}\nContent: ${source.content}  similarity:${source.similarity}`).join("\n\n---\n\n")
      context = `You have to answer the user's question based on the context provided below. if the answer is not in the context then say i dont have the answer 
    
    --- Retrieved Context ---
    ${chunkContext}

    Use the sources to answer the question, but dont 
    `
    }

  console.log("validatedMessages", validatedMessages)
    // 4. Create the system prompt with the retrieved context
  const systemPrompt = `You are a helpful, friendly AI assistant with access to a knowledge base through retrieval-augmented search.

Your job is to answer the user's question using the retrieved context below as your primary source of truth. Follow these guidelines:

1. **Ground your answers in the context.** Base your response primarily on the retrieved context provided below. Quote or paraphrase relevant details naturally, as if you already knew them.

2. **Be transparent about gaps.** If the context only partially answers the question, answer what you can from it and clearly note what's missing. If the context doesn't contain the answer at all, let the user know the knowledge base didn't have relevant info, then offer a helpful answer from your general knowledge — clearly flagged as such (e.g., "I couldn't find this in the provided sources, but based on general knowledge...").

3. **Don't fabricate sources.** Never imply information came from the context if it didn't. If you're unsure whether something is supported, say so rather than guessing confidently.

4. **Cite when possible.** If the context includes titles, filenames, or source identifiers, reference them briefly (e.g., "According to [source]...") so the user knows where the info came from.

5. **Keep it conversational.** Write like a knowledgeable friend, not a search engine — clear, warm, and to the point. Avoid unnecessary hedging or robotic phrasing, but stay accurate.

6. **Ask when it helps.** If the question is ambiguous and the context contains multiple plausible answers, briefly ask for clarification instead of guessing.

--- Retrieved Context ---
${context}
-------------------------

Answer the user's question below using the context above as your foundation.`;

    // 5. Generate the response using OpenAI and stream it back
    const result =  streamText({
      model: openrouter("openai/gpt-5.6-luna"),
      system: systemPrompt,
      prompt:await convertToModelMessages(validatedMessages),
      stopWhen:stepCountIs(5)
    });
    result.consumeStream()

    return result.toUIMessageStreamResponse({
      originalMessages: allMessages,
      generateMessageId: createIdGenerator({ prefix: "msg_", size: 16 }),
      onFinish: async ({ messages }) => {

        try {

          if(messages && messages.length>3 &&messages.length<5 ){
            const content=messages.map((msg:any)=>{
              return {
                role:msg.role,
                content:msg.content || (msg.parts?.map((p:any)=>p.text) || "").join(" "),
              }
            })
            const title=await generateConversationTitle(content)
            console.log("title: ", title)
            await updateConversationTitle(conversationId,title)
          }
          await saveChat({ conversationId, messages })
        } catch (error) {

        }
      }
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
