import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {nanoid} from 'nanoid'
import { documentService } from '@/lib/services/document';
import { ApiResponse } from '@/lib/api/client';
import { IDocument } from '@/db/schema';
// generate id
export const useGenerateId=(name:string):string=>{
 return `${name}-${nanoid()}`
}

// get all user docs
export const useGetDocuments = ({
    page = 1,
    limit = 10,
    search = "",
    status = "",
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
} = {}) => {
    return useQuery({
        queryKey: ["documents", page, limit, search, status], // ✅ refetches when any param changes
        queryFn: () => documentService.getAllDocuments({ page, limit, search, status }),
        staleTime: 1000 * 30,
        retry: 1,
    });
};

// use upload document hook
export const useUploadDocument = () => {
    const queryClient= useQueryClient();
    return useMutation({
        mutationFn:(data: { file: File; source: string; sourceUrl?: string }) =>documentService.uploadDocument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["processing-documents"] });
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        }
    })
}

// use get document by id
export const useGetProcessingDocuments = () => {
  
    return useQuery({
        queryKey: ["processing-documents"],
        queryFn: () => documentService.getProcessingDocuments(),
        staleTime:1000*10,
        retry:1,
        refetchInterval:(query)=>{
            const data=query.state.data?.data as IDocument[]
            if(!data || data?.length===0){
                return false
            }
            const hasProcessing = data.some((item)=>item.status==="uploading"||item.status==="processing")
            if(hasProcessing){
                return 3000
            }
            return false
        }
    })
}


// use get document by id
export const useGetDocumentById = (id: string) => {
    if(!id) return {
        data:null,
        error:null,
        isPending:false,
        isError:false,
        isSuccess:false,
    }
    return useQuery({
        queryKey: ["document", id],
        queryFn: () => documentService.getDocumentById(id),
        staleTime:1000*10,
        retry:2,
        refetchInterval:(query)=>{
            const data=query.state.data?.data as IDocument
            if(data?.status==="completed"||data?.status==="failed"){
                return false
            }
            return 5000
        }
    })
}

// use update document
export const useUpdateDocument = () => {
    const queryClient= useQueryClient();
    return useMutation({
        mutationFn:(data: { id: string; data: any }) =>documentService.updateDocument(data.id,data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
    })
}

// use delete document
export const useDeleteDocument = () => {
    const queryClient= useQueryClient();
    return useMutation({
        mutationFn:(id: string) =>documentService.deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
    })
}
