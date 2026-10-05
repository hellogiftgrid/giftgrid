import { NextResponse } from "next/server";
import { memberContext } from "@/lib/community/members";
import { ApiError,apiFailure,jsonInput,uuid } from "@/lib/developer/api";
type Context={params:Promise<{id:string}>};
async function conversation(context:Context){
  const {id}=await context.params;if(!uuid(id))throw new ApiError(404,"Conversation not found.");
  const member=await memberContext();
  const {data,error}=await member.admin.from("community_connections").select("id,status,requester_id,recipient_id").eq("id",id).maybeSingle();
  if(error)throw new ApiError(503,"Unable to open the conversation.");
  if(!data||![data.requester_id,data.recipient_id].includes(member.user.id))throw new ApiError(404,"Conversation not found.");
  if(data.status!=="accepted")throw new ApiError(403,"This message request is awaiting acceptance.");
  return {...member,id};
}
export async function GET(_request:Request,context:Context){
  try{
    const {admin,id}=await conversation(context);
    const {data,error}=await admin.from("community_connection_messages").select("id,sender_id,body,created_at").eq("connection_id",id).order("created_at",{ascending:false}).limit(100);
    if(error)throw new ApiError(503,"Unable to load messages.");
    return NextResponse.json({messages:(data||[]).reverse()},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
export async function POST(request:Request,context:Context){
  try{
    const {admin,user,id}=await conversation(context),input=await jsonInput(request),body=typeof input.body==="string"?input.body.trim():"";
    if(!body||body.length>5000)throw new ApiError(400,"Write a message of 1 to 5,000 characters.");
    const {data,error}=await admin.from("community_connection_messages").insert({connection_id:id,sender_id:user.id,body}).select("id,sender_id,body,created_at").single();
    if(error)throw new ApiError(503,"Unable to send the message.");
    return NextResponse.json({message:data},{status:201,headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
