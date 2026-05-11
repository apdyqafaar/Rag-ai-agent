import { api } from "@/lib/api/client";
import { IConversation, IMessage } from "@/db/schema";

export class ConversationMessagesService {
  /**
   * Fetch all conversations for a specific document
   */
  async getDocumentConversations(documentId: string) {
    try {
      const response = await api.get<IConversation[]>(`/documents/${documentId}/conversations`);
      return response;
    } catch (error) {
      console.error("Error fetching document conversations", error);
      throw error;
    }
  }

  /**
   * Fetch a specific conversation and its messages
   */
  async getConversationAndMessages(documentId: string, conversationId: string) {
    try {
      const response = await api.get<IConversation & { messages: IMessage[] }>(
        `/documents/${documentId}/conversations/${conversationId}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching conversation messages", error);
      throw error;
    }
  }

  /**
   * Create a new conversation for a document
   */
  async createConversation(documentId: string, title?: string) {
    try {
      const response = await api.post<{ conversationId: string }>(
        "/create-conversation",
        { documentId, title }
      );
      return response;
    } catch (error) {
      console.error("Error creating conversation", error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(documentId: string, conversationId: string) {
    try {
      const response = await api.delete<{ message: string }>(
        `/documents/${documentId}/conversations/${conversationId}`
      );
      return response;
    } catch (error) {
      console.error("Error deleting conversation", error);
      throw error;
    }
  }

  /**
   * Update the title of a conversation
   */
  async updateConversationTitle(documentId: string, conversationId: string, title: string) {
    try {
      const response = await api.put<{ message: string }>(
        `/documents/${documentId}/conversations/${conversationId}`,
        { title }
      );
      return response;
    } catch (error) {
      console.error("Error updating conversation title", error);
      throw error;
    }
  }
  /**
   * Send a message to the chat API
   * Note: The /api/chat route returns a stream. For React components, 
   * it's recommended to use the `useChat` hook from `@ai-sdk/react` directly.
   * This service uses standard fetch to allow reading the streamed response.
   */
//   async sendMessage(documentId: string, conversationId: string, messages: any[], singleMessage?: any) {
//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           selectedDocumentId: documentId,
//           conversationId,
//           messages,
//           message: singleMessage
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to send message: ${response.statusText}`);
//       }

//       return response;
//     } catch (error) {
//       console.error("Error sending message", error);
//       throw error;
//     }
//   }
}

export const conversationMessagesService = new ConversationMessagesService();
