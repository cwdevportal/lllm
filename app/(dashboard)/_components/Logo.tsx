'use client';

import Image from 'next/image';
import Link from 'next/link';

export const Logo = () => {
	return (
		<Link href='/' className='flex items-center cursor-pointer'>
			<Image src='/logo.svg' height={100} width={130} alt='Logo' />
			<span className='ml-4 text-[#0369a1] font-semibold hidden'>Creative Learnify</span>
		</Link>
	);
};
