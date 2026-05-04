import {openai} from "@ai-sdk/openai"
import {embed, embedMany} from "ai"
const embedding_model=openai.embedding("text-embedding-3-small", )


export async function generateSingleEmbedding(text:string):Promise<{embedding:number[],tokens:number}>{
    const {embedding,usage}=await embed({
        model:embedding_model,
        value:text
    })
    return {embedding,tokens:usage.tokens}
}



// generate emedding many
export async function generateSingleEmbeddings(chunks:string[]):Promise<{embeddings:{content:string,embedding:number[]}[],tokens:number}>{
    const {embeddings,usage}=await embedMany({
        model:embedding_model,
        values:chunks
    })
    const embedded_data=chunks.map((c,i)=>({content:c,embedding:embeddings[i]}))
    return {embeddings:embedded_data,tokens:usage.tokens}
}