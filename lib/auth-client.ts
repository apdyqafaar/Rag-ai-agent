import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react
import { adminClient } from "better-auth/client/plugins"
import {ac, admin, moderator, user} from "./permissions"

export const authClient =  createAuthClient({
    //you can pass client configuration here
     baseURL: "http://localhost:3000", 
       plugins: [
        adminClient({
            ac,
            roles: {
                admin,
                user,
                moderator
            }
        })  
    ]
})