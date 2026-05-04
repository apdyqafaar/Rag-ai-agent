"use client";
import { File, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useCallback, useRef, useState } from "react";
import {FileRejection, useDropzone} from 'react-dropzone'
import { UploadFile } from "@/lib/types/document.types";
import { toast } from "sonner";
import { useGenerateId } from "@/lib/hooks";

interface PageProps {
  currentDocument: UploadFile | null;
  setCurrentDocument: (currentDocument: UploadFile|null) => void;
  onUpload:()=>void;
  isPendingUploadingDocument:boolean;
}
const UploadDocument = ({ currentDocument, setCurrentDocument,onUpload,isPendingUploadingDocument }: PageProps) => {
    const inputRef=useRef(null)
   

 const onDrop = useCallback((acceptedFiles:File[], rejectedFiles:FileRejection[])  => {

    // handle if error got
      rejectedFiles.forEach(rejection=>{
        const {errors,file}=rejection
        errors.forEach(err=>{
            if(err.code==="file-too-large"){
                toast.error("Failed to upload file",{description:`File is too large. Maximum is 100MB`})
                return
            }
             if(err.code==="file-invalid-type"){
                toast.error("Failed to upload file",{description:`File is not supported. Please upload PDF, DOCX, MD or TXT`})
                return
            }
        })
      })

      if(acceptedFiles.length>1){
          toast.error("Failed to upload file",{description:`Only one file can be processed at a time.`})
                return
      }


      if(acceptedFiles.length>0){
        let file=acceptedFiles[0]
        if(currentDocument && currentDocument.status !=="completed"){
              toast.error("Please wait  for the current file to finish processing, or remove it first",)
                return
        }

        const newFile:UploadFile={
            file,
            progress:5,
            status:"uploading",
            source:"Local"
        }
        setCurrentDocument(newFile)
      
      }
  }, [currentDocument])

  
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop,
        accept:{
            "application/pdf":[".pdf"],
            "application/vnd.openxmlformats-offucedocument.wordprocessingml.document":[".docx"],
            "text/markdown":[".md"],
            "text/plain":["'.txt"]
        },
        maxFiles:1,
        maxSize:60*1024*1024,
        multiple:false
    })

    // handle remove
    const handleRemove=()=>{
        setCurrentDocument(null)
    }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Upload className="w-5 h-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`border-dashed border-2 cursor-pointer border-border hover:bg-muted p-8 rounded ${isDragActive&&"bg-primary/20"}`} {...getRootProps()}>
          <div className="flex items-center justify-center text-center">
            <div className="space-y-4 text-center">
                <input {...getInputProps()}/>
              <Upload className="w-8 h-8 text-accent-foreground mb-3 mx-auto" />
              <div>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                   
                     {isDragActive?"Drag the document here":"Upload your documents here"}
                </h4>
                <p className="leading-7  text-sm text-muted-foreground">
                  Drag & drop files here, or click to browse
                </p>
                <span className="text-xs text-muted-foreground">
                  Supports PDF, TXT, MD - Max 100MB - One file a time
                </span>
              </div>
              <Button variant={"outline"} className="rounded-lg"><File/>Choose File</Button>
            </div>
          </div>

         
        </div>

         {/* file uploaded */}
          {
            currentDocument&&(
                <div>
                  <div className=" p-4 bg-muted rounded-lg mt-4 cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                        <File className="w-7 h-7 text-primary/60"/>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground">{currentDocument.file.name}</span>
                            <div className="flex">
                                <span className="text-xs text-muted-foreground">size: {currentDocument.file.size} </span><span className="mx-1"/>
                            <span className="text-xs text-muted-foreground">Type: {currentDocument.file.type} </span>
                            </div>
                        </div>
                    </div>

                <div>
                    <Button onClick={handleRemove} variant={"outline"} size={"icon"} className="rounded-full border-0 cursor-pointer">
                        <X className="w-8 h-8"/>
                    </Button>
                </div>
                    </div>
                </div>  

                {/* upload button */}
          <div className="mt-3">
            <Button disabled={isPendingUploadingDocument} onClick={onUpload} className=" cursor-pointe">
                <Upload className="w-5 h-5"/>
                Process
            </Button>
          </div>
                </div>
                
            )
          }

          
      </CardContent>
      
    </Card>
  );
};

export default UploadDocument;
