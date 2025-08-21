# WhatsApp-Style Chat System Documentation

## 🚀 **Overview**

Sistem chat yang baru telah diimplementasikan dengan fitur percakapan dua arah seperti WhatsApp, memungkinkan user dan admin untuk saling berbalasan dalam thread percakapan yang terpisah.

## ✨ **Fitur Utama**

### **1. Conversation Threads** 💬

-   ✅ **Separate Conversations**: Setiap user memiliki thread percakapan sendiri
-   ✅ **Persistent Chat History**: Riwayat chat tersimpan dan dapat diakses kembali
-   ✅ **Real-time Updates**: Pesan baru muncul secara real-time
-   ✅ **Message Threading**: Pesan terorganisir dalam thread yang terpisah

### **2. Two-Way Communication** ↔️

-   ✅ **User → Admin**: User dapat mengirim pesan ke admin
-   ✅ **Admin → User**: Admin dapat membalas pesan user
-   ✅ **Message Status**: Indikator read/unread seperti WhatsApp
-   ✅ **Timestamp**: Waktu pengiriman setiap pesan

### **3. Admin Features** 👨‍💼

-   ✅ **Conversation List**: Daftar semua percakapan aktif
-   ✅ **User Information**: Info user di setiap percakapan
-   ✅ **Unread Count**: Jumlah pesan yang belum dibaca
-   ✅ **Quick Reply**: Balas langsung dari daftar percakapan
-   ✅ **Broadcast System**: Kirim pesan ke multiple users

### **4. User Features** 👤

-   ✅ **Support Chat**: Chat widget yang mudah diakses
-   ✅ **Message History**: Riwayat percakapan lengkap
-   ✅ **Read Status**: Melihat status pesan yang dikirim
-   ✅ **Real-time Notifications**: Notifikasi pesan baru

## 🏗️ **Database Structure**

### **Conversations Collection**

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // Reference to User
  email: String,           // User email
  createdAt: Date,         // Conversation start time
  lastMessage: Date,       // Last message timestamp
  unreadCount: Number      // Unread messages count
}
```

### **Chats Collection**

```javascript
{
  _id: ObjectId,
  message: String,         // Message content
  from: String,           // Sender name
  email: String,          // User email
  userId: ObjectId,       // User ID
  conversationId: ObjectId, // Reference to conversation
  isAdmin: Boolean,       // Is admin message
  time: Date,             // Message timestamp
  read: Boolean,          // Read status
  readAt: Date            // When message was read
}
```

## 🔧 **API Endpoints**

### **1. Main Chat API**

**File**: `app/api/chat/route.js`

#### **POST** - Send Message

```javascript
POST /api/chat
{
  "message": "Hello admin!",
  "from": "User Name",
  "email": "user@email.com",
  "userId": "user_id",
  "isAdmin": false
}
```

#### **GET** - Get Messages

```javascript
// For User
GET /api/chat?userId=user_id

