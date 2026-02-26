import { authService } from "@/lib/services/auth/auth.service"
import { LoginFormValue, RegisterFormValue } from "@/lib/types/auth-types"

// register
export const useRegister= async(data:RegisterFormValue)=>{
    return authService.register(data)
}

// register
export const useLogin= async(data:LoginFormValue)=>{
    return authService.login(data)
}