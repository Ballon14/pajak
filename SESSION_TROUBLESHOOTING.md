# Troubleshooting Session Management

## Masalah: User tidak bisa login di device lain saat user lama masih login

### Penyebab Umum:

1. **Session Conflict**: NextAuth menggunakan JWT strategy yang bisa menyebabkan konflik
2. **Browser Cache**: Cache browser yang menyimpan session lama
3. **Multiple Sessions**: Tidak ada mekanisme untuk handle multiple sessions
4. **Token Expiration**: Token yang expired atau tidak valid

### Solusi yang Sudah Diterapkan:

#### 1. **Updated NextAuth Configuration**

```javascript
session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
},
jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

#### 2. **Enhanced SessionProvider**

```javascript
<SessionProvider
    refetchInterval={5 * 60} // Refetch session every 5 minutes
    refetchOnWindowFocus={true}
    refetchWhenOffline={false}
>
```

#### 3. **Middleware untuk Cache Control**

```javascript
response.headers.set("Cache-Control", "no-store, max-age=0")
```

### Cara Mengatasi Masalah:

#### **Untuk User:**

1. **Clear Browser Cache**:

    - Chrome: Ctrl+Shift+Delete
    - Firefox: Ctrl+Shift+Delete
    - Safari: Cmd+Option+E

2. **Logout dan Login Ulang**:

    - Klik logout di aplikasi
    - Clear cookies untuk domain aplikasi
    - Login ulang

3. **Incognito/Private Mode**:
    - Buka aplikasi di mode incognito
    - Test login di sana

#### **Untuk Developer:**

1. **Check Session Status**:

    ```javascript
    // Di browser console
    console.log(sessionStorage.getItem("next-auth.session-token"))
    ```

2. **Force Session Refresh**:

    ```javascript
    // Di browser console
    window.location.reload()
    ```

3. **Check Network Tab**:
    - Buka Developer Tools
    - Lihat Network tab
    - Cek request ke `/api/auth/session`

### Best Practices:

1. **Always Logout Properly**:

    ```javascript
    await signOut({ callbackUrl: "/login" })
    ```

2. **Handle Session Errors**:

    ```javascript
    if (session?.error === "RefreshAccessTokenError") {
        signOut()
    }
    ```

3. **Use Session Status**:

    ```javascript
    const { data: session, status } = useSession()

    if (status === "loading") return <LoadingSpinner />
    if (status === "unauthenticated") return <LoginForm />
    ```

### Monitoring:

1. **Check Logs**:

    - Server logs untuk error session
    - Browser console untuk client-side errors

2. **Database Check**:

    - Pastikan user data tidak corrupt
    - Cek collection User di MongoDB

3. **Environment Variables**:
    - Pastikan `NEXTAUTH_SECRET` konsisten
    - Cek `NEXTAUTH_URL` sesuai environment

### Jika Masih Bermasalah:

1. **Reset Session**:

    ```javascript
    // Clear all session data
    localStorage.clear()
    sessionStorage.clear()
    ```

2. **Database Reset** (Development only):

    ```javascript
    // Drop dan recreate collections
    db.User.drop()
    db.TaxRecord.drop()
    ```

3. **Contact Support**:
    - Sertakan error logs
    - Jelaskan steps yang dilakukan
    - Screenshot error jika ada
