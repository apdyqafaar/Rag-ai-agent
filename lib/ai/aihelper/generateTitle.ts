import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export interface TitleMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generates a short, descriptive title for a conversation using OpenAI.
 * Uses up to the first 4 messages of the conversation as context.
 *
 * @param messages - Array of conversation messages (role + content)
 * @returns A concise title string for the conversation
 */
export async function generateConversationTitle(
  messages: TitleMessage[]
): Promise<string> {
  // Take only the first 4 messages to keep the prompt concise
  const contextMessages = messages.slice(0, 4);

  const conversationSnippet = contextMessages
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n");

  const { text } = await generateText({
    model: openai("gpt-4.1-mini"),
    system: `You are a helpful assistant that generates concise, descriptive titles for conversations.
The title should:
- Be 3-8 words long
- Capture the main topic or intent of the conversation
- Be written in title case
- NOT include quotes, punctuation at the end, or labels like "Title:"
Respond with only the title text, nothing else.`,
    prompt: `Based on the following conversation snippet, generate a short title:\n\n${conversationSnippet}`,
  });

  return text.trim();
}
