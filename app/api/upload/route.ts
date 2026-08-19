import { createDocument, getProcessingDocumentsByUser } from "@/db/actions";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary/config";
import { useGenerateId } from "@/lib/hooks";
import { inngest } from "@/lib/inngest/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  //   check if user was banned
  if (session.user.role === "banned") {
    return NextResponse.json(
      {
        error: "User is banned",
        reason: session.user.banReason || "No reason provided",
        date: new Date(),
      },
      { status: 403 },
    );
  }

  // check if there is a document which it`s status is uploading or processing
   const activeDocuments=await getProcessingDocumentsByUser(session.user.id)
   if(activeDocuments.length>0){
    return NextResponse.json(
      {
        error: `There is an active process for ${activeDocuments.length} documents. Please wait for it to complete before uploading a new document. or cancel it`,
      },
      { status: 403 },
    );
   }
    
  

  try {
    // 2. Parse form data to get the file
    const formData = await req.formData();
const file = formData.get("file") as File;
const source = formData.get("source") as string;
const sourceUrl = formData.get("sourceUrl") as string;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    // check the file size
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds the limit of 100MB" },
        { status: 413 },
      );
    }

    // check file type if it is TXT, PDF DOX or excel
    if (
      ![
        "application/pdf",
        "text/plain",
        // "application/msword",
        // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        // "application/vnd.ms-excel",
        // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(file.type)
    ) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 },
      );
    }

    // 3. Generate document metadata
    const documentId = useGenerateId("document");
    const fileSize = (file.size / 1024 / 1024).toFixed(2) + " MB";

    // 4. Create document record in database with status 'uploading'
    const document={
         id: documentId,
        title: file.name,
        userId: session.user.id,
        status: "uploading",
        documentType: file.type.split("/")[1].toLowerCase() || "application/octet-stream",
        size: fileSize,
        source: source || "local",
        sourceUrl: sourceUrl || null,
        isActive: true,
        progress: 20,
      }
      // console.log("document to upload: ",document)
      const newDocument=await createDocument(document as any);

    // TODO: Implement actual file storage logic here (e.g., upload to S3, Cloudinary, etc.)
    // Once uploaded, you would typically update the status to 'processing' or trigger an Inngest event.
    // create here inngest send
    const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

// Upload to Cloudinary
const uploadResult = await new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    
    {
      
      resource_type: "raw", // ✅ use "raw" for PDFs, docs, etc.
      folder: "documents",
      public_id: documentId,
    },
    (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }
  ).end(buffer);
});

const fileUrl = (uploadResult as any).secure_url;
    // console.log("file: ",file)
    await inngest.send({
        name: "app/document.upload",
        data: {
    documentId: newDocument.id,
    fileUrl,
    fileName: file.name,        // ✅ from the file object
    fileType: file.type.split("/")[1].toLowerCase(),
},
    });

    return NextResponse.json({
      success: true,
      message: "Document created and upload initiated",
      data: newDocument,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" ,success:false},
      { status: 500 },
    );
  }
}
