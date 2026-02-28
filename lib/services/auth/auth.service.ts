import { authClient } from "@/lib/auth-client";
import { LoginFormValue, RegisterFormValue } from "@/lib/types/auth-types";


export class AuthService{
  // register
     async register({email, name, password}:RegisterFormValue){
          try {
              const {data,error}= await authClient.signUp.email({
                    email,
                    name,
                    password,
                    callbackURL:"/auth/sign-in"
               },{
                    onSuccess:(data)=>{
                        
                    },
                    onError:(error)=>{
                         console.log("Registration failed", error)
                    }
               })

               if(data){
                   return {success:true}  
               }else{
                    
                       return {success:false, error:error?.message || "Failed to register"}
               }

               return {success:false, error:"Something went wrong"}
          } catch (error : any) {
               return {success:false, error:error.message || "Something went wrong"}
          }
     }

     // login
     async login({email, password}:LoginFormValue){
          try {
              const {data,error}= await authClient.signIn.email({
                    email,
                    password,
                    callbackURL:"/"
               },{
                    onError:(error)=>{
                         console.log("Login to your account failed", error)
                    }
               })

               if(data){
                   return {success:true}  
               }else{
                    
                       return {success:false, error:error?.message || "Failed to login"}
               }

               return {success:false, error:"Something went wrong"}
          } catch (error : any) {
               return {success:false, error:error.message || "Something went wrong"}
          }
     }

     // social login
     async socialLogin(provider:"google"){
           const data = await authClient.signIn.social({
    provider,
    callbackURL:"/dashboard"
  });
     }
}
export const authService=new AuthService()