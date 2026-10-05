import { NextResponse } from "next/server";
import { memberContext,memberDirectory } from "@/lib/community/members";
import { ApiError,apiFailure,jsonInput,uuid } from "@/lib/developer/api";
export async function GET(){
  try{const {user,admin}=await memberContext();const {data,error}=await admin.from("community_follows").select("followed_id").eq("follower_id",user.id);if(error)throw new ApiError(503,"Unable to load follows.");return NextResponse.json({userId:user.id,following:(data||[]).map(row=>row.followed_id)},{headers:{"Cache-Control":"private, no-store"}});}
  catch(error){return apiFailure(error);}
}
export async function POST(request:Request){
  try{
    const {user,admin}=await memberContext(),input=await jsonInput(request),target=typeof input.targetId==="string"?input.targetId:"";
    if(!uuid(target)||target===user.id||typeof input.following!=="boolean")throw new ApiError(400,"Choose a listed member to follow or unfollow.");
    if(input.following&&!(await memberDirectory()).some(member=>member.profile_id===target))throw new ApiError(404,"Member not found.");
    const result=input.following?await admin.from("community_follows").upsert({follower_id:user.id,followed_id:target},{onConflict:"follower_id,followed_id",ignoreDuplicates:true}):await admin.from("community_follows").delete().eq("follower_id",user.id).eq("followed_id",target);
    if(result.error)throw new ApiError(503,"Unable to update your follow.");
    return NextResponse.json({following:input.following},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
