"use client"

import { IUser } from "@/db/schema"
import { getUserNavigation } from "@/lib/config/navigations"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SiderbarNavigation = ({user}:{user:IUser}) => {
    const path=usePathname()
 const navigations=getUserNavigation(user.role as "user"|"admin")
//  console.log(navigations)
  return (
    <div className="max-w-52 p-3 w-full  rounded-md hidden sm:block
     ">
        <div className="space-y-3">
            {
                navigations?.map(nav=>{
                    const Icon=nav.icon
                    return(
                        <Link key={nav.name+nav.hrf} href={nav.hrf} className={`flex items-center gap-2 p-2 rounded ${path===nav.hrf?"bg-primary/20 border border-primary/20 text-primary":"hover:bg-muted font-medium text-foreground"}`}>
                            <Icon className="w-5 h-5"/>
                            <p className="text-sm">{nav.name}</p>
                        </Link>
                    )
                })
            }
        </div>
    </div>
  )
}

export default SiderbarNavigation