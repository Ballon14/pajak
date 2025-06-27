"use client"
import { useEffect, useState } from "react"
import AdminSidebar from "@/app/components/AdminSidebar"
import LoadingSpinner from "@/app/components/LoadingSpinner"

function formatRupiah(num) {
    if (num === undefined || num === null || isNaN(num)) return "-"
    return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

export default function TaxListPage() {
    const [taxes, setTaxes] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState({ open: false, mode: "add", tax: null })
    const [form, setForm] = useState({
        userId: "",
        name: "",
        address: "",
        year: "",
        status: "",
        total: "",
    })
    const [error, setError] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
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

    async function fetchData() {
        setLoading(true)
        const [taxRes, userRes] = await Promise.all([
            fetch("/api/admin/tax"),
            fetch("/api/admin/users"),
        ])
        const taxData = await taxRes.json()
        const userData = await userRes.json()
        setTaxes(taxData.taxes || taxData || [])
        setUsers(userData.users || userData || [])
        setLoading(false)
    }

    function openAdd() {
        setForm({
            userId: users[0]?._id || "",
            name: "",
            address: "",
            year: "",
            status: "",
            total: "",
        })
        setModal({ open: true, mode: "add", tax: null })
        setError("")
    }
    function openEdit(tax) {
        setForm({
            userId: tax.userId || "",
            name: tax.name || "",
            address: tax.address || "",
            year: tax.year || "",
            status: tax.status || "",
            total: tax.total || "",
        })
        setModal({ open: true, mode: "edit", tax })
        setError("")
    }
    function closeModal() {
        setModal({ open: false, mode: "add", tax: null })
        setError("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (
            !form.userId ||
            !form.name ||
            !form.address ||
            !form.year ||
            !form.status ||
            !form.total
        ) {
            setError("Semua field wajib diisi")
            return
        }
        try {
            let res
            if (modal.mode === "add") {
                res = await fetch("/api/admin/tax", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        total: Number(form.total),
                    }),
                })
            } else {
                res = await fetch("/api/admin/tax", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        _id: modal.tax._id,
                        ...form,
                        total: Number(form.total),
                    }),
                })
            }
            if (!res.ok) throw new Error("Gagal menyimpan data")
            closeModal()
            fetchData()
        } catch (err) {
            setError(err.message || "Gagal menyimpan data")
        }
    }

    async function handleDelete(tax) {
        if (!confirm(`Hapus data pajak tahun ${tax.year} milik user ini?`))
            return
        await fetch("/api/admin/tax", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: tax._id }),
        })
        fetchData()
    }

    return (
        <>
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
                        style={{
                            maxWidth: 1000,
                            margin: "40px auto",
                            background: "#fff",
                            borderRadius: 16,
                            boxShadow: "0 2px 12px #2563eb11",
                            padding: 32,
                        }}
                    >
                        <h2
                            style={{
                                color: "#2563eb",
                                fontWeight: 700,
                                fontSize: 24,
                                marginBottom: 24,
                            }}
                        >
                            Listing Pajak
                        </h2>
                        <button
                            onClick={openAdd}
                            style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 22px",
                                fontWeight: 600,
                                fontSize: 16,
                                marginBottom: 18,
                                cursor: "pointer",
                            }}
                        >
                            Tambah Pajak
                        </button>
                        {loading ? (
                            <LoadingSpinner text="Memuat data pajak..." />
                        ) : (
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    background: "#fff",
                                }}
                            >
                                <thead>
                                    <tr style={{ background: "#e0e7ff" }}>
                                        <th style={thStyle}>Nama UserId</th>
                                        <th style={thStyle}>Nama</th>
                                        <th style={thStyle}>Alamat</th>
                                        <th style={thStyle}>Tahun</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Total</th>
                                        <th style={thStyle}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxes.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    textAlign: "center",
                                                    color: "#888",
                                                    padding: 28,
                                                }}
                                            >
                                                Tidak ada data pajak
                                            </td>
                                        </tr>
                                    ) : (
                                        taxes.map((tax, idx) => {
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
                                                    }}
                                                >
                                                    <td style={tdStyle}>
                                                        {user ? user.name : "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {tax.name || "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {tax.address || "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {tax.year || "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {tax.status || "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {tax.total !== undefined
                                                            ? formatRupiah(
                                                                  tax.total
                                                              )
                                                            : "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <button
                                                            onClick={() =>
                                                                openEdit(tax)
                                                            }
                                                            style={{
                                                                ...btnStyle,
                                                                background:
                                                                    "#fbbf24",
                                                                color: "#fff",
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    tax
                                                                )
                                                            }
                                                            style={{
                                                                ...btnStyle,
                                                                background:
                                                                    "#ef4444",
                                                                color: "#fff",
                                                                marginLeft: 8,
                                                            }}
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                        {/* Modal */}
                        {modal.open && (
                            <div
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    width: "100vw",
                                    height: "100vh",
                                    background: "#0008",
                                    zIndex: 1000,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    style={{
                                        background: "#fff",
                                        borderRadius: 14,
                                        padding: 20,
                                        minWidth: 0,
                                        maxWidth: 340,
                                        width: "96vw",
                                        boxShadow: "0 2px 12px #2563eb33",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 14,
                                        position: "relative",
                                    }}
                                >
                                    {/* Tombol close */}
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={{
                                            position: "absolute",
                                            top: 16,
                                            right: 18,
                                            background: "none",
                                            border: "none",
                                            fontSize: 22,
                                            color: "#888",
                                            cursor: "pointer",
                                            fontWeight: 700,
                                            zIndex: 2,
                                        }}
                                        aria-label="Tutup"
                                    >
                                        ×
                                    </button>
                                    <h3
                                        style={{
                                            color: "#2563eb",
                                            fontWeight: 700,
                                            fontSize: 18,
                                            margin: "0 0 8px 0",
                                            textAlign: "center",
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {modal.mode === "add"
                                            ? "Tambah Pajak"
                                            : "Edit Pajak"}
                                    </h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <label style={labelStyle}>User</label>
                                        <select
                                            value={form.userId}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    userId: e.target.value,
                                                }))
                                            }
                                            style={inputStyle}
                                        >
                                            {users.map((u) => (
                                                <option
                                                    key={u._id}
                                                    value={u._id}
                                                >
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div
                                            style={{
                                                color: "#2563eb",
                                                fontWeight: 600,
                                                fontSize: 15,
                                                marginTop: 2,
                                            }}
                                        >
                                            Nama:{" "}
                                            {users.find(
                                                (u) => u._id === form.userId
                                            )?.name || "-"}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <label style={labelStyle}>
                                            Nama (Wajib Pajak)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    name: e.target.value,
                                                }))
                                            }
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <label style={labelStyle}>Alamat</label>
                                        <input
                                            type="text"
                                            value={form.address}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    address: e.target.value,
                                                }))
                                            }
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <label style={labelStyle}>Tahun</label>
                                        <input
                                            type="number"
                                            value={form.year}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    year: e.target.value,
                                                }))
                                            }
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <label style={labelStyle}>Status</label>
                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    status: e.target.value,
                                                }))
                                            }
                                            style={inputStyle}
                                        >
                                            <option value="">
                                                Pilih status
                                            </option>
                                            <option value="lunas">Lunas</option>
                                            <option value="belum lunas">
                                                Belum Lunas
                                            </option>
                                            <option value="ditunda">
                                                Ditunda
                                            </option>
                                        </select>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 8,
                                        }}
                                    >
                                        <label style={labelStyle}>
                                            Total (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.total}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    total: e.target.value,
                                                }))
                                            }
                                            style={inputStyle}
                                        />
                                    </div>
                                    {error && (
                                        <div
                                            style={{
                                                color: "#ef4444",
                                                fontWeight: 600,
                                                textAlign: "center",
                                            }}
                                        >
                                            {error}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 18,
                                            marginTop: 10,
                                            justifyContent: "center",
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            style={{
                                                ...btnStyle,
                                                background: "#2563eb",
                                                color: "#fff",
                                                fontSize: 17,
                                                padding: "10px 28px",
                                            }}
                                        >
                                            {modal.mode === "add"
                                                ? "Tambah"
                                                : "Simpan"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            style={{
                                                ...btnStyle,
                                                background: "#888",
                                                color: "#fff",
                                                fontSize: 17,
                                                padding: "10px 28px",
                                            }}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <style>{`
                @media (max-width: 900px) {
                    main { margin-left: 60px !important; }
                }
                @media (max-width: 768px) {
                    main { margin-left: 0 !important; padding: 0 2vw !important; }
                    .sidebar { width: 0 !important; }
                    table { font-size: 13px !important; }
                    th, td { padding: 8px !important; }
                }
                @media (max-width: 500px) {
                    main { padding: 0 1vw !important; }
                    h1, h3 { font-size: 17px !important; }
                }
            `}</style>
        </>
    )
}

const thStyle = {
    padding: 14,
    border: "1.5px solid #c7d2fe",
    fontWeight: 800,
    color: "#1e3a8a",
    textAlign: "left",
    letterSpacing: 0.5,
}
const tdStyle = {
    padding: 14,
    border: "1.5px solid #c7d2fe",
    color: "#222",
    fontWeight: 500,
}
const btnStyle = {
    border: "none",
    borderRadius: 6,
    padding: "7px 16px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
}
const inputStyle = {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1.5px solid #c7d2fe",
    fontSize: 15,
    fontWeight: 500,
    color: "#222",
    "::placeholder": { color: "#222", opacity: 1 },
}
const labelStyle = {
    fontWeight: 600,
    color: "#1e3a8a",
    marginBottom: 2,
    fontSize: 15,
}
