import { db } from "@/db/db";
import { betterAuth } from "better-auth/minimal"; 
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {schema} from "../db/schema/index"
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    emailAndPassword:{
        enabled:true,
    },
    
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
         schema: { 
      ...schema, 
    }, 
    }),

    session:{
        cookieCache:{
            enabled:true,
            maxAge:5 * 60
        }
    },

      plugins: [nextCookies()],
});