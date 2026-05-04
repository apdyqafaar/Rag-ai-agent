"use client";

import React from "react";
import { ProgressWithLabel } from "@/components/documentprogress";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export interface ProcessingDocument {
  id: string;
  title: string;
  status: "processing" | "uploading" | "failed" | "completed" | string;
  progress: number;
}

interface ProcessingDocumentsListProps {
  documents: ProcessingDocument[];
}

export function ProcessingDocumentsList({ documents }: ProcessingDocumentsListProps) {
  // Filter for only processing or uploading documents
  const activeDocuments = documents.filter(
    (doc) => doc.status === "processing" || doc.status === "uploading"
  );

  if (activeDocuments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full ">
      {activeDocuments.map((doc) => (
        <div key={doc.id} className="flex flex-col gap-2">
          {/* Paragraph showing the title of the book/document */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-relaxed text-foreground">
              {doc.title}
            </p>
            <Badge 
              variant={doc.status === "uploading" ? "secondary" : "default"}
              className="capitalize shrink-0 rounded-full bg-transparent "
              
            >
             <Loader2 className="w-4 h-4 animate-spin text-amber-500"/>
            </Badge>
          </div>
          
          {/* The progress component you created */}
          <ProgressWithLabel states={doc.status} progress={doc.progress||0} />
        </div>
      ))}
    </div>
  );
}
