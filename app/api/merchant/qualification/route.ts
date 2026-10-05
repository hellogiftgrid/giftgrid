import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
 const client=await createClient(); const {data:{user}}=await client.auth.getUser();
 if(!user)return NextResponse.json({error:"Sign in first."},{status:401});
 const {data:profile}=await client.from("profiles").select("role").eq("id",user.id).single();
 if(profile?.role!=="merchant")return NextResponse.json({required:false},{headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({required:false,qualified:true,deadline:null,visible:true},{headers:{"Cache-Control":"private, no-store"}});
}
