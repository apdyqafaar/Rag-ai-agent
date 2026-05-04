"use server"
import SiderbarNavigation from "@/components/dashboard/SiderbarNavigation"
import Header from "@/components/header"
import { IUser } from "@/db/schema"
import { auth } from "@/lib"
import { UserRole } from "@/lib/config"
import { UserProvider } from "@/lib/context"
import { Shield } from "lucide-react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const layout =  async({ children }:{children: React.ReactNode}) => {
  const userData=await auth.api.getSession({
          headers:await headers()
      })
      // console.log(userData?.user)
      if(!userData){
          return redirect("/auth/sign-in")
      }
      if(userData.user.role!==UserRole.USER){
        return <div className="h-screen w-full flex items-center justify-center">
            <div className="text-center space-y-3">
                     <Shield className="w-12 h-12 text-red-500 mx-auto"/>
                <h1 className="text-2xl font-bold">Unauthorized</h1>
                <p className="text-muted-foreground">You do not have permission to access this page, this page is for users</p>
            </div>
        </div>
      }
    return (
      <div className="max-w-5xl mx-auto p-2">
         <UserProvider user={userData?.user as IUser?? null}>
          <Header user={userData.user as IUser}/>
      <div className="flex gap-2">
        {/* sidebar */}
       <SiderbarNavigation user={userData.user as IUser}/>

       <main className="flex-1  p-3">
        {children}
      </main>

      </div>
    
      </UserProvider>
      </div>
     
    )
  
}

export default layout