// For Admin
GET /api/chat?isAdmin=true
```

### **2. Conversation API**

**File**: `app/api/chat/[conversationId]/route.js`

#### **GET** - Get Conversation Messages

```javascript
GET /api/chat/conversation_id?isAdmin=true
```

#### **POST** - Send Message in Conversation

```javascript
POST /api/chat/conversation_id
{
  "message": "Admin reply",
  "from": "Admin Name",
  "isAdmin": true
}
```

## 🎨 **UI Components**

### **1. Admin Chat Interface**

**File**: `app/dashboard/admin/chat/page.js`

#### **Features**:

-   📱 **Conversation List**: Sidebar dengan daftar percakapan
-   💬 **Chat Area**: Area chat utama dengan pesan
-   📝 **Message Input**: Input untuk menulis pesan
-   📢 **Broadcast Button**: Kirim pesan broadcast
-   🔔 **Unread Indicators**: Indikator pesan belum dibaca

#### **Layout**:

```
┌─────────────────────────────────────────┐
│ [Conversation List] │ [Chat Area]      │
│                     │                   │
│ • User 1 (2)       │ [Messages]        │
│ • User 2 (0)       │                   │
│ • User 3 (1)       │ [Message Input]   │
│                     │                   │
└─────────────────────────────────────────┘
```

### **2. User Chat Widget**

**File**: `app/components/SupportChat.js`

#### **Features**:

-   🎯 **Floating Button**: Tombol chat yang mengambang
-   📱 **Chat Modal**: Modal chat yang responsif
-   💬 **Message Bubbles**: Gelembung pesan seperti WhatsApp
-   ⏰ **Timestamps**: Waktu pengiriman pesan
-   ✅ **Read Status**: Status pesan (✓, ✓✓)

## 🔄 **Real-time Features**

### **1. Auto Refresh**

-   ✅ **User**: Refresh setiap 5 detik saat chat terbuka
-   ✅ **Admin**: Refresh setiap 10 detik untuk conversation list
-   ✅ **Message Updates**: Pesan baru muncul otomatis

### **2. Read Status**

-   ✅ **User**: Pesan admin otomatis marked as read
-   ✅ **Admin**: Manual read status tracking
-   ✅ **Visual Indicators**: ✓ untuk sent, ✓✓ untuk read

### **3. Unread Count**

-   ✅ **Conversation Level**: Jumlah pesan belum dibaca per conversation
-   ✅ **Auto Reset**: Reset saat user membuka chat
-   ✅ **Admin Reset**: Reset saat admin membalas

## 🎯 **User Experience**

### **For Users**:

1. **Easy Access**: Floating chat button di setiap halaman
2. **Quick Response**: Admin dapat membalas dengan cepat
3. **Message History**: Riwayat percakapan tersimpan
4. **Status Tracking**: Melihat status pesan yang dikirim
5. **Real-time Updates**: Pesan baru muncul otomatis

### **For Admins**:

1. **Conversation Management**: Kelola multiple conversations
2. **User Information**: Lihat info user di setiap percakapan
3. **Quick Reply**: Balas langsung dari conversation list
4. **Broadcast System**: Kirim pesan ke multiple users
5. **Unread Tracking**: Track pesan yang belum dibaca

## 🚀 **Setup Instructions**

### **1. Database Setup**

```bash
node setup-conversations.js
```

### **2. Environment Variables**

Pastikan `DATABASE_URL` sudah dikonfigurasi di `.env`

### **3. Component Integration**

```javascript
// Add to layout or pages
import SupportChat from "@/app/components/SupportChat"

// In your component
;<SupportChat />
```

## 📊 **Performance Optimizations**

### **1. Database Indexes**

-   ✅ **Conversation Lookup**: Index pada `userId` dan `email`
-   ✅ **Message Retrieval**: Index pada `conversationId` dan `time`
-   ✅ **Read Status**: Index pada `read` dan `isAdmin`

### **2. Efficient Queries**

-   ✅ **Aggregation Pipeline**: Efficient joins untuk admin view
-   ✅ **Pagination Ready**: Structure mendukung pagination
-   ✅ **Selective Updates**: Update hanya field yang diperlukan

### **3. Real-time Optimization**

-   ✅ **Polling Strategy**: Smart polling berdasarkan status
-   ✅ **Conditional Refresh**: Refresh hanya saat diperlukan
-   ✅ **Memory Management**: Cleanup intervals dan refs

## 🔒 **Security Features**

### **1. User Isolation**

-   ✅ **Conversation Privacy**: User hanya lihat conversation sendiri
-   ✅ **Admin Authorization**: Hanya admin yang bisa akses semua conversations
-   ✅ **Data Validation**: Validasi input untuk semua messages

### **2. Message Security**

-   ✅ **Content Sanitization**: Sanitasi konten pesan
-   ✅ **Rate Limiting**: Prevent spam messages
-   ✅ **User Verification**: Verify user identity sebelum send message

## 🎉 **Benefits**

### **For Users**:

-   ✅ **Better Support**: Komunikasi dua arah dengan admin
-   ✅ **Message History**: Riwayat percakapan lengkap
-   ✅ **Real-time Updates**: Pesan baru muncul otomatis
-   ✅ **Status Tracking**: Melihat status pesan yang dikirim

### **For Admins**:

-   ✅ **Efficient Support**: Kelola multiple conversations
-   ✅ **User Context**: Lihat info user di setiap percakapan
-   ✅ **Quick Response**: Balas langsung dari conversation list
-   ✅ **Broadcast System**: Kirim pesan ke multiple users

### **For System**:

-   ✅ **Scalable Architecture**: Mendukung multiple conversations
-   ✅ **Performance Optimized**: Efficient queries dan indexing
-   ✅ **Real-time Capable**: Support real-time updates
-   ✅ **WhatsApp-like UX**: Familiar user experience
