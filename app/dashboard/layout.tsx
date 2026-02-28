"use server"
import { db } from "@/db/db";
import { auth } from "@/lib"
import { sql } from "drizzle-orm";
import { headers } from "next/headers"


const layout = async ({ children }:{children: React.ReactNode}) => {
    const user=await auth.api.getSession({
        headers:await headers()
    })
    console.log(user)
//     try {
//     // Test if ANY table works
//     const result = await db.execute(sql`SELECT 1`);
//     console.log("DB connected:", result);
    
//     // Test session table specifically
//     const sessions = await db.execute(sql`SELECT COUNT(*) FROM session`);
//     console.log("Session count:", sessions);
//   } catch (e: any) {
//     console.error("DB ERROR:", e.message);
//   }
  return children
}

export default layout