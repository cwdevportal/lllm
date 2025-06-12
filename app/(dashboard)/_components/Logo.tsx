'use client'

import Image from 'next/image'
import Link from 'next/link'

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center cursor-pointer">
      <Image src="/logo.png" height={30} width={30} alt="Logo" />
      <span className="ml-4 text-[#0369a1] font-semibold">LMS</span>
    </Link>
  )
}
