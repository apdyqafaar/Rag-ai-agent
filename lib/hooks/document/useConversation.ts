import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationMessagesService } from '@/lib/services/document/conversation_messages.service';

// get all conversations for a document
export const useGetDocumentConversations = (documentId: string) => {
    return useQuery({
        queryKey: ["conversations", documentId],
        queryFn: () => conversationMessagesService.getDocumentConversations(documentId),
        enabled: !!documentId, // only run if documentId is provided
    });
};

// get a specific conversation and its messages
export const useGetConversationAndMessages = (documentId: string, conversationId: string) => {
    return useQuery({
        queryKey: ["conversation", documentId, conversationId],
        queryFn: () => conversationMessagesService.getConversationAndMessages(documentId, conversationId),
        enabled: !!documentId && !!conversationId,
    });
};

// create a conversation
export const useCreateConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, title }: { documentId: string; title?: string }) => 
            conversationMessagesService.createConversation(documentId, title),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["conversations", variables.documentId] });
        }
    });
};

// delete a conversation
export const useDeleteConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, conversationId }: { documentId: string; conversationId: string }) => 
            conversationMessagesService.deleteConversation(documentId, conversationId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["conversations", variables.documentId] });
            // optionally invalidate the specific conversation
            queryClient.invalidateQueries({ queryKey: ["conversation", variables.documentId, variables.conversationId] });
        }
    });
};

// update a conversation title
export const useUpdateConversationTitle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, conversationId, title }: { documentId: string; conversationId: string; title: string }) =>
            conversationMessagesService.updateConversationTitle(documentId, conversationId, title),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["conversations", variables.documentId] });
        }
    });
};
