import { NextResponse } from "next/server";
import { memberDirectory } from "@/lib/community/members";
import { apiFailure } from "@/lib/developer/api";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET() {
  try{
    const members=await memberDirectory();
    const {data,error}=await createAdminClient().rpc("community_follower_counts",{member_ids:members.map(member=>member.profile_id)});
    if(error)throw error;
    const counts=new Map((data || []).map((row:{profile_id:string;follower_count:number})=>[row.profile_id,Number(row.follower_count)]));
    return NextResponse.json({members:members.map(member=>({...member,follower_count:counts.get(member.profile_id) || 0}))},{headers:{"Cache-Control":"public, s-maxage=10"}});
  }
  catch(error){return apiFailure(error);}
}
