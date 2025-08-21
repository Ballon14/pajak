# Logout Configuration

## 🔧 Changes Made

### **External Logout Redirect**

-   ✅ **NextAuth Configuration**: Updated `signOut` page to external URL
-   ✅ **Profile Page**: Updated `handleSignOut` function
-   ✅ **Sidebar Navigation**: Updated logout button in sidebar

## 📍 **Logout Destinations**

### **Before Changes:**

-   ❌ Logout redirects to `/login` (internal page)
-   ❌ Users stay within the same application

### **After Changes:**

-   ✅ **Logout redirects to**: `https://pajak.iqbaldev.site`
-   ✅ **External redirect**: Users are taken to external website
-   ✅ **Consistent behavior**: All logout methods redirect to same URL

## 🔄 **Files Modified**

### 1. **NextAuth Configuration**

**File**: `app/api/auth/[...nextauth]/route.js`

```javascript
pages: {
    signIn: "/login",
    signOut: "https://pajak.iqbaldev.site", // ← Changed
    error: "/login",
},
```

### 2. **Profile Page**

**File**: `app/dashboard/profile/page.js`

```javascript
const handleSignOut = () => {
    signOut({ callbackUrl: "https://pajak.iqbaldev.site" }) // ← Changed
}
```

### 3. **Sidebar Navigation**

**File**: `app/components/SidebarNavigation.js`

```javascript
onClick={() => {
    setProfileOpen(false)
    signOut({ callbackUrl: "https://pajak.iqbaldev.site" }) // ← Changed
}}
```

## 🎯 **User Experience**

### **Logout Flow:**

1. User clicks "Sign Out" button
2. Session is cleared locally
3. User is redirected to `https://pajak.iqbaldev.site`
4. User lands on external website

### **Benefits:**

-   ✅ **Clean separation**: Users are taken away from the application
-   ✅ **External landing**: Redirects to main website
-   ✅ **Consistent behavior**: All logout methods work the same way
-   ✅ **Security**: Users are completely logged out and redirected

## 🔒 **Security Considerations**

### **Session Cleanup:**

-   ✅ **Local session cleared**: NextAuth properly clears local session
-   ✅ **JWT tokens invalidated**: Session tokens are properly handled
-   ✅ **External redirect**: Users cannot access protected pages after logout

### **Cross-Domain Considerations:**

-   ✅ **HTTPS redirect**: External URL uses secure protocol
-   ✅ **Proper domain**: Redirects to legitimate external domain
-   ✅ **No data leakage**: Session data is properly cleared before redirect

## 🚀 **Testing**

### **Test Scenarios:**

1. **Profile Page Logout**: Click logout from profile settings
2. **Sidebar Logout**: Click logout from sidebar navigation
3. **Session Expiry**: Automatic logout when session expires
4. **Browser Back**: Ensure users can't access protected pages after logout

### **Expected Behavior:**

-   All logout methods redirect to `https://pajak.iqbaldev.site`
-   No access to protected pages after logout
-   Clean session termination
-   Proper external redirect

## 📝 **Notes**

-   The external URL `https://pajak.iqbaldev.site` should be accessible
-   Users will be completely logged out and redirected to external site
-   No session data remains in the application after logout
-   All logout methods now have consistent behavior
