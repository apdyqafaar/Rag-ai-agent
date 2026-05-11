import React from 'react'
import { AppSidebar } from '../../_components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

const layout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <SidebarProvider>
         <AppSidebar />
        <main className='flex-1'>
     
      {children}
    </main>
    </SidebarProvider>
    
  )
}

export default layout