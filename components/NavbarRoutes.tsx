'use client'

import { UserButton, useAuth } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SearchInput } from './SearchInput'
import { isTeacher as checkIsTeacher } from '@/lib/teacher'

export const NavbarRoutes = () => {
  const { userId } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isTeacherPage = pathname?.startsWith('/teacher')
  const isPlayerPage = pathname?.includes('/courses')
  const isSearchPage = pathname === '/search'

  const [isTeacherUser, setIsTeacherUser] = useState(false)
  const [checkingTeacher, setCheckingTeacher] = useState(false)

  // Preload teacher status (optional: can be removed if you only want to check on click)
  useEffect(() => {
    if (!userId) return
    const cacheKey = `teacher-status-${userId}`
    const cachedValue = localStorage.getItem(cacheKey)
    if (cachedValue !== null) {
      setIsTeacherUser(cachedValue === 'true')
    }
  }, [userId])

  const handleTeacherClick = async () => {
    if (!userId) return
    setCheckingTeacher(true)

    const cacheKey = `teacher-status-${userId}`
    const cachedValue = localStorage.getItem(cacheKey)

    let isTeacher = false
    if (cachedValue !== null) {
      isTeacher = cachedValue === 'true'
    } else {
      isTeacher = await checkIsTeacher(userId)
      localStorage.setItem(cacheKey, isTeacher.toString())
    }

    setCheckingTeacher(false)

    if (isTeacher) {
      router.push('/teacher/courses')
    } else {
      alert('You are not authorized as a teacher.')
    }
  }

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
        ) : (
          <Button size="sm" variant="ghost" onClick={handleTeacherClick} disabled={checkingTeacher}>
            {checkingTeacher ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Teacher mode'
            )}
          </Button>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </>
  )
}
