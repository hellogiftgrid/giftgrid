import { NextResponse } from "next/server";
import { developerActor,apiFailure,jsonInput,ApiError } from "@/lib/developer/api";
export async function GET(request: Request) {
  try {
    const actor = await developerActor(request,"apps:read");
    const {data,error} = await actor.admin.from("developer_apps").select("id,name,description,created_at").eq("owner_id",actor.ownerId).order("created_at",{ascending:false});
    if(error) throw new ApiError(503,"Unable to list your apps.");
    return NextResponse.json({apps:data || []},{headers:{"Cache-Control":"private, no-store"}});
  } catch(error) { return apiFailure(error); }
}
export async function POST(request: Request) {
  try {
    const actor = await developerActor(request,"apps:write"),input = await jsonInput(request);
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    if(!name || name.length>100 || description.length>2000) throw new ApiError(400,"Use an app name of 1–100 characters and a description up to 2,000 characters.");
    const {count} = await actor.admin.from("developer_apps").select("id",{count:"exact",head:true}).eq("owner_id",actor.ownerId);
    if((count || 0)>=100) throw new ApiError(409,"This account has reached the 100-app limit.");
    const {data,error} = await actor.admin.from("developer_apps").insert({owner_id:actor.ownerId,name,description:description || null}).select("id,name,description,created_at").single();
    if(error) throw new ApiError(503,"Unable to create your app.");
    return NextResponse.json({app:data},{status:201});
  } catch(error) { return apiFailure(error); }
}
