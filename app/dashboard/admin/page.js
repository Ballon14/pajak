"use client"
import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import AdminSidebar from "@/app/components/AdminSidebar"

export default function AdminDashboardPage() {
    const { data: session, status } = useSession()
    const [users, setUsers] = useState([])
    const [taxes, setTaxes] = useState([])
    const [loading, setLoading] = useState(true)
    const [userPage, setUserPage] = useState(1)
    const [taxPage, setTaxPage] = useState(1)
    const pageSize = 10
    const pagedUsers = users.slice(
        (userPage - 1) * pageSize,
        userPage * pageSize
    )
    const pagedTaxes = taxes.slice((taxPage - 1) * pageSize, taxPage * pageSize)
    const userTotalPages = Math.ceil(users.length / pageSize) || 1
    const taxTotalPages = Math.ceil(taxes.length / pageSize) || 1
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Hitung total nominal pajak dan statistik status (pindahkan ke atas sebelum return)
    const pajakStats = useMemo(() => {
        let totalNominal = 0
        let count = { lunas: 0, "belum lunas": 0, proses: 0 }
        taxes.forEach((tax) => {
            // Cek semua kemungkinan field nominal
            let nominal = 0
            if (typeof tax.jumlah === "number") nominal = tax.jumlah
            else if (tax.jumlah) nominal = parseFloat(tax.jumlah) || 0
            else if (typeof tax.total === "number") nominal = tax.total
            else if (tax.total) nominal = parseFloat(tax.total) || 0
            else if (typeof tax.nominal === "number") nominal = tax.nominal
            else if (tax.nominal) nominal = parseFloat(tax.nominal) || 0
            if (nominal > 0) totalNominal += nominal
            else if (tax.jumlah || tax.total || tax.nominal) {
                // Untuk debugging, log jika ada value tapi tidak bisa di-parse
                console.warn("Data pajak tidak bisa diparse:", tax)
            }
            const status = (tax.status || "").toLowerCase()
            if (status === "lunas") count.lunas++
            else if (status === "belum lunas") count["belum lunas"]++
            else if (status === "proses") count.proses++
        })
        const total = taxes.length
        return {
            totalNominal,
            count,
            percent: {
                lunas: total ? Math.round((count.lunas / total) * 100) : 0,
                "belum lunas": total
                    ? Math.round((count["belum lunas"] / total) * 100)
                    : 0,
                proses: total ? Math.round((count.proses / total) * 100) : 0,
            },
            total,
        }
    }, [taxes])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const usersRes = await fetch("/api/admin/users")
            const usersData = await usersRes.json()
            setUsers(usersData)
            const taxesRes = await fetch("/api/admin/tax")
            const taxesData = await taxesRes.json()
            setTaxes(taxesData)
            setLoading(false)
        }
        fetchData()
    }, [])

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth < 768) setSidebarOpen(false)
            else setSidebarOpen(true)
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    if (status === "loading") return <div>Loading...</div>
    if (!session || session.user.role !== "admin") {
        return (
            <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
                Akses ditolak. Halaman ini hanya untuk admin.
            </div>
        )
    }

    // Statistik
    const totalUser = users.length
    const totalPajak = taxes.length
    const totalNominal = taxes.reduce(
        (sum, t) => sum + (parseFloat(t.jumlah) || 0),
        0
    )

    return (
        <div style={{ display: "flex" }}>
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main
                style={{
                    marginLeft: isMobile ? 0 : sidebarOpen ? 230 : 60,
                    width: "100%",
                    minHeight: "100vh",
                    background: "#f7f8fa",
                    transition: "margin-left 1s",
                    paddingBottom: 32,
                }}
            >
                <div
                    style={{ maxWidth: 1200, margin: "40px auto", padding: 0 }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 18,
                            padding: "32px 32px 12px 32px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 38,
                                color: "#2563eb",
                                background: "#e0e7ff",
                                borderRadius: 16,
                                width: 60,
                                height: 60,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 60,
                            }}
                        >
                            <span role="img" aria-label="admin">
                                🛡️
                            </span>
                        </div>
                        <div style={{ minWidth: 200 }}>
                            <h1
                                style={{
                                    margin: 0,
                                    color: "#222",
                                    fontWeight: 800,
                                    fontSize: 28,
                                }}
                            >
                                Dashboard Admin
                            </h1>
                            <div
                                style={{
                                    color: "#555",
                                    fontSize: 16,
                                    marginTop: 4,
                                }}
                            >
                                Kelola data user & pajak secara terpusat dan
                                efisien.
                            </div>
                        </div>
                    </div>
                    {/* Statistik */}
                    <div
                        style={{
                            display: "flex",
                            gap: 24,
                            margin: "32px 0 24px 0",
                            padding: "0 32px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                minWidth: 180,
                                background: "#f7f8fa",
                                borderRadius: 14,
                                padding: 24,
                                boxShadow: "0 2px 8px #2563eb11",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                marginBottom: 16,
                            }}
                        >
                            <div
                                style={{
                                    color: "#2563eb",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                Total User
                            </div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: "#222",
                                    marginTop: 6,
                                }}
                            >
                                {totalUser}
                            </div>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                minWidth: 180,
                                background: "#f7f8fa",
                                borderRadius: 14,
                                padding: 24,
                                boxShadow: "0 2px 8px #2563eb11",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                marginBottom: 16,
                            }}
                        >
                            <div
                                style={{
                                    color: "#2563eb",
                                    fontWeight: 700,
                                    fontSize: 16,
                                }}
                            >
                                Total Data Pajak
                            </div>
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: "#222",
                                    marginTop: 6,
                                }}
                            >
                                {totalPajak}
                            </div>
                        </div>
                    </div>
                    {/* Data User */}
                    <div
                        id="user-list"
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            boxShadow: "0 2px 12px #2563eb11",
                            margin: "32px 16px 24px 16px",
                            padding: 16,
                            overflowX: "auto",
                        }}
                    >
                        <h3
                            style={{
                                color: "#2563eb",
                                marginBottom: 14,
                                fontWeight: 700,
                                fontSize: 18,
                            }}
                        >
                            Data User
                        </h3>
                        <div
                            style={{
                                marginBottom: 10,
                                color: "#1e3a8a",
                                fontWeight: 600,
                                fontSize: 15,
                            }}
                        >
                            Total User: {users.length}
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    background: "#fff",
                                    fontSize: "clamp(13px,2vw,16px)",
                                }}
                            >
                                <thead>
                                    <tr style={{ background: "#e0e7ff" }}>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Email
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Nama
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Role
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                style={{
                                                    textAlign: "center",
                                                    color: "#888",
                                                    padding: 18,
                                                }}
                                            >
                                                Tidak ada data user
                                            </td>
                                        </tr>
                                    ) : (
                                        pagedUsers.map((user, idx) => (
                                            <tr
                                                key={user._id || idx}
                                                style={{
                                                    background:
                                                        idx % 2 === 0
                                                            ? "#fff"
                                                            : "#f9fafb",
                                                    transition:
                                                        "background 0.2s",
                                                }}
                                                onMouseOver={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#dbeafe")
                                                }
                                                onMouseOut={(e) =>
                                                    (e.currentTarget.style.background =
                                                        idx % 2 === 0
                                                            ? "#fff"
                                                            : "#f9fafb")
                                                }
                                            >
                                                <td
                                                    style={{
                                                        padding: 14,
                                                        border: "1.5px solid #c7d2fe",
                                                        color: "#222",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {user.email}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: 14,
                                                        border: "1.5px solid #c7d2fe",
                                                        color: "#222",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {user.name}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: 14,
                                                        border: "1.5px solid #c7d2fe",
                                                        color: "#2563eb",
                                                        textTransform:
                                                            "capitalize",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {user.role === "admin"
                                                        ? "admin"
                                                        : "user"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <Pagination
                                page={userPage}
                                setPage={setUserPage}
                                totalPages={userTotalPages}
                            />
                        </div>
                    </div>
                    {/* Data Pajak */}
                    <div
                        id="tax-list"
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            boxShadow: "0 2px 12px #2563eb11",
                            margin: "0 16px 32px 16px",
                            padding: 16,
                            overflowX: "auto",
                        }}
                    >
                        <h3
                            style={{
                                color: "#2563eb",
                                marginBottom: 14,
                                fontWeight: 700,
                                fontSize: 18,
                            }}
                        >
                            Data Pajak
                        </h3>
                        <div
                            style={{
                                marginBottom: 10,
                                color: "#1e3a8a",
                                fontWeight: 600,
                                fontSize: 15,
                            }}
                        >
                            Total Pajak: {taxes.length}
                            <br />
                            Total Nominal Pajak:{" "}
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>
                                {pajakStats.totalNominal
                                    ? `Rp ${pajakStats.totalNominal.toLocaleString(
                                          "id-ID"
                                      )}`
                                    : "-"}
                            </span>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: 18,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div
                                    style={{
                                        color: "#2563eb",
                                        fontWeight: 600,
                                        fontSize: 15,
                                    }}
                                >
                                    Lunas: {pajakStats.percent.lunas}%
                                </div>
                                <div
                                    style={{
                                        color: "#fbbf24",
                                        fontWeight: 600,
                                        fontSize: 15,
                                    }}
                                >
                                    Proses: {pajakStats.percent.proses}%
                                </div>
                                <div
                                    style={{
                                        color: "#ef4444",
                                        fontWeight: 600,
                                        fontSize: 15,
                                    }}
                                >
                                    Belum Lunas:{" "}
                                    {pajakStats.percent["belum lunas"]}%
                                </div>
                            </div>
                            <PieChart
                                data={[
                                    {
                                        label: "Lunas",
                                        value: pajakStats.count.lunas,
                                        color: "#2563eb",
                                    },
                                    {
                                        label: "Proses",
                                        value: pajakStats.count.proses,
                                        color: "#fbbf24",
                                    },
                                    {
                                        label: "Belum Lunas",
                                        value: pajakStats.count["belum lunas"],
                                        color: "#ef4444",
                                    },
                                ]}
                            />
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    background: "#fff",
                                    fontSize: "clamp(13px,2vw,16px)",
                                }}
                            >
                                <thead>
                                    <tr style={{ background: "#e0e7ff" }}>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Nama UserId
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Nama
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Alamat
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Tahun
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Status
                                        </th>
                                        <th
                                            style={{
                                                padding: 14,
                                                border: "1.5px solid #c7d2fe",
                                                fontWeight: 800,
                                                color: "#1e3a8a",
                                                textAlign: "left",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedTaxes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    textAlign: "center",
                                                    color: "#888",
                                                    padding: 18,
                                                }}
                                            >
                                                Tidak ada data pajak
                                            </td>
                                        </tr>
                                    ) : (
                                        pagedTaxes.map((tax, idx) => {
                                            const user = users.find(
                                                (u) =>
                                                    u._id === tax.userId ||
                                                    u._id?.toString() ===
                                                        tax.userId
                                            )
                                            return (
                                                <tr
                                                    key={tax._id || idx}
                                                    style={{
                                                        background:
                                                            idx % 2 === 0
                                                                ? "#fff"
                                                                : "#f9fafb",
                                                        transition:
                                                            "background 0.2s",
                                                    }}
                                                    onMouseOver={(e) =>
                                                        (e.currentTarget.style.background =
                                                            "#dbeafe")
                                                    }
                                                    onMouseOut={(e) =>
                                                        (e.currentTarget.style.background =
                                                            idx % 2 === 0
                                                                ? "#fff"
                                                                : "#f9fafb")
                                                    }
                                                >
                                                    <td
                                                        style={{
                                                            padding: 14,
                                                            border: "1.5px solid #c7d2fe",
                                                            color: "#222",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {user ? user.name : "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 14,
                                                            border: "1.5px solid #c7d2fe",
                                                            color: "#222",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {tax.name || "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 14,
                                                            border: "1.5px solid #c7d2fe",
                                                            color: "#222",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {tax.address || "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 14,
                                                            border: "1.5px solid #c7d2fe",
                                                            color: "#222",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {tax.year || "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 14,
                                                            border: "1.5px solid #c7d2fe",
                                                            color: "#222",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {tax.status || "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 14,
                                                            border: "1.5px solid #c7d2fe",
                                                            color: "#222",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {tax.jumlah !==
                                                            undefined &&
                                                        tax.jumlah !== null &&
                                                        tax.jumlah !== "" ? (
                                                            `Rp ${parseFloat(
                                                                tax.jumlah
                                                            ).toLocaleString(
                                                                "id-ID"
                                                            )}`
                                                        ) : tax.total !==
                                                              undefined &&
                                                          tax.total !== null &&
                                                          tax.total !== "" ? (
                                                            `Rp ${parseFloat(
                                                                tax.total
                                                            ).toLocaleString(
                                                                "id-ID"
                                                            )}`
                                                        ) : tax.nominal !==
                                                              undefined &&
                                                          tax.nominal !==
                                                              null &&
                                                          tax.nominal !== "" ? (
                                                            `Rp ${parseFloat(
                                                                tax.nominal
                                                            ).toLocaleString(
                                                                "id-ID"
                                                            )}`
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    color: "red",
                                                                }}
                                                            >
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                            <Pagination
                                page={taxPage}
                                setPage={setTaxPage}
                                totalPages={taxTotalPages}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <style>{`
                @media (max-width: 900px) {
                    main { margin-left: 60px !important; }
                }
                @media (max-width: 768px) {
                    main { margin-left: 0 !important; padding: 0 2vw !important; }
                    .sidebar { width: 0 !important; }
                    .dashboard-header, .dashboard-stats { flex-direction: column !important; gap: 12px !important; }
                    table { font-size: 13px !important; }
                    th, td { padding: 8px !important; }
                }
                @media (max-width: 500px) {
                    main { padding: 0 1vw !important; }
                    h1, h3 { font-size: 17px !important; }
                    .dashboard-header { gap: 8px !important; }
                }
            `}</style>
        </div>
    )
}

function PieChart({ data }) {
    // data: array of { label, value, color }
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1
    let acc = 0
    const slices = data.map((d, i) => {
        const start = acc
        const angle = (d.value / total) * 360
        acc += angle
        return { ...d, start, angle }
    })
    // SVG arc generator
    function describeArc(cx, cy, r, startAngle, endAngle) {
        const rad = (deg) => (Math.PI / 180) * deg
        const x1 = cx + r * Math.cos(rad(startAngle - 90))
        const y1 = cy + r * Math.sin(rad(startAngle - 90))
        const x2 = cx + r * Math.cos(rad(endAngle - 90))
        const y2 = cy + r * Math.sin(rad(endAngle - 90))
        const largeArc = endAngle - startAngle > 180 ? 1 : 0
        return [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
            "Z",
        ].join(" ")
    }
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 18,
            }}
        >
            <svg width={120} height={120} viewBox="0 0 120 120">
                {slices.map((s, i) => (
                    <path
                        key={i}
                        d={describeArc(60, 60, 54, s.start, s.start + s.angle)}
                        fill={s.color}
                        stroke="#fff"
                        strokeWidth={2}
                        opacity={s.value === 0 ? 0.15 : 1}
                    />
                ))}
                {/* Donut hole */}
                <circle cx={60} cy={60} r={34} fill="#fff" />
                {/* Persentase utama di tengah */}
                <text
                    x={60}
                    y={66}
                    textAnchor="middle"
                    fontWeight="bold"
                    fontSize={22}
                    fill="#2563eb"
                >
                    {data[0]?.value
                        ? Math.round((data[0].value / total) * 100)
                        : 0}
                    %
                </text>
            </svg>
            <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
                {data.map((d, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: 7,
                                background: d.color,
                                display: "inline-block",
                            }}
                        ></span>
                        <span
                            style={{
                                color: d.color,
                                fontWeight: 600,
                                fontSize: 15,
                            }}
                        >
                            {d.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Pagination({ page, setPage, totalPages }) {
    if (totalPages <= 1) return null
    const pages = []
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                margin: "18px 0 0 0",
            }}
        >
            <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={pageBtnStyle}
            >
                &laquo;
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                        ...pageBtnStyle,
                        background: p === page ? "#2563eb" : "#e0e7ff",
                        color: p === page ? "#fff" : "#222",
                    }}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                style={pageBtnStyle}
            >
                &raquo;
            </button>
        </div>
    )
}

const pageBtnStyle = {
    border: "none",
    borderRadius: 6,
    padding: "7px 14px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    background: "#e0e7ff",
    color: "#222",
}
