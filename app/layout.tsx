import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ToasterProvider } from '@/components/providers/toaster-provider';
import { ConfettiProvider } from '@/components/providers/ConfettiProvider';
import { ThemeProvider } from '@/components/providers/theme-provider'; // 👈 import it

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'CreativeWebCreative Webs Learnify',
	description: 'Creative Webs Learnify is a platform for learning web development.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang='en' suppressHydrationWarning>
				<body className={inter.className}>
					<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
						<ConfettiProvider />
						<ToasterProvider />
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
