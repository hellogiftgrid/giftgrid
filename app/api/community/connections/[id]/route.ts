import { NextResponse } from "next/server";
import { memberContext } from "@/lib/community/members";
import { ApiError,apiFailure,jsonInput,uuid } from "@/lib/developer/api";
export async function PATCH(request:Request,context:{params:Promise<{id:string}>}){
  try{
    const {user,admin}=await memberContext(),{id}=await context.params,input=await jsonInput(request);
    if(!uuid(id)||!(["accepted","declined"] as unknown[]).includes(input.status))throw new ApiError(400,"Choose accept or decline.");
    const {data,error}=await admin.from("community_connections").update({status:input.status,updated_at:new Date().toISOString()}).eq("id",id).eq("recipient_id",user.id).eq("status","pending").select("id,status").maybeSingle();
    if(error)throw new ApiError(503,"Unable to update the request.");
    if(!data)throw new ApiError(404,"Pending incoming request not found.");
    return NextResponse.json({connection:data});
  }catch(error){return apiFailure(error);}
}
