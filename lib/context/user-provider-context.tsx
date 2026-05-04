"use client"
import { IUser } from "@/db/schema";
import { createContext, useContext } from "react";

interface UserContextType{
    user:IUser| null
}
interface UserProviderType{
    children:React.ReactNode,
    user:IUser| null
}

const  UserContext=createContext<UserContextType |undefined>(undefined)
export const UserProvider=({children,user}:UserProviderType)=>{
    return(
    <UserContext value={{user}}>
            {children}
        </UserContext>
    )
}


export const useUser=()=>{
    const context=useContext(UserContext)
    if(context===undefined){
        throw new Error("useUser must be used within a UserProvider")
    }
    return context
}