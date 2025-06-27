import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import SessionWrapper from "./SessionWrapper"
import SupportChatWrapper from "./components/SupportChatWrapper"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata = {
    title: "Pajak App",
    description: "Pajak App",
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                style={{ background: "#f3f4f6" }}
            >
                <SessionWrapper>
                    {children}
                    <SupportChatWrapper />
                </SessionWrapper>
            </body>
        </html>
    )
}
