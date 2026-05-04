import { db } from "@/db/db";
import { documentsTable } from "@/db/schema/schema";
import { eq, desc, or, and, inArray, like, count } from "drizzle-orm";

/**
 * Fetch all documents belonging to a specific user.
 * @param userId - The ID of the user whose documents to fetch.
 */
export const getDocumentsByUser = async (
  userId: string,
  {
    page = 1,
    limit = 10,
    search = "",
    status = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}
) => {
  try {
    const offset = (page - 1) * limit;

    const conditions = [eq(documentsTable.userId, userId)];

    if (search) {
      conditions.push(like(documentsTable.title, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(documentsTable.status, status as any));
    }

    const [documents, total] = await Promise.all([
      db
        .select()
        .from(documentsTable)
        .where(and(...conditions))
        .orderBy(desc(documentsTable.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(documentsTable)
        .where(and(...conditions)),
    ]);

    return {
      documents,
      total: total[0].count,
      page,
      limit,
      totalPages: Math.ceil(total[0].count / limit),
    };
  } catch (error) {
    console.error("Error getting documents by user:", error);
    throw new Error("Failed to fetch documents for the user.");
  }
};

/**
 * Fetch a single document by its ID.
 * @param id - The ID of the document to fetch.
 */
export const getDocumentById = async (id: string) => {
  try {
    const [document] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, id))
      .limit(1);
    
    return document || null;
  } catch (error) {
    console.error("Error getting document by id:", error);
    throw new Error("Failed to fetch the document.");
  }
};

/**
 * Update an existing document.
 * @param id - The ID of the document to update.
 * @param data - The fields to update.
 */
export const updateDocument = async (id: string, data: Partial<typeof documentsTable.$inferInsert>) => {
  try {
    const [updatedDocument] = await db
      .update(documentsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documentsTable.id, id))
      .returning();
    
    return updatedDocument;
  } catch (error) {
    console.error("Error updating document:", error);
    throw new Error("Failed to update the document.");
  }
};

/**
 * Delete a document by its ID.
 * @param id - The ID of the document to delete.
 */
export const deleteDocument = async (id: string) => {
  try {
    const [deletedDocument] = await db
      .delete(documentsTable)
      .where(eq(documentsTable.id, id))
      .returning();
    
    return deletedDocument;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete the document.");
  }
};

/**
 * Create a new document record.
 * @param data - The document data to insert.
 */
export const createDocument = async (data: typeof documentsTable.$inferInsert) => {
  try {
    const [newDocument] = await db
      .insert(documentsTable)
      .values(data)
      .returning();
    
    return newDocument;
  } catch (error) {
    console.error("Error creating document:", error);
    throw new Error("Failed to create the document.");
  }
};
/**
 * Fetch all documents that are currently uploading or processing for a specific user.
 * @param userId - The ID of the user whose documents to fetch.
 */
export const getProcessingDocumentsByUser = async (userId: string) => {
  try {
    const processingDocuments = await db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.userId, userId),
          or(
            eq(documentsTable.status, "uploading"),
            eq(documentsTable.status, "processing")
          )
        )
      )
      .orderBy(desc(documentsTable.createdAt));

    return processingDocuments;
  } catch (error) {
    console.error("Error getting processing documents by user:", error);
    throw new Error("Failed to fetch processing documents for the user.");
  }
};
