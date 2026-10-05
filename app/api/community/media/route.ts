import { NextResponse } from "next/server";
import { memberContext } from "@/lib/community/members";
import { ApiError,apiFailure } from "@/lib/developer/api";
export async function POST(request:Request) {
  try {
    const {user,admin}=await memberContext();
    if(Number(request.headers.get("content-length"))>4.5*1024*1024)throw new ApiError(413,"Images must be no larger than 4 MB.");
    let form:FormData;
    try{form=await request.formData();}catch{throw new ApiError(400,"Invalid image upload.");}
    const file=form.get("file");
    if(!(file instanceof File) || !file.size || file.size>4194304 || !["image/jpeg","image/png","image/webp"].includes(file.type))throw new ApiError(400,"Upload a JPG, PNG, or WebP image up to 4 MB.");
    const bytes=new Uint8Array(await file.arrayBuffer());
    const starts=(values:number[])=>values.every((value,index)=>bytes[index]===value);
    const valid=file.type==="image/jpeg" ? starts([255,216,255]) : file.type==="image/png" ? starts([137,80,78,71,13,10,26,10]) : starts([82,73,70,70]) && new TextDecoder().decode(bytes.slice(8,12))==="WEBP";
    if(!valid)throw new ApiError(400,"The image contents do not match its file type.");
    const extension=file.type==="image/jpeg" ? "jpg" : file.type.split("/")[1];
    const path=`${user.id}/${crypto.randomUUID()}.${extension}`;
    const storage=admin.storage.from("community-media");
    const {error}=await storage.upload(path,bytes,{contentType:file.type,upsert:false});
    if(error)throw new ApiError(503,"Unable to upload your image.");
    return NextResponse.json({path,url:storage.getPublicUrl(path).data.publicUrl},{status:201});
  }catch(error){return apiFailure(error);}
}
