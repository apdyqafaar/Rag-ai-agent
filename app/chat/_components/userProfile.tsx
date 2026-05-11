"use client"

import { useUser, useLogout } from "@/lib/hooks/auth"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger, 
    DropdownMenuSeparator, 
    DropdownMenuLabel, 
    DropdownMenuSub, 
    DropdownMenuSubTrigger, 
    DropdownMenuPortal, 
    DropdownMenuSubContent 
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, MoreVertical, LogOut, Monitor } from "lucide-react"

const UserProfile = () => {
    const { data: session, isPending } = useUser()
    const { setTheme } = useTheme()
    
    if (isPending) {
        return (
            <div className="flex items-center gap-2 p-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted shrink-0" />
                <div className="flex flex-col gap-1 w-full">
                    <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                </div>
            </div>
        )
    }

    if (!session?.user) return null;

    const { user } = session;

    const handleLogout = async () => {
        try {
            await useLogout()
            window.location.href = "/sign-in"
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="w-full outline-none">
                <div className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors w-full text-left">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                    <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="h-4 w-4 mr-2 dark:hidden" />
                        <Moon className="h-4 w-4 mr-2 hidden dark:block" />
                        Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <Monitor className="mr-2 h-4 w-4" />
                                System
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserProfile
