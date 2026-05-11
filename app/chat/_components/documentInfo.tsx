"use client"

import { useGetDocumentById } from "@/lib/hooks"
import { useParams } from "next/navigation"
import { FileText } from "lucide-react"

const DocumentInfo = () => {
    const { documentId } = useParams()
    const query = useGetDocumentById(documentId as string)

    const isLoading = 'isLoading' in query ? query.isLoading : query.isPending
    const result = query.data as any

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
                <div className="h-8 w-8 animate-pulse rounded-md bg-muted shrink-0" />
                <div className="flex flex-col gap-1 w-full">
                    <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                    <div className="h-3 w-2/3 animate-pulse rounded-md bg-muted" />
                </div>
            </div>
        )
    }

    // Handle both cases: if the interceptor unwrapped it or if it returned ApiResponse from catch block
    const document = result?.title ? result : result?.data;

    if (!document || !document.title) {
        return null;
    }

    return (
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-md bg-secondary/30">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary shrink-0">
                <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden w-full">
                <span className="text-sm font-semibold truncate" title={document.title}>
                    {document.title}
                </span>
                <span className="text-xs text-muted-foreground truncate capitalize">
                    {document?.status==="completed" ? "Active" : "processing..."}
                </span>
            </div>
        </div>
    )
}

export default DocumentInfo
