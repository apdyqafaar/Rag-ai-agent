"use client"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoginFormValue, LoginSchema, RegisterFormValue, RegisterSchema } from "@/lib/types/auth-types"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useLogin } from "@/lib/hooks/auth/useAuth"

export function SigninForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router=useRouter() 
  const [isLoading, setIsLoading]=useState(false)

  // use form
  const form=useForm<LoginFormValue>({
  resolver:zodResolver(LoginSchema),
  defaultValues:{
    email:"",
    password:""
  }
  })

  // onsubmit
  const onSubmit= async(data:LoginFormValue)=>{
    try {
      setIsLoading(true)
      const {success, error}=await useLogin(data) 
        if(success){
          toast.success("Signed in successfully",{
            description:"You have signed in to your account successfully"
          })
          router.push("/dashboard")
          return
        }
        if(error){
          toast.error("Failed to sign in",{
            description:error
          })
        }

    } catch (error) {
      setIsLoading(false)
    }finally{
      setIsLoading(false)
    }
  } 


  return (
    <Card {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
         Sign in to continue using ai-rag-agent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      

         {/* email */}
      <FormField control={form.control} name="email"
        render={({field})=>(
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Samatar@gmail.com" type="email" autoComplete="email" {...field}/>
            </FormControl>
            <FormMessage className="text-primary"/>
          </FormItem>
        )}
      />

         {/* name */}
      <FormField control={form.control} name="password"
        render={({field})=>(
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input placeholder="*****" type="password" autoComplete="current-password" {...field}/>
            </FormControl>
            <FormMessage className="text-primary"/>
          </FormItem>
        )}
      />

      </CardContent>
      <CardFooter>
        <div className="w-full space-y-3">
            <Button type="submit" className="w-full"
        disabled={isLoading}
        >
          {
            isLoading?(
              <>
              <Loader2 className="animate-spin w-4 h-4"/>
               Signing in...
              </>
            ):(
             'Sign in'
            )
          }
         
        </Button>
          <Button variant="outline" className="w-full" type="button" >
                  Sign in with Google
                </Button>
        <div className="text-center text-sm text-muted-foreground">
          if you don`t have an account?{" "}
          <Link href={"/auth/sign-up"} className="font-medium text-foreground hover:underline">
          Sign up
          </Link>
        </div>
        </div>
      
      </CardFooter>
      </form>
      </Form>
    </Card>
  )
}
