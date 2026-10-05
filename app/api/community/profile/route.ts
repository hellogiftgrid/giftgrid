import { GIFTGRID_ADMIN_AVATAR, isGiftGridAdmin } from "@/config/identity";
import { NextResponse } from "next/server";
import { memberContext,ownedCommunityImage } from "@/lib/community/members";
import { ApiError,apiFailure,jsonInput } from "@/lib/developer/api";
export async function GET() {
  try {
    const {supabase,user,admin}=await memberContext();
    const [{data:profile,error},{data:member}]=await Promise.all([supabase.from("profiles").select("full_name,role").eq("id",user.id).single(),admin.from("community_member_profiles").select("display_name,bio,country,avatar_url,is_listed").eq("profile_id",user.id).maybeSingle()]);
    if(error)throw new ApiError(503,"Unable to load your profile.");
    return NextResponse.json({id:user.id,email:user.email,role:profile.role,fullName:profile.full_name,...member,...(isGiftGridAdmin(profile.role) ? {avatar_url:GIFTGRID_ADMIN_AVATAR} : {})},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){return apiFailure(error);}
}
export async function POST(request:Request) {
  try {
    const {supabase,user,admin}=await memberContext(),input=await jsonInput(request);
    const fullName=typeof input.fullName==="string" ? input.fullName.trim() : "";
    const bio=typeof input.bio==="string" ? input.bio.trim() : "",country=typeof input.country==="string" ? input.country.trim() : "";
    if(!fullName || fullName.length>120 || bio.length>1000 || country.length>100 || typeof input.listed!=="boolean")throw new ApiError(400,"Provide your name, a bio up to 1,000 characters, and directory preference.");
    const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).single();
    if(!profile)throw new ApiError(404,"Account profile not found.");
    const avatar=isGiftGridAdmin(profile.role) ? GIFTGRID_ADMIN_AVATAR : input.imagePath ? await ownedCommunityImage(input.imagePath,user.id) : undefined;
    const {error:profileError}=await supabase.from("profiles").update({full_name:fullName}).eq("id",user.id);
    if(profileError)throw new ApiError(503,"Unable to update your name.");
    const {error}=await admin.from("community_member_profiles").upsert({profile_id:user.id,display_name:fullName,kind:profile.role==="merchant" ? "merchant" : "buyer",bio,country,is_listed:input.listed,updated_at:new Date().toISOString(),...(avatar ? {avatar_url:avatar} : {})},{onConflict:"profile_id"});
    if(error)throw new ApiError(503,"Unable to save your community profile.");
    return NextResponse.json({saved:true});
  }catch(error){return apiFailure(error);}
}
