import { updateDocument } from "@/db/actions";
import { extractTextFromPDF } from "./pdf_processor";
import { createChunks } from "./create_chunks";

export async function processDocument({text,documentId,filename,filetype}:{filename:string, filetype:string,text:string,documentId:string}):Promise<{content:string, chunks:string[]}> {
  

    const chunks=await createChunks({text,documentId,filename})
    return {content:text,chunks}
}