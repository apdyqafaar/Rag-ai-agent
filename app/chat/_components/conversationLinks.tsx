"use client"

import { IConversation } from "@/db/schema"
import {
    useGetDocumentConversations,
    useDeleteConversation,
    useUpdateConversationTitle,
} from "@/lib/hooks"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MessageSquare, Trash2, Pencil, Check, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const ConversationLinks = () => {
    const { documentId, conversationId } = useParams()
    const router = useRouter()

    const { data: conversations, isLoading, isError } = useGetDocumentConversations(documentId as string)
    const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation()
    const { mutate: updateTitle, isPending: isUpdatingTitle } = useUpdateConversationTitle()

    // Track which conversation is being edited
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus the input when editing starts
    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editingId])

    const handleStartEdit = (conversation: IConversation) => {
        setEditingId(conversation.id)
        setEditValue(conversation.title || "New Conversation")
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditValue("")
    }

    const handleSaveTitle = (conversation: IConversation) => {
        const trimmed = editValue.trim()
        if (!trimmed || trimmed === (conversation.title || "New Conversation")) {
            handleCancelEdit()
            return
        }
        updateTitle(
            { documentId: documentId as string, conversationId: conversation.id, title: trimmed },
            { onSettled: () => handleCancelEdit() }
        )
    }

    const handleDelete = (conversation: IConversation) => {
        deleteConversation(
            { documentId: documentId as string, conversationId: conversation.id },
            {
                onSuccess: () => {
                    // If deleted conversation is active, go back to document page
                    if (conversation.id === conversationId) {
                        router.push(`/chat/${documentId}`)
                    }
                }
            }
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-2 mt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-9 w-full animate-pulse rounded-md bg-muted" />
                ))}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="mt-4">
                <p className="text-sm text-muted-foreground">Error loading conversations</p>
            </div>
        )
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="mt-4">
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-1 w-full mt-4">
            {conversations.map((conversation: IConversation) => {
                const isActive = conversation.id === conversationId
                const isEditing = editingId === conversation.id

                return (
                    <div
                        key={conversation.id}
                        className={cn(
                            "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="h-4 w-4 shrink-0" />

                        {isEditing ? (
                            /* ── Inline edit mode ── */
                            <div className="flex flex-1 items-center gap-1 min-w-0">
                                <input
                                    ref={inputRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveTitle(conversation)
                                        if (e.key === "Escape") handleCancelEdit()
                                    }}
                                    disabled={isUpdatingTitle}
                                    className="flex-1 min-w-0 bg-transparent border-b border-primary outline-none text-sm text-foreground"
                                />
                                <button
                                    onClick={() => handleSaveTitle(conversation)}
                                    disabled={isUpdatingTitle}
                                    className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                                    title="Save"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdatingTitle}
                                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                    title="Cancel"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            /* ── Normal display mode ── */
                            <>
                                <Link
                                    href={`/chat/${documentId}/${conversation.id}`}
                                    className="flex-1 truncate"
                                >
                                    {conversation.title || "New Conversation"}
                                </Link>

                                {/* Action buttons – visible on hover or when active */}
                                <div className={cn(
                                    "flex items-center gap-1 shrink-0 transition-opacity",
                                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    <button
                                        onClick={() => handleStartEdit(conversation)}
                                        className="p-0.5 rounded hover:text-primary transition-colors"
                                        title="Rename"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(conversation)}
                                        disabled={isDeleting}
                                        className="p-0.5 rounded hover:text-destructive transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default ConversationLinks