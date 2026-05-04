import { updateDocument } from "@/db/actions"

export async function extractTextFromPDF({file,documentId}:{file:File,documentId:string}):Promise<string>{
    try {
          const {PDFLoader}=await import("@langchain/community/document_loaders/fs/pdf")
          const blob=new Blob([await file.arrayBuffer()],{type:file.type})
          const loader=new PDFLoader(blob)
          const docs=await loader.load()
          

          let fullText=""
          docs.forEach((doc,i)=>{
            if(doc.pageContent.trim()){
                fullText+=`\n\n ---Page${i+1} ---\n\n${doc.pageContent.trim()}`
            }
          })
          
          if(!fullText.trim()){
             await updateDocument(documentId,{status:"failed",description:"Failed to extract text from PDF"});
            throw new Error("PDF is empty or contains no extractable text")
          }
      
          console.log(`Extracted ${docs.length} pages of PDF`);
          return fullText
          
    } catch (error:any) {
        console.error("Error extracting text from PDF",error);
        // update here the document status tell it is failed
        await updateDocument(documentId,{status:"failed",description:error.message||"Failed to extract text from PDF"});
        throw error
    }
}