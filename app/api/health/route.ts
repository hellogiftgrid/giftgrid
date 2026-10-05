import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAndroidRelease } from "@/lib/mobile/release";
export async function GET() {
  try {
    const [{error},release]=await Promise.all([createAdminClient().from("developer_apps").select("id").limit(0),getAndroidRelease()]);
    if(error)throw new Error();
    return NextResponse.json({status:"ready",api:"ready",cli:"ready",android:release ? "available" : "awaiting-signed-apk",community:"https://community.degiftgrid.com/",market:"https://community.degiftgrid.com/market"},{headers:{"Cache-Control":"no-store"}});
  }catch{return NextResponse.json({status:"unavailable"},{status:503});}
}
