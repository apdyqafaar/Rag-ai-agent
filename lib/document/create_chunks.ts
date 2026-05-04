import { updateDocument } from "@/db/actions"

export async function createChunks({text,documentId,filename}:{text:string,documentId:string,filename:string}):Promise<string[]>{
    try {
        const cleanContent=text.trim().replace(/ +/g,"")
        const {RecursiveCharacterTextSplitter}=await import("@langchain/textsplitters")
        const splitter=new RecursiveCharacterTextSplitter({
            chunkSize:2000,
            chunkOverlap:400,
            separators:[
                `\n\n\n`,
                `\n\n`,
                `\n`,
                ".",
                " ",
                ""
            ]
        })
        const chunks=await splitter.splitText(cleanContent)
        return chunks.map((ch:string)=>addContext(ch,filename))
    } catch (error) {
        console.error("Error creating chunks",error);
        await updateDocument(documentId,{status:"failed",description:"Failed to create chunks"});
        throw error
    }
    
}


const addContext=(chunk:string, filename:string)=>{
    const docName=filename.replace(/\.[^/.]+$/, "")
    return `\n\n ---Document ${docName} ---\n\n${chunk}`
}