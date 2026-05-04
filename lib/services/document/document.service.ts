import { IDocument } from "@/db/schema";
import { api, ApiResponse } from "@/lib/api/client"
import { err } from "inngest/types";

export class DocumentService{

 async getAllDocuments({
    page = 1,
    limit = 10,
    search = "",
    status = "",
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
} = {}) {
    try {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (search) params.append("search", search);
        if (status) params.append("status", status);

        const response = await api.get<ApiResponse<{
            documents: IDocument[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>>(`/document?${params.toString()}`);
        
        return response;
    } catch (error) {
        console.log("Error fetching documents", error);
        return { success: false, error: "Failed to fetch documents", data:null };
    }
}
    async getProcessingDocuments(){
        try {
            const response = await api.get<ApiResponse<Document[]>>("/document/processing")
            console.log("Processing docs: ",response)
            return response
        } catch (error) {
            console.log("Error fetching processing documents", error)
            return {success:false, error:"Failed to fetch processing documents", data:[]} 
        }
    }

    async getDocumentById(id:string){
        try {
            const response = await api.get<ApiResponse<Document>>(`/document/${id}`)
            return response
        } catch (error) {
            console.log("Error fetching document by id", error)
            return {success:false, error:"Failed to fetch document", data:null as any}
        }
    }

  async uploadDocument({ file, source, sourceUrl }: {
    file: File,
    source: string,
    sourceUrl?: string
}) {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("source", source);
        if (sourceUrl) formData.append("sourceUrl", sourceUrl);

        const response = await api.post<ApiResponse<Document>>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        // console.log("response Ax: ",response)
        return response;
    } catch (error) {
        // console.log("Error creating document", error);
        throw error
    }
}
    async updateDocument(id:string,data:any){
        try {
            const response = await api.put<ApiResponse<Document>>(`/document/${id}`, data)
            return response
        } catch (error) {
            console.log("Error updating document", error)
            return {success:false, error:"Failed to update document"}
        }
    }

    async deleteDocument(id:string){
        try {
            const response = await api.delete<{success:boolean,message:string}>(`/document/${id}`)
            return response
        } catch (error) {
            console.log("Error deleting document", error)
            return {success:false, error:"Failed to delete document"}
        }
    }
}
export const documentService=new DocumentService()