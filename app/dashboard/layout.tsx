"use server"
import { auth } from "@/lib"
import { headers } from "next/headers"
import { redirect } from "next/navigation";


const layout = async ({ children }:{children: React.ReactNode}) => {
    const user=await auth.api.getSession({
        headers:await headers()
    })
    console.log(user)
    if(!user){
        return redirect("/auth/sign-in")
    }
  return children
}

export default layout