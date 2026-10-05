import { NextResponse } from "next/server";
import { developerActor,ownedApp,apiFailure,jsonInput,ApiError } from "@/lib/developer/api";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context) {
  try {
    const actor=await developerActor(request,"apps:read"),{id}=await context.params;
    await ownedApp(actor,id);
    const {data,error}=await actor.admin.from("developer_webhooks").select("id,app_id,url,events,created_at").eq("app_id",id).eq("owner_id",actor.ownerId);
    if(error)throw new ApiError(503,"Unable to list webhook registrations.");
    return NextResponse.json({webhooks:data || [],deliveryEnabled:false});
  }catch(error){return apiFailure(error);}
}
export async function POST(request:Request,context:Context) {
  try {
    const actor=await developerActor(request,"webhooks:write"),{id}=await context.params;
    await ownedApp(actor,id);
    const input=await jsonInput(request);
    let url:URL;
    try {url=new URL(String(input.url));}catch{throw new ApiError(400,"Provide a public HTTPS webhook URL.");}
    if(url.protocol!=="https:" || url.username || url.password || url.hash || url.href.length>2000 || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[::1\])|\.local$/i.test(url.hostname))throw new ApiError(400,"Provide a public HTTPS webhook URL.");
    if(!Array.isArray(input.events) || !input.events.length || input.events.length>20 || input.events.some(event=>typeof event!=="string" || !/^[a-z][a-z0-9_.-]{0,79}$/.test(event)))throw new ApiError(400,"Provide up to 20 valid event names.");
    const {data,error}=await actor.admin.from("developer_webhooks").upsert({app_id:id,owner_id:actor.ownerId,url:url.href,events:[...new Set(input.events)]},{onConflict:"app_id,url"}).select("id,app_id,url,events,created_at").single();
    if(error)throw new ApiError(503,"Unable to register this webhook.");
    return NextResponse.json({webhook:data,deliveryEnabled:false,message:"Endpoint registered. Event delivery is not enabled in this release."},{status:201});
  }catch(error){return apiFailure(error);}
}
