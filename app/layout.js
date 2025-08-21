import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import SessionWrapper from "./SessionWrapper"
import { NotificationProvider } from "./components/NotificationToast"
import ConditionalLayout from "./components/ConditionalLayout"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata = {
    title: "PajakApp - Tax Management System",
    description: "Professional Tax Management & Analytics Platform",
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NotificationProvider>
                    <SessionWrapper>
                        <ConditionalLayout>{children}</ConditionalLayout>
                    </SessionWrapper>
                </NotificationProvider>
            </body>
        </html>
    )
}
