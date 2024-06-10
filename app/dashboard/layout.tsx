import React, { ReactNode } from 'react'
import SideNav from './components/SideNav'
import ToggleSidebar from './components/ToggleSidebar'
import MobileSideNav from './components/MobileSideNav'
import { readUserSession } from '@/lib/actions'
import { redirect } from 'next/navigation'
import { useUserStore } from '@/lib/store/user'

export default async function Layout({ children }: { children: ReactNode }) {
  const { data: userSession } = await readUserSession()

  if (!userSession.session) {
    return redirect('/auth')
  }

  useUserStore.setState({ user: userSession.session.user })

  return (
    <div className='flex w-full '>
      <div className='flex flex-col h-screen'>
        <SideNav />
        <MobileSideNav />
      </div>

      <div className='w-full p-5 space-y-5 bg-gray-100 sm:flex-1 sm:p-10 dark:bg-inherit'>
        <ToggleSidebar />
        {children}
      </div>
    </div>
  )
}
