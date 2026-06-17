'use client';
import { useUploadThing } from "@/utils/uploadthing";

import { generatePdfSummary } from "@/actions/upload-actions";
import UploadFormInput from "./upload-form-input"
import * as z from "zod";
const Schema = z.object({
 file: z
 .instanceof(File,{message: 'Invalid file'})
 .refine(
    (file)=>file.size<=20*1024*1024,
    'File size must be less than 20MB'

 )
 .refine(
    (file)=>file.type.startsWith('application/pdf'),
    'File must be a PDF'
 ),
});

export default function UploadForm(){
  const {toast} =useToast();

    
  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!");
    },
    onUploadError: (err) => {
      console.error("error occurred while uploading",err);
      toast({
        title:'Error occured while uploading',
        description:err.message,
      })
    },
    onUploadBegin: ({ file }) => {
      console.log("upload has begun for", file);
    },
  });



    const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        //console.log('submitted');
        const formData=new FormData(e.currentTarget);
        const file=formData.get('file')as File;

        //validating the fields
        const validatedFields=Schema.safeParse({file});
        if(!validatedFields.success){
           
            toast({
              title:'❌ Something went wrong',
              variant:'destructive',
              description: validatedFields.error.flatten().fieldErrors.file?.[0] ?? 'Invalid file'
            })
            return;
        }
        
        //schema with zod
        //upload the file to uploadthing
        const resp=await startUpload([file]);
        if(!resp){
          toast({
            title:'❌Something went wrong',
            description:'please use a different file',
            variant:'destructive',
          })
          return;
        }
        toast({
          title:'📄 Uploading PDF',
          description:'We are uploading your PDF!'
        })

        //parse the pdf using langchain
        const summary=await generatePdfSummary(resp);
        //summarize the pdf using AI
        //save the summary to the database
        //redirect to the [id] summary page

    };
    return (
        <div className="flex flex-xol gap-8 w-full max-w-2xl mx-auto">
            <UploadFormInput onSubmit={handleSubmit}/>
        </div>

    );
}