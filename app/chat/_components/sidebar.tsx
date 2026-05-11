import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ConversationLinks from "./conversationLinks"
import CreateConversation from "./createConversation"
import DocumentInfo from "./documentInfo"
import UserProfile from "./userProfile"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowBigLeftIcon } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href={"/dashboard"}className="text-amber-600">
        <ArrowBigLeftIcon/>
        </Link>
        <DocumentInfo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup> 
          <CreateConversation />
          <Suspense>
            <ConversationLinks/>
          </Suspense>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}