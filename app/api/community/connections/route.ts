import { NextResponse } from "next/server";
import { memberContext,memberDirectory } from "@/lib/community/members";
import { ApiError,apiFailure,jsonInput,uuid } from "@/lib/developer/api";
export async function GET(){
  try{
    const {user,admin}=await memberContext();
    const {data,error}=await admin.from("community_connections").select("id,requester_id,recipient_id,status,created_at").or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at",{ascending:false}).limit(200);
    if(error)throw new ApiError(503,"Unable to load your conversations.");
    const ids=[...new Set((data||[]).flatMap(row=>[row.requester_id,row.recipient_id]).filter(id=>id!==user.id))];
    const {data:profiles,error:profilesError}=ids.length?await admin.from("profiles").select("id,full_name,role").in("id",ids).eq("is_active",true):{data:[],error:null};
    if(profilesError)throw new ApiError(503,"Unable to load conversation names.");
    return NextResponse.json({userId:user.id,connections:data||[],people:(profiles||[]).map(p=>({id:p.id,full_name:p.full_name||"GiftGrid member",role:p.role}))},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
export async function POST(request:Request){
  try{
    const {user,admin}=await memberContext(),input=await jsonInput(request),target=typeof input.targetId==="string"?input.targetId:"";
    if(!uuid(target)||target===user.id)throw new ApiError(400,"Choose another community member.");
    if(!(await memberDirectory()).some(member=>member.profile_id===target))throw new ApiError(404,"This member is not listed in the directory.");
    const pair=`and(requester_id.eq.${user.id},recipient_id.eq.${target}),and(requester_id.eq.${target},recipient_id.eq.${user.id})`;
    const {data:existing,error:readError}=await admin.from("community_connections").select("id,status").or(pair).maybeSingle();
    if(readError)throw new ApiError(503,"Unable to open the conversation.");
    if(existing){if(existing.status==="declined")throw new ApiError(403,"This message request was declined.");return NextResponse.json({connection:existing});}
    const {data,error}=await admin.from("community_connections").insert({requester_id:user.id,recipient_id:target,status:"accepted"}).select("id,status").single();
    if(error?.code==="23505"){
      const duplicate=await admin.from("community_connections").select("id,status").or(pair).maybeSingle();
      if(duplicate.error||!duplicate.data)throw new ApiError(503,"Unable to open the conversation.");
      return NextResponse.json({connection:duplicate.data});
    }
    if(error)throw new ApiError(503,"Unable to start a conversation.");
    return NextResponse.json({connection:data},{status:201});
  }catch(error){return apiFailure(error);}
}
