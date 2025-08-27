// src/app/providers.tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<body
			className={`${poppins.className} bg-background text-foreground antialiased scrollbar-custom`}
		>
					<NextThemesProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
					</NextThemesProvider>
					<Toaster position="top-center"  richColors/>
		</body>
	);
}