"use client"

import { IUser } from "@/db/schema"
import { Button } from "./ui/button"
import { Loader2, LogOutIcon } from "lucide-react"
import {DropdownMenu,
            DropdownMenuTrigger,
            DropdownMenuContent,
            DropdownMenuItem,
        } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ModeToggle } from "./Mode-theme-toggle"
import { useState } from "react"
import { useLogout } from "@/lib/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const Header = ({user}:{user:IUser}) => {
  const [loggingOut, setLoggingOut]=useState(false)
const router=useRouter()
    const handleLogout=async()=>{
        setLoggingOut(true)
        const {success,error}=await useLogout()
        if(success){
           setLoggingOut(false)
           setTimeout(()=>{
            router.push("/auth/sign-in")
           },2000)
        }else{
            toast.error(error||"Something went wrong")
        }
        setLoggingOut(false)
    }
  return (
    <div className="sticky top-0 z-50 p-3 my-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md backdrop-saturate-150 shadow-lg shadow-black/5">
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-zinc-900 dark:text-white">
      <span>Rag AI Agent</span>
    </h2>

    <div className="flex items-center gap-3">
      <ModeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer border border-white/30 dark:border-white/10 hover:ring-4 hover:ring-white/10 transition-all">
            {
              loggingOut?(
                <>
                {/* <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"> */}
                  <div className="flex items-center justify-center w-full">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                {/* </AvatarFallback> */}
                </>
              ):(
                <>
                  <AvatarImage src={user.image as string} alt={user.name} />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </>
              )
            }
          </Avatar>
        </DropdownMenuTrigger>
        
        {/* Added glass effect to the dropdown menu itself */}
        <DropdownMenuContent className="bg-white/70 dark:bg-black/70 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl shadow-2xl min-w-[150px]">
          <DropdownMenuItem className="focus:bg-zinc-500/10 cursor-default">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name || "User"}</p>
          </DropdownMenuItem>
          
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
          
          <DropdownMenuItem className="p-0 focus:bg-transparent">
            <Button
              className="flex w-full items-center justify-start gap-2 cursor-pointer border-none bg-transparent hover:bg-destructive/10 hover:text-destructive text-zinc-600 dark:text-zinc-400 transition-colors"
              type="submit"
              variant={"ghost"}
              onClick={handleLogout}
            >
              <LogOutIcon className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</div>
  )
}

export default Header