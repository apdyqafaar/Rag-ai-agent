"use client"
import { getDashboardPath, UserRole } from '@/lib/config'
import { useUser } from '@/lib/context'
import { redirect } from 'next/navigation'

const dashboardPage = async() => {
  // const user=await auth.api.getSession({
  //       headers:await headers()
  //   })
  //   // console.log(user)
  //   if(!user){
  //       return redirect("/auth/sign-in")
  //   }
     const user=useUser()
    const dashboardPath=getDashboardPath(user?.user?.role as UserRole)
    // console.log("dashboardPath",dashboardPath)
    
  return redirect(dashboardPath)
}

export default dashboardPage