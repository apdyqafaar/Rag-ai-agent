import { Pinecone } from "@pinecone-database/pinecone";
let pineconeClient: Pinecone | null = null;

export interface DocumentSource {
  documentId: string;
  chunkId: string;
  documentTitle: string;
  content: string;
  similarity: number;
}

function pineconeConnection(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
    });
  }
  return pineconeClient;
}

// get pinecone index
export function getPineconeIndex() {
  const client = pineconeConnection();
  return client.Index(process.env.PINECONE_INDEX_NAME! || "rag-document");
}

/**
 * Saves chunks to Pinecone in batches of 100.
 */
export const saveVectorsToPinecone = async (
  documentId: string,
  chunks: Array<{ content: string; embedding: number[] }>,
  metadata: { title: string; filename: string; filetype: string },
) => {
  try {
    const index = getPineconeIndex();
    const vectors = chunks.map((c, i) => ({
      id: `${documentId}--chunk-${i}`,
      values: c.embedding,
      metadata: {
        documentId,
        content: c.content,
        ...metadata,
        timestamp: Date.now(),
        chunkIndex: i,
      },
    }));

    const BATCH_SIZE = 100;

    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
      const batch = vectors.slice(i, i + BATCH_SIZE);
      await index.upsert({ records: batch });
    }

    console.log(
      `${vectors.length} vectors were stored in pinecone for document ${documentId}`,
    );
    return vectors.length;
  } catch (error) {
    console.error(`Error upserting batch starting at index :`, error);
    throw error;
  }
};

/**
 * Deletes vectors from Pinecone by their IDs.
 */
export const deleteMany = async (documentId: string) => {
  try {
    const index = getPineconeIndex();
    await index.deleteMany({
      ids: [documentId],
    });
  } catch (error) {
    console.error("Error deleting vectors from Pinecone:", error);
    throw error;
  }
};

/**
 * Queries Pinecone for similar vectors.
 */
export const getSimilarity = async (
  queryEmbedding: number[],
  topK: number = 5,
  filter?:Record<string,any>,
) => {
  const index = getPineconeIndex();
  try {
    const queryResponse = await index.query({
      vector:queryEmbedding,
      topK,
      includeMetadata: true,
      filter,
    });
    
    const source:DocumentSource[]=[]
    for(const match of queryResponse.matches||[]){
      if(!match.metadata||!match.metadata.documentId)continue
       source.push({
        documentId:match.metadata.documentId as string,
        chunkId:match.id as string,
        documentTitle:match.metadata.title as string,
        content:match.metadata.content as string,
        similarity:match.score as number,
       })
    }

    // console.log("Sources of pinecone: ", source)
    return source
  } catch (error) {
    console.error("Error querying Pinecone for similarity:", error);
    throw error;
  }
};
