"use client"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar, { Footer } from "../components/Navbar"
import LoadingSpinner from "../components/LoadingSpinner"
import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import dayjs from "dayjs"
import "dayjs/locale/id"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const statusLabel = {
    lunas: "Lunas",
    belum_lunas: "Belum Lunas",
    proses: "Proses",
}

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [form, setForm] = useState({
        name: "",
        address: "",
        total: "",
        year: "",
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [taxes, setTaxes] = useState([])
    const [loading, setLoading] = useState(false)
    const [now, setNow] = useState(() =>
        dayjs().locale("id").format("dddd, D MMMM YYYY • HH:mm:ss [WIB]")
    )

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session?.user?.id) {
            fetchTaxes()
        }
        const interval = setInterval(() => {
            setNow(
                dayjs()
                    .locale("id")
                    .format("dddd, D MMMM YYYY • HH:mm:ss [WIB]")
            )
        }, 1000)
        return () => clearInterval(interval)
        // eslint-disable-next-line
    }, [status])

    async function fetchTaxes() {
        setLoading(true)
        const res = await fetch(`/api/tax?userId=${session.user.id}`)
        const data = await res.json()
        setTaxes(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")
        const res = await fetch("/api/tax", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, userId: session.user.id }),
        })
        const data = await res.json()
        if (!res.ok) setError(data.error || "Gagal menambah data")
        else {
            setSuccess("Data pajak berhasil ditambah")
            setForm({ name: "", address: "", total: "", year: "" })
            fetchTaxes()
        }
    }

    if (status === "loading")
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <LoadingSpinner text="Memuat data sesi..." />
                </div>
                <Footer />
            </div>
        )

    // Greeting
    function getGreeting() {
        const hour = new Date().getHours()
        if (hour < 11) return "Selamat Pagi!"
        if (hour < 15) return "Selamat Siang!"
        if (hour < 18) return "Selamat Sore!"
        return "Selamat Malam!"
    }
    const greeting = getGreeting()
    const userName = session?.user?.name || session?.user?.email || "User"

    // Ringkasan
    const totalPajak = taxes.reduce((sum, t) => sum + (Number(t.total) || 0), 0)
    const pajakLunas = taxes
        .filter((t) => t.status === "lunas")
        .reduce((sum, t) => sum + (Number(t.total) || 0), 0)
    const pajakTunggakan = taxes
        .filter((t) => t.status === "belum_lunas")
        .reduce((sum, t) => sum + (Number(t.total) || 0), 0)
    const persenLunas = totalPajak ? (pajakLunas / totalPajak) * 100 : 0
    const persenTunggakan = totalPajak ? (pajakTunggakan / totalPajak) * 100 : 0
    const countLunas = taxes.filter((t) => t.status === "lunas").length
    const countBelum = taxes.filter((t) => t.status === "belum_lunas").length
    const countProses = taxes.filter((t) => t.status === "proses").length

    // Statistik per tahun untuk masing-masing status
    const statsLunas = {}
    const statsBelumLunas = {}
    const statsProses = {}
    taxes.forEach((t) => {
        const year = t.year
        const total = Number(t.total) || 0
        if (t.status === "lunas") {
            statsLunas[year] = (statsLunas[year] || 0) + total
        }
        if (t.status === "belum_lunas") {
            statsBelumLunas[year] = (statsBelumLunas[year] || 0) + total
        }
        if (t.status === "proses") {
            statsProses[year] = (statsProses[year] || 0) + total
        }
    })
    // Gabungkan semua tahun yang ada
    const tahunGabungan = Array.from(
        new Set([
            ...Object.keys(statsLunas),
            ...Object.keys(statsBelumLunas),
            ...Object.keys(statsProses),
        ])
    ).sort()

    // Data untuk grafik
    const taxesByYear = taxes.reduce((acc, t) => {
        const year = t.year
        const total = Number(t.total) || 0
        acc[year] = (acc[year] || 0) + total
        return acc
    }, {})
    const years = Object.keys(taxesByYear).sort()
    const totals = years.map((y) => taxesByYear[y])

    // Persentase pembayaran tahun terakhir dibanding sebelumnya
    let percent = null
    if (years.length > 1) {
        const last = totals[totals.length - 1]
        const prev = totals[totals.length - 2]
        percent = prev === 0 ? 100 : ((last - prev) / prev) * 100
    }

    // Data recent (5 terbaru)
    const recentTaxes = [...taxes].sort((a, b) => b.id - a.id).slice(0, 5)

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex-grow p-4">
                <div className="max-w-6xl mx-auto">
                    {/* Greeting & User */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between text-white">
                        <div>
                            <div className="text-2xl font-bold mb-1">
                                {greeting}
                            </div>
                            <div className="font-semibold text-lg mb-1">
                                {userName}
                            </div>
                            <div className="text-sm opacity-80">{now}</div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="bg-white/20 rounded-full p-3">
                                <svg
                                    width="32"
                                    height="32"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#fff"
                                        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 14.2a7.2 7.2 0 0 1-6-3.2c.03-2 4-3.1 6-3.1 2 0 5.97 1.1 6 3.1a7.2 7.2 0 0 1-6 3.2Z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {/* Ringkasan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border">
                            <div className="text-gray-500 font-medium">
                                Total Pajak
                            </div>
                            <div className="text-2xl font-bold text-blue-700">
                                Rp {totalPajak.toLocaleString("id-ID")}
                            </div>
                            <div className="text-xs text-gray-400">
                                {taxes.length} Data
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border">
                            <div className="text-gray-500 font-medium flex items-center gap-2">
                                Pajak Lunas{" "}
                                <span className="text-green-600">
                                    <svg
                                        width="18"
                                        height="18"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            fill="#dcfce7"
                                        />
                                        <path
                                            d="M8 12l2 2 4-4"
                                            stroke="#22c55e"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                                Rp {pajakLunas.toLocaleString("id-ID")}
                            </div>
                            <div className="text-xs text-gray-400">
                                {persenLunas.toFixed(2)}% dari total
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border">
                            <div className="text-gray-500 font-medium flex items-center gap-2">
                                Tunggakan{" "}
                                <span className="text-red-600">
                                    <svg
                                        width="18"
                                        height="18"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            fill="#fee2e2"
                                        />
                                        <path
                                            d="M15 9l-6 6M9 9l6 6"
                                            stroke="#ef4444"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">
                                Rp {pajakTunggakan.toLocaleString("id-ID")}
                            </div>
                            <div className="text-xs text-gray-400">
                                {persenTunggakan.toFixed(2)}% dari total
                            </div>
                        </div>
                    </div>
                    {/* Statistik per Tahun (Grouped Bar Chart) */}
                    <div className="bg-white rounded-xl shadow p-6 mb-8 border">
                        <div className="text-lg font-semibold mb-4 text-black">
                            Statistik Pajak per Tahun
                        </div>
                        {tahunGabungan.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                Belum ada data
                            </div>
                        ) : (
                            <div
                                style={{ maxHeight: 350, overflow: "auto" }}
                                className="w-full"
                            >
                                <Bar
                                    data={{
                                        labels: tahunGabungan,
                                        datasets: [
                                            {
                                                label: "Lunas",
                                                data: tahunGabungan.map(
                                                    (th) => statsLunas[th] || 0
                                                ),
                                                backgroundColor: "#22c55e",
                                            },
                                            {
                                                label: "Belum Lunas",
                                                data: tahunGabungan.map(
                                                    (th) =>
                                                        statsBelumLunas[th] || 0
                                                ),
                                                backgroundColor: "#ef4444",
                                            },
                                            {
                                                label: "Proses",
                                                data: tahunGabungan.map(
                                                    (th) => statsProses[th] || 0
                                                ),
                                                backgroundColor: "#eab308",
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: "top" },
                                            title: { display: false },
                                        },
                                        scales: {
                                            x: { stacked: false },
                                            y: { beginAtZero: true },
                                        },
                                    }}
                                    height={350}
                                />
                            </div>
                        )}
                    </div>
                    {/* Recent Data Pajak */}
                    <div className="bg-white rounded-xl shadow p-6 mb-8 border">
                        <div className="text-lg font-semibold mb-4 text-black">
                            Data Pajak Terbaru
                        </div>
                        {recentTaxes.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-gray-400">
                                <svg
                                    width="48"
                                    height="48"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="#f3f4f6"
                                    />
                                    <path
                                        d="M8 12h8M12 8v8"
                                        stroke="#a1a1aa"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="mt-2">Belum ada data</div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentTaxes.map((t, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-lg border hover:shadow transition bg-gray-50 hover:bg-blue-50"
                                    >
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                                            <span className="font-semibold text-blue-700 text-base">
                                                {t.name}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                •
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {t.year}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                •
                                            </span>
                                            <span className="text-sm font-mono text-gray-700">
                                                Rp{" "}
                                                {Number(t.total).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {t.status === "lunas" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="#dcfce7"
                                                        />
                                                        <path
                                                            d="M8 12l2 2 4-4"
                                                            stroke="#22c55e"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    Lunas
                                                </span>
                                            )}
                                            {t.status === "belum_lunas" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="#fee2e2"
                                                        />
                                                        <path
                                                            d="M15 9l-6 6M9 9l6 6"
                                                            stroke="#ef4444"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    Belum Lunas
                                                </span>
                                            )}
                                            {t.status === "proses" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="#fef9c3"
                                                        />
                                                        <path
                                                            d="M12 8v4l2 2"
                                                            stroke="#eab308"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    Proses
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Distribusi Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-green-50 rounded-xl shadow p-6 border flex flex-col gap-2">
                            <div className="text-green-700 font-semibold">
                                Lunas
                            </div>
                            <div className="text-2xl font-bold text-green-700">
                                Rp {pajakLunas.toLocaleString("id-ID")}
                            </div>
                            <div className="text-sm text-green-700">
                                {countLunas} data
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-xl shadow p-6 border flex flex-col gap-2">
                            <div className="text-red-700 font-semibold">
                                Belum Lunas
                            </div>
                            <div className="text-2xl font-bold text-red-700">
                                Rp {pajakTunggakan.toLocaleString("id-ID")}
                            </div>
                            <div className="text-sm text-red-700">
                                {countBelum} data
                            </div>
                        </div>
                        <div className="bg-yellow-50 rounded-xl shadow p-6 border flex flex-col gap-2">
                            <div className="text-yellow-700 font-semibold">
                                Proses
                            </div>
                            <div className="text-2xl font-bold text-yellow-700">
                                Rp{" "}
                                {taxes
                                    .filter((t) => t.status === "proses")
                                    .reduce(
                                        (sum, t) =>
                                            sum + (Number(t.total) || 0),
                                        0
                                    )
                                    .toLocaleString("id-ID")}
                            </div>
                            <div className="text-sm text-yellow-700">
                                {countProses} data
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
