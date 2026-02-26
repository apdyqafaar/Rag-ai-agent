import z from "zod";

 export const RegisterSchema=z.object({
    email:z.email({error:"Invalid email address"}).trim().toLowerCase(),
    password:z.string()
    .min(8,{message:"Password Must be at least 8 characters long"})
    .regex(/[A-Z]/, "Password must contain at least one lowercase")
    .regex(/[a-z]/, "Password must contain at least one uppercase")
    .regex(/[0-9]/, "Password must contain at least one number"),
    name:z.string({message:"Name is required"}).min(1,{message:"Name is required"}).trim()
})
export type RegisterFormValue=z.infer<typeof RegisterSchema>

 export const LoginSchema=z.object({
    email:z.email({error:"Invalid email address"}).trim().toLowerCase(),
    password:z.string({message:"Password is required"})
})
export type LoginFormValue=z.infer<typeof LoginSchema>
