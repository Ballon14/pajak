"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import AdminSidebar from "@/app/components/AdminSidebar"
import LoadingSpinner from "@/app/components/LoadingSpinner"

export default function UserListPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState({ open: false, mode: "add", user: null })
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "user",
        password: "",
        isActive: true,
    })
    const [error, setError] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        fetchUsers()
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

    async function fetchUsers() {
        setLoading(true)
        const res = await fetch("/api/admin/users")
        const data = await res.json()
        setUsers(data.users || data || [])
        setLoading(false)
    }

    function openEdit(user) {
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "",
            isActive: user.isActive !== false,
        })
        setModal({ open: true, mode: "edit", user })
        setError("")
    }
    function closeModal() {
        setModal({ open: false, mode: "add", user: null })
        setError("")
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        if (!form.name || !form.email) {
            setError("Nama dan email wajib diisi")
            return
        }
        try {
            let res
            const payload = { ...form }
            if (!form.password) delete payload.password
            if (modal.mode === "add") {
                res = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            } else {
                res = await fetch(`/api/admin/users/${modal.user._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, _id: modal.user._id }),
                })
            }
            if (!res.ok) throw new Error("Gagal menyimpan data")
            closeModal()
            fetchUsers()
        } catch (err) {
            setError(err.message || "Gagal menyimpan data")
        }
    }

    async function handleDelete(user) {
        if (!confirm(`Hapus user ${user.name}?`)) return
        await fetch("/api/admin/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: user._id }),
        })
        fetchUsers()
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
                            maxWidth: 900,
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
                            Listing User
                        </h2>
                        {loading ? (
                            <LoadingSpinner text="Memuat data user..." />
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
                                        <th style={thStyle}>Nama</th>
                                        <th style={thStyle}>Email</th>
                                        <th style={thStyle}>Role</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                style={{
                                                    textAlign: "center",
                                                    color: "#888",
                                                    padding: 28,
                                                }}
                                            >
                                                Tidak ada data user
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, idx) => (
                                            <tr
                                                key={user._id || idx}
                                                style={{
                                                    background:
                                                        idx % 2 === 0
                                                            ? "#fff"
                                                            : "#f9fafb",
                                                }}
                                            >
                                                <td style={tdStyle}>
                                                    {user.name}
                                                </td>
                                                <td style={tdStyle}>
                                                    {user.email}
                                                </td>
                                                <td style={tdStyle}>
                                                    {user.role || "user"}
                                                </td>
                                                <td style={tdStyle}>
                                                    <span
                                                        style={{
                                                            color: user.isActive
                                                                ? "#16a34a"
                                                                : "#ef4444",
                                                            fontWeight: 600,
                                                            marginRight: 8,
                                                        }}
                                                    >
                                                        {user.isActive
                                                            ? "Aktif"
                                                            : "Nonaktif"}
                                                    </span>
                                                    <span
                                                        className={`toggle-switch${
                                                            user.isActive
                                                                ? " active"
                                                                : ""
                                                        }`}
                                                        onClick={async () => {
                                                            await fetch(
                                                                "/api/admin/users",
                                                                {
                                                                    method: "PUT",
                                                                    headers: {
                                                                        "Content-Type":
                                                                            "application/json",
                                                                    },
                                                                    body: JSON.stringify(
                                                                        {
                                                                            _id: user._id,
                                                                            name: user.name,
                                                                            email: user.email,
                                                                            role: user.role,
                                                                            isActive:
                                                                                !user.isActive,
                                                                        }
                                                                    ),
                                                                }
                                                            )
                                                            fetchUsers()
                                                        }}
                                                        title={
                                                            user.isActive
                                                                ? "Nonaktifkan user"
                                                                : "Aktifkan user"
                                                        }
                                                        style={{
                                                            marginLeft: 2,
                                                        }}
                                                    >
                                                        <span className="toggle-knob" />
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <button
                                                        onClick={() =>
                                                            openEdit(user)
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
                                                            handleDelete(user)
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
                                        ))
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
                                        borderRadius: 12,
                                        padding: 32,
                                        minWidth: 340,
                                        boxShadow: "0 2px 12px #2563eb33",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                    }}
                                >
                                    <h3
                                        style={{
                                            color: "#2563eb",
                                            fontWeight: 700,
                                            fontSize: 20,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {modal.mode === "add"
                                            ? "Tambah User"
                                            : "Edit User"}
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Nama"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                name: e.target.value,
                                            }))
                                        }
                                        style={inputStyle}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                email: e.target.value,
                                            }))
                                        }
                                        style={inputStyle}
                                    />
                                    <select
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                role: e.target.value,
                                            }))
                                        }
                                        style={inputStyle}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <input
                                        type="password"
                                        placeholder="Password baru (opsional)"
                                        value={form.password || ""}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                password: e.target.value,
                                            }))
                                        }
                                        style={inputStyle}
                                    />
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={form.isActive}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    isActive: e.target.checked,
                                                }))
                                            }
                                            style={{ width: 18, height: 18 }}
                                        />
                                        <label
                                            htmlFor="isActive"
                                            style={{
                                                color: form.isActive
                                                    ? "#16a34a"
                                                    : "#ef4444",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {form.isActive
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </label>
                                    </div>
                                    {error && (
                                        <div
                                            style={{
                                                color: "#ef4444",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {error}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            marginTop: 8,
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            style={{
                                                ...btnStyle,
                                                background: "#2563eb",
                                                color: "#fff",
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
                input::placeholder, select::placeholder {
                    color: #000 !important;
                    opacity: 1 !important;
                }
                input, select {
                    color: #222 !important;
                    border: 1.5px solid #c7d2fe !important;
                    border-radius: 6px !important;
                    padding: 10px 12px !important;
                    font-size: 15px !important;
                    font-weight: 500 !important;
                }
                .toggle-switch {
                    width: 44px;
                    height: 24px;
                    border-radius: 12px;
                    background: #ef4444;
                    position: relative;
                    cursor: pointer;
                    transition: background 0.3s;
                    display: inline-block;
                    vertical-align: middle;
                }
                .toggle-switch.active {
                    background: #16a34a;
                }
                .toggle-knob {
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow: 0 1px 4px #0002;
                    transition: left 0.3s;
                }
                .toggle-switch.active .toggle-knob {
                    left: 23px;
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
    "::placeholder": {
        color: "#000",
        opacity: 1,
    },
}
