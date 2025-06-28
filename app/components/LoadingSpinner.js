"use client"
import { useEffect, useState } from "react"

export default function LoadingSpinner({
    text = "Loading...",
    progress = null,
    size = "default",
    variant = "default",
    showProgress = false,
}) {
    const [progressValue, setProgressValue] = useState(0)

    useEffect(() => {
        if (progress !== null && showProgress) {
            const timer = setTimeout(() => {
                setProgressValue(Math.min(progress, 100))
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [progress, showProgress])

    const sizeClasses = {
        small: "w-16 h-16",
        default: "w-24 h-24",
        large: "w-32 h-32",
        xl: "w-40 h-40",
    }

    const spinnerSizes = {
        small: "w-12 h-12",
        default: "w-20 h-20",
        large: "w-28 h-28",
        xl: "w-36 h-36",
    }

    const textSizes = {
        small: "text-sm",
        default: "text-xl",
        large: "text-2xl",
        xl: "text-3xl",
    }

    const variants = {
        default: {
            gradient: "from-blue-400 via-blue-700 to-cyan-400",
            bgGradient: "from-blue-400 via-blue-700 to-cyan-400",
            dots: ["bg-blue-400", "bg-blue-500", "bg-cyan-400"],
        },
        success: {
            gradient: "from-green-400 via-green-600 to-emerald-400",
            bgGradient: "from-green-400 via-green-600 to-emerald-400",
            dots: ["bg-green-400", "bg-green-500", "bg-emerald-400"],
        },
        warning: {
            gradient: "from-yellow-400 via-orange-500 to-red-400",
            bgGradient: "from-yellow-400 via-orange-500 to-red-400",
            dots: ["bg-yellow-400", "bg-orange-500", "bg-red-400"],
        },
        error: {
            gradient: "from-red-400 via-red-600 to-pink-400",
            bgGradient: "from-red-400 via-red-600 to-pink-400",
            dots: ["bg-red-400", "bg-red-500", "bg-pink-400"],
        },
    }

    const currentVariant = variants[variant]

    return (
        <div
            className="flex flex-col items-center justify-center py-16 animate-fadeIn"
            role="status"
            aria-label={text}
        >
            {/* Glassmorphism background */}
            <div
                className={`relative flex items-center justify-center mb-6 ${sizeClasses[size]}`}
            >
                <div
                    className={`absolute inset-0 rounded-full bg-white/30 backdrop-blur-md shadow-2xl ${sizeClasses[size]}`}
                />

                {/* Progress ring (if enabled) */}
                {showProgress && (
                    <svg
                        className={`absolute ${sizeClasses[size]} transform -rotate-90`}
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="rgba(59, 130, 246, 0.2)"
                            strokeWidth="4"
                            fill="none"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="url(#progress-gradient)"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${
                                2 * Math.PI * 45 * (1 - progressValue / 100)
                            }`}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                        />
                    </svg>
                )}

                {/* Animated SVG spinner with gradient */}
                <svg
                    className={`relative z-10 ${spinnerSizes[size]} animate-spin-slow drop-shadow-xl`}
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
                        <linearGradient
                            id="progress-gradient"
                            x1="0"
                            y1="0"
                            x2="100"
                            y2="100"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#3b82f6" />
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

            {/* Progress percentage (if enabled) */}
            {showProgress && progress !== null && (
                <div className="mb-4 text-center">
                    <span className="text-3xl font-bold text-blue-700">
                        {Math.round(progressValue)}%
                    </span>
                </div>
            )}

            {/* Shimmer loading text */}
            <span
                className={`relative text-blue-700 font-extrabold tracking-wide mb-3 overflow-hidden ${textSizes[size]}`}
            >
                <span
                    className={`inline-block animate-shimmer bg-gradient-to-r ${currentVariant.gradient} bg-[length:200%_100%] bg-clip-text text-transparent`}
                >
                    {text}
                </span>
            </span>

            {/* Animated dots with better timing */}
            <span className="flex gap-1 mt-1">
                <span
                    className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] shadow-md ${currentVariant.dots[0]}`}
                ></span>
                <span
                    className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] shadow-md ${currentVariant.dots[1]}`}
                ></span>
                <span
                    className={`w-2 h-2 rounded-full animate-bounce shadow-md ${currentVariant.dots[2]}`}
                ></span>
            </span>

            {/* Progress bar (alternative to ring) */}
            {showProgress && progress !== null && (
                <div className="w-48 mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full bg-gradient-to-r ${currentVariant.bgGradient} transition-all duration-500 ease-out`}
                            style={{ width: `${progressValue}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin-slow {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                .animate-spin-slow {
                    animation: spin-slow 1.6s linear infinite;
                }
                @keyframes spin-reverse {
                    0% {
                        transform: rotate(0deg);
                    }
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
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export function DelayedLoader({
    loading,
    text,
    children,
    delay = 300,
    minDisplayTime = 500,
    progress = null,
    showProgress = false,
}) {
    const [show, setShow] = useState(false)
    const [startTime, setStartTime] = useState(null)

    useEffect(() => {
        let timeoutId
        let minTimeId

        if (loading) {
            setStartTime(Date.now())
            timeoutId = setTimeout(() => setShow(true), delay)
        } else {
            if (startTime) {
                const elapsed = Date.now() - startTime
                const remaining = Math.max(0, minDisplayTime - elapsed)

                minTimeId = setTimeout(() => {
                    setShow(false)
                    setStartTime(null)
                }, remaining)
            } else {
                setShow(false)
            }
        }

        return () => {
            clearTimeout(timeoutId)
            clearTimeout(minTimeId)
        }
    }, [loading, delay, minDisplayTime, startTime])

    if (show) {
        return (
            <LoadingSpinner
                text={text}
                progress={progress}
                showProgress={showProgress}
            />
        )
    }

    return children || null
}

export function InlineSpinner({ size = "small", variant = "default" }) {
    return (
        <div className="inline-flex items-center justify-center">
            <svg
                className={`${
                    size === "small" ? "w-4 h-4" : "w-6 h-6"
                } animate-spin`}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                    strokeLinecap="round"
                    className="animate-spin-dash"
                />
            </svg>
        </div>
    )
}
