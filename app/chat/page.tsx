"use server"

import { auth } from "@/lib"
import { headers } from "next/headers"

const page = async() => {
  const user=await auth.api.getSession({
    headers:await headers()
  })

  console.log(user)
  return (
    <div>page</div>
  )
}

export default page