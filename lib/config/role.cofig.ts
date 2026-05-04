

export enum UserRole{
    ADMIN="admin",
    USER="user",
    MODERATOR="moderator"
}

export const isAdmin=(role:UserRole):boolean=>{
 return role===UserRole.ADMIN
}
export const isUser=(role:UserRole):boolean=>{
 return role===UserRole.USER
}
export const isModerator=(role:UserRole):boolean=>{
 return role===UserRole.MODERATOR
}

export const getDashboardPath=(role:UserRole):string=>{
 if(role===UserRole.ADMIN){
    return isAdmin(role)?"/dashboard/admin":"/dashboard/user"
 }else if(role===UserRole.USER){
    return isUser(role)?"/dashboard/user":"/"
 }else if(role===UserRole.MODERATOR){
    return isUser(role)?"/dashboard/moderator":"/"
 }
 return"/"
}