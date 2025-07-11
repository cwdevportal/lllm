import React from 'react'
import { MobileSideBar } from './MobileSideBar'
import { NavbarRoutes } from '@/components/NavbarRoutes'

export const Navbar = () => {
  return (<div className="p-4 border-b border-gray-200 dark:border-gray-700 h-full flex items-center bg-white dark:bg-gray-900 shadow-sm">

        <MobileSideBar   />
        <NavbarRoutes />
    </div>
  )
}
