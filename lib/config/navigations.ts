import { Book, DollarSign, HelpCircle, LayoutDashboard, LucideIcon, Settings, Upload, User } from "lucide-react";

export interface NavigationItem{
    name:string,
    hrf:string,
    icon:LucideIcon,
    badge:string | number
}

export interface NavigationConfig{
    [key:string]:NavigationItem[]
}

// navigation for user
 export const userNavigation:NavigationItem[]=[
     {
        name:"Documents",
        hrf:"/dashboard/user",
        icon:Book,
        badge:""
    },
    {
        name:'Upload',
        hrf:"/dashboard/user/documents",
        icon:Upload,
        badge:"new"
    },
   
    {
        name:"Settings",
        hrf:"/dashboard/user/settings",
        icon:Settings,
        badge:""
    },

 ]


//  / navigation for admin
 export const AdminNavigation:NavigationItem[]=[
    {
        name:"Dashboard",
        hrf:"/dashboard/user",
        icon:LayoutDashboard,
        badge:""
    },
    {
        name:'Documents',
        hrf:"/dashboard/admin/documents",
        icon:Book,
        badge:""
    },
     {
        name:'Billing',
        hrf:"/dashboard/admin/billing",
        icon:DollarSign,
        badge:""
    },
       {
        name:'Users',
        hrf:"/dashboard/admin/Users",
        icon:User,
        badge:""
    },
    {
        name:"Settings",
        hrf:"/dashboard/admin/settings",
        icon:Settings,
        badge:""
    },
    {
        name:"Help",
        hrf:"/dashboard/admin/help",
        icon:HelpCircle,
        badge:""
    }

 ]

 export const getUserNavigation=(role:"user" | "admin")=>{
    switch(role){
        case "user":
            return userNavigation
        case "admin":
            return AdminNavigation
        default:
            return userNavigation
    }
 }