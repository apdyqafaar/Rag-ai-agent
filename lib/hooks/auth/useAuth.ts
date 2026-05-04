import { authClient } from "@/lib/auth-client"
import { authService } from "@/lib/services/auth/auth.service"
import { LoginFormValue, RegisterFormValue } from "@/lib/types/auth-types"

// register
export const useRegister= async(data:RegisterFormValue)=>{
    return authService.register(data)
}

// login
export const useLogin= async(data:LoginFormValue)=>{
    return authService.login(data)
}

// login social
export const useSocialLogin= async(provider:"google")=>{
    return authService.socialLogin(provider)
}
// logout
export const useLogout= async()=>{
    return authService.logout()
}

// get user for client
export const useUser= ()=>{
  return  authClient.useSession()
}