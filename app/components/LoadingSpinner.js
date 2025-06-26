"use client"
import { useEffect, useState } from "react"

export default function LoadingSpinner({ text = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            {/* Glassmorphism background */}
            <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-md shadow-2xl w-24 h-24" />
                {/* Animated SVG spinner with gradient */}
                <svg
                    className="relative z-10 w-20 h-20 animate-spin-slow drop-shadow-xl"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient
                            id="spinner-gradient"
                            x1="0"
                            y1="0"
                            x2="50"
                            y2="50"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#38bdf8" />
                            <stop offset="0.5" stopColor="#6366f1" />
                            <stop offset="1" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="url(#spinner-gradient)"
                        strokeWidth="6"
                        strokeDasharray="90 60"
                        strokeLinecap="round"
                        opacity="0.3"
                    />
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="url(#spinner-gradient)"
                        strokeWidth="6"
                        strokeDasharray="30 120"
                        strokeLinecap="round"
                        className="animate-spin-reverse"
                    />
                </svg>
            </div>
            {/* Shimmer loading text */}
            <span className="relative text-blue-700 font-extrabold text-xl tracking-wide mb-3 overflow-hidden">
                <span className="inline-block animate-shimmer bg-gradient-to-r from-blue-400 via-blue-700 to-cyan-400 bg-[length:200%_100%] bg-clip-text text-transparent">
                    {text}
                </span>
            </span>
            {/* Animated dots, more subtle */}
            <span className="flex gap-1 mt-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s] shadow-md"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-md"></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce shadow-md"></span>
            </span>
            <style jsx>{`
                @keyframes spin-slow {
                    100% {
                        transform: rotate(360deg);
                    }
                }
                .animate-spin-slow {
                    animation: spin-slow 1.6s linear infinite;
                }
                @keyframes spin-reverse {
                    100% {
                        transform: rotate(-360deg);
                    }
                }
                .animate-spin-reverse {
                    animation: spin-reverse 2.2s linear infinite;
                }
                @keyframes shimmer {
                    0% {
                        background-position: -200% 0;
                    }
                    100% {
                        background-position: 200% 0;
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s linear infinite;
                }
            `}</style>
        </div>
    )
}

export function DelayedLoader({ loading, text, children }) {
    const [show, setShow] = useState(loading)
    useEffect(() => {
        let timeout
        if (loading) {
            setShow(true)
        } else {
            timeout = setTimeout(() => setShow(false), 2000)
        }
        return () => clearTimeout(timeout)
    }, [loading])
    if (show) return <LoadingSpinner text={text} />
    return children || null
}
