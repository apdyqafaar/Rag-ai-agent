"use client"

import { Button } from "@/components/ui/button"
import { useCreateConversation } from "@/lib/hooks"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

const CreateConversation = () => {
    const { documentId } = useParams()
    const router = useRouter()
    const { mutate: createConversation, isPending } = useCreateConversation()

    const handleCreate = () => {
        if (!documentId) return;

        createConversation({ documentId: documentId as string }, {
            onSuccess: (data) => {
                if (data && data.conversationId) {
                    toast.success("Conversation created successfully")
                    router.push(`/chat/${documentId}/${data.conversationId}`)
                }
            },
            onError: (error) => {
                console.error("Failed to create conversation", error)
                toast.error("Failed to create conversation")
            }
        })
    }

    return (
        <Button 
            onClick={handleCreate} 
            disabled={isPending}
            className="w-full flex items-center justify-start gap-2 mt-4"
            variant="outline"
        >
            <Plus className="h-4 w-4" />
            New Conversation
        </Button>
    )
}

export default CreateConversation
