import { NextResponse } from "next/server";
import { developerActor,ownedApp,apiFailure,jsonInput,ApiError,newApiKey,hashApiKey } from "@/lib/developer/api";
import { DEVELOPER_SCOPES } from "@/lib/developer/scopes";
type Context = { params: Promise<{id:string}> };
export async function GET(request:Request,context:Context) {
  try {
    const actor=await developerActor(request,"apps:read"),{id}=await context.params;
    await ownedApp(actor,id);
    const {data,error}=await actor.admin.from("developer_api_keys").select("id,app_id,prefix,scopes,expires_at,revoked_at,created_at").eq("app_id",id).eq("owner_id",actor.ownerId).order("created_at",{ascending:false});
    if(error)throw new ApiError(503,"Unable to list keys.");
    return NextResponse.json({keys:data || []},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
export async function POST(request:Request,context:Context) {
  try {
    const actor=await developerActor(request,"keys:write"),{id}=await context.params;
    await ownedApp(actor,id);
    const input=await jsonInput(request);
    if(!Array.isArray(input.scopes) || !input.scopes.length || input.scopes.length>DEVELOPER_SCOPES.length || input.scopes.some(scope=>typeof scope!=="string" || !DEVELOPER_SCOPES.includes(scope as typeof DEVELOPER_SCOPES[number]) || !actor.scopes.includes(scope))) throw new ApiError(400,"Select supported scopes within your current permissions.");
    const scopes=[...new Set(input.scopes as string[])];
    const expires=input.expiresAt===undefined ? new Date(Date.now()+90*86400000) : new Date(String(input.expiresAt));
    if(!Number.isFinite(expires.getTime()) || expires.getTime()<=Date.now() || expires.getTime()>Date.now()+366*86400000)throw new ApiError(400,"Keys must expire within the next year.");
    const {count}=await actor.admin.from("developer_api_keys").select("id",{count:"exact",head:true}).eq("app_id",id).is("revoked_at",null);
    if((count || 0)>=100)throw new ApiError(409,"Revoke unused keys before creating more.");
    const key=newApiKey();
    const {data,error}=await actor.admin.from("developer_api_keys").insert({app_id:id,owner_id:actor.ownerId,key_hash:hashApiKey(key),prefix:key.slice(0,10),scopes,expires_at:expires.toISOString()}).select("id,app_id,prefix,scopes,expires_at,created_at").single();
    if(error)throw new ApiError(503,"Unable to create a key.");
    return NextResponse.json({key,...data,message:"Save this key securely. It will not be shown again."},{status:201,headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
