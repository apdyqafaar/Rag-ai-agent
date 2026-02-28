
import { betterAuth } from "better-auth/minimal"; 
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {schema} from "../db/schema/index"
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db/db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
         schema,
    }),
     emailAndPassword:{
        enabled:true,
        autoSignIn:false
    },
    
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
            prompt:"select_account consent",
              accessType: "offline", 
                     fetchOptions: {
        timeout: 20000, // 10 seconds
      }
        }, 
    },

    session:{
        cookieCache:{
            enabled:true,
            maxAge:5 * 60
        }
    },

      plugins: [nextCookies()],
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN"