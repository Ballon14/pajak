"use client"
import { useState } from "react"
import SidebarNavigation from "./SidebarNavigation"

export default function MainLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Sidebar Navigation */}
            <SidebarNavigation
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div
                className={`transition-all duration-300 ${
                    sidebarCollapsed ? "ml-20" : "ml-72"
                }`}
            >
                {/* Content Wrapper */}
                <div className="min-h-screen">{children}</div>
            </div>
        </div>
    )
}
