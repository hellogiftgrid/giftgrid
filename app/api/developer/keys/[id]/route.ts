import { NextResponse } from "next/server";
import { developerActor,apiFailure,ApiError,uuid } from "@/lib/developer/api";
export async function DELETE(request:Request,context:{params:Promise<{id:string}>}) {
  try {
    const actor=await developerActor(request,"keys:write"),{id}=await context.params;
    if(!uuid(id))throw new ApiError(400,"Invalid key ID.");
    const {data,error}=await actor.admin.from("developer_api_keys").update({revoked_at:new Date().toISOString()}).eq("id",id).eq("owner_id",actor.ownerId).select("id").maybeSingle();
    if(error)throw new ApiError(503,"Unable to revoke this key.");
    if(!data)throw new ApiError(404,"Key not found.");
    return NextResponse.json({revoked:true,id});
  }catch(error){return apiFailure(error);}
}
