'use client';
import { useRef, useState } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import {useToast} from '@/hooks/use-toast';

import { generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import UploadFormInput from "./upload-form-input"
import { z} from "zod";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
//import { useRouter } from "next/router";
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
  const formRef =useRef<HTMLFormElement>(null);
  const [isLoading,setIsLoading]=useState(false);
  const router=useRouter();


    
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

        try {

          setIsLoading(true);

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
            setIsLoading(false);
            return;
        }
        toast({
          title:'📄 Uploading PDF...',
          description:'We are uploading your PDF! ✨',
        })
        
        //schema with zod
        //upload the file to uploadthing
        const resp=await startUpload([file]);
        if(!resp){
          toast({
            title:'❌Something went wrong',
            description:'please use a different file',
            variant:'destructive',
          })
          setIsLoading(false);
          return;
        }
        toast({
          title:'📄 Processing PDF',
          description:'Hang tight! Our AI is reading through your document! ✨',
        })

        //parse the pdf using langchain
        const result=await generatePdfSummary(resp);
        console.log({result});
         const {data = null, message= null }  = result || {};
         if(data){
          let storeResult:any;
          toast({
            title:'📄 Saving PDF...',
            description:'Hang tight! We are saving your summary! ✨',

          });
         
          if(data.summary){
           // save the summary to the database


              storeResult= await storePdfSummaryAction({
                summary:data.summary,
                fileUrl:resp[0].serverData.file.url,
                title:data.title,
                fileName:file.name,
               })
               toast({
                title:'✨ Summary Generated!',
                description:'Your PDF has been successfully summarized and  saved! ✨',
               })
                formRef.current?.reset();
                //redirect to the [id] summary page
                router.push(`/summaries/${storeResult.data.id}`)


          }

         }
          
        } catch (error) {
          setIsLoading(false);
          console.error('Error occurred',error);
           formRef.current?.reset();
          
        }finally{
          setIsLoading(false);
        }







        

        //summarize the pdf using AI
        //save the summary to the database
        //redirect to the [id] summary page

    };
    return (
        <div className="flex flex-xol gap-8 w-full max-w-2xl mx-auto">
            <UploadFormInput 
            isLoading={isLoading}
            
            ref={formRef} onSubmit={handleSubmit}/>
        </div>

    );
}