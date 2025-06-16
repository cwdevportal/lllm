'use client'

import { UserButton, useAuth } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SearchInput } from './SearchInput'
import { isTeacher as checkIsTeacher } from '@/lib/teacher'

export const NavbarRoutes = () => {
  const { userId } = useAuth()
  const pathname = usePathname()

  const isTeacherPage = pathname?.startsWith('/teacher')
  const isPlayerPage = pathname?.includes('/courses')
  const isSearchPage = pathname === '/search'

  const [loading, setLoading] = useState(false)
  const [isTeacherUser, setIsTeacherUser] = useState(false)

  useEffect(() => {
    const checkTeacher = async () => {
      if (!userId) return

      const cacheKey = `teacher-status-${userId}`
      const cachedValue = localStorage.getItem(cacheKey)

      if (cachedValue !== null) {
        setIsTeacherUser(cachedValue === 'true')
        return
      }

      setLoading(true)
      const result = await checkIsTeacher(userId)
      localStorage.setItem(cacheKey, result.toString())
      setIsTeacherUser(result)
      setLoading(false)
    }

    checkTeacher()
  }, [userId])

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isPlayerPage ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </Link>
        ) : loading ? (
          <Button size="sm" variant="ghost" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading
          </Button>
        ) : isTeacherUser ? (
          <Link href="/teacher/courses">
            <Button size="sm" variant="ghost">
              Teacher mode
            </Button>
          </Link>
        ) : null}
        <UserButton afterSignOutUrl="/" />
      </div>
    </>
  )
}
