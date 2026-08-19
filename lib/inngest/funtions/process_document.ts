
import { processDocument } from "@/lib/document";
import { inngest } from "../client";
import { updateDocument } from "@/db/actions";
import { generateSingleEmbeddings } from "@/lib/ai/embedding";
import { rerank } from "ai";
import { saveVectorsToPinecone } from "@/lib/ai";
import { extractTextFromPDF } from "@/lib/document/pdf_processor";

export const uploadDocument = inngest.createFunction(
  { id: "upload-document",
   triggers: {event: "app/document.upload" }},
  async ({ event, step }) => {
     const {documentId, fileUrl,fileName, fileType}=event.data

    //  download and load the the document
     const text = await step.run("extract-text", async () => {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert back to File object
      const file = new File([arrayBuffer], fileName, { type: fileType });
      let content=""
  console.log("fileType on inngest functions: ",fileType)
          switch(fileType){
        case"pdf":
        content=await extractTextFromPDF({file,documentId});
        break;
        case"txt":
        // content=await extractTextFromTXT(file);
        break;
        case"docx":
        // content=await extractTextFromDOCX(file);
        break;
        case"xlsx":
        // content=await extractTextFromXLSX(file);
        break;
        default:
            await updateDocument(documentId,{status:"failed",description:"Unsupported file type"});
            throw new Error(`Unsupported file type: ${fileType}`);
            break;
            
    }

      return content
    });

    // console.log("Extracted text:", text);
     await step.run("updating-document-status", async()=>{
      await updateDocument(documentId,{
        status:"processing",
        progress:35
      });
    });

    // chunk and process the document
    const {content,chunks} = await step.run("chunk-document", async () => {
      return await processDocument({text,documentId, filetype:fileType, filename:fileName});
    });

       await step.run("updating-document-progress", async()=>{
      await updateDocument(documentId,{
        progress:55,
        chunkCount:chunks.length,
      });
    });
   
    // generating the embeddings
   const {embeddings,tokens}= await step.run("generate-embedding", async()=>{
     return await generateSingleEmbeddings(chunks)
    })

      await step.run("updating-document-progress", async()=>{
      await updateDocument(documentId,{
        progress:75
      });
    });
   const resultPinecone=await step.run("saving-vectors-to-pinecone", async()=>{
      return await saveVectorsToPinecone(documentId,embeddings,{filename:fileName,filetype:fileType,     title:fileName.replace(/\.[^/.]+$/, ''),})
   })

    await step.run("updating-document-status", async()=>{
      await updateDocument(documentId,{
        status:"completed",
        progress:100,
        tokenCount:tokens,
        version:"1",
        contentLength:content.length,
        vectorCount:resultPinecone
      });
    });

    return { message: `Task ${event.data.id} complete` };
  }
);