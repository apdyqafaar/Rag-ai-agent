import { IDocument } from "@/db/schema";

export interface UploadFile{
    file:File,
    status:"uploading"|"processing"|"failed"|"completed",
    source:string,
    sourceUrl?:string,
    progress?:number
}

export interface UploadFileRoutePayload{
    file:File,
    source?:string,
    sourceUrl?:string,
}

export type DocumentList={
        documents: IDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    
}