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
import { RegisterFormValue, RegisterSchema } from "@/lib/types/auth-types"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import Link from "next/link"
import { useRegister } from "@/lib/hooks/auth/useAuth"
import { useState } from "react"
import { toast } from "sonner"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router=useRouter() 
  const [isLoading, setIsLoading]=useState(false)

  // use form
  const form=useForm<RegisterFormValue>({
  resolver:zodResolver(RegisterSchema),
  defaultValues:{
    email:"",
    name:"",
    password:""
  }
  })

  // onsubmit
  const onSubmit= async(data:RegisterFormValue)=>{
    try {
      setIsLoading(true)
      const {success, error}=await useRegister(data) 
        if(success){
          toast.success("Account created successfully",{
            description:"Please verify your email before signing in"
          })
          router.push("/auth/sign-in")
          return
        }
        if(error){
          toast.error("Failed to create account",{
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
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
         Sign up to started with using ai-rag-agent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* name */}
      <FormField control={form.control} name="name"
        render={({field})=>(
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input placeholder="Samatar Baxnaan" type="name" autoComplete="name" {...field}/>
            </FormControl>
            <FormMessage className="text-primary"/>
          </FormItem>
        )}
      />

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
               Creating account...
              </>
            ):(
             'Create Account'
            )
          }
         
        </Button>
          <Button variant="outline" className="w-full" type="button" >
                  Sign up with Google
                </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={"/auth/sign-in"} className="font-medium text-foreground hover:underline">
          Sign in
          </Link>
        </div>
        </div>
      
      </CardFooter>
      </form>
      </Form>
    </Card>
  )
}
