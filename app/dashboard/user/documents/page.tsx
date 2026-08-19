"use client";

import { ProcessingDocumentsList } from "@/components/dashboard/ProcessingDocuments";
import UploadDocument from "@/components/dashboard/upload-doxument";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/lib/context";
import { useGetProcessingDocuments, useUploadDocument } from "@/lib/hooks";
import { UploadFile } from "@/lib/types/document.types";
import { useState } from "react";
import { toast } from "sonner";

const page = () => {
  // states
  const [currentDocument, setCurrentDocument] = useState<UploadFile | null>(
    null,
  );

  const user = useUser();
  const {data:processingDocuments,isPending:isPendingProcessingDocuments,error:processingDocumentsError,isError:isErrorProcessingDocuments,isLoading:isLoadingProcessingDocuments}=useGetProcessingDocuments()
  // console.log("Processing docs: ",processingDocuments)
  const {
    mutate: uploadDocument,
    error: uploadingError,
    isPending: isPendingUploadingDocument,
  } = useUploadDocument();
  const processingDocs=processingDocuments as any

  // handle upload
  const handleUploadDocument = () => {
    if (!currentDocument) {
      toast.error("Please select a document to upload");
      return;
    }

    let payload = {
      file: currentDocument?.file,
      source: "local",
    };
    uploadDocument(payload, {
      onSuccess: (data) => {
        toast.success("Document was uploaded successfully", {description:"Your doc is been processed please wait"})
        setCurrentDocument(null)
      },
      onError: (error) => {
        console.log("error: ",error)
        toast.error("Failed to upload file", { description: error.message });
      },
    });

  
  };
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-left px-2 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Upload Documents
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-tight">
          Add your PDFs or text files to train your RAG agent.
        </p>
      </div>

      {/* upload section */}
      <div>
        <UploadDocument
          currentDocument={currentDocument}
          setCurrentDocument={setCurrentDocument}
          onUpload={handleUploadDocument}
          isPendingUploadingDocument={isPendingUploadingDocument}
        />
      </div>
      
      {/* create here to show user progressing docs */}
      {
        processingDocs&&processingDocs.length>0&&(
          // processingDocs.map(doc=>(

          // ))
          <Card className="">
            <CardContent>
               <ProcessingDocumentsList documents={processingDocs}/>
            </CardContent>
           
          </Card>
        )
      }
     
    </div>
  );
};

export default page;
