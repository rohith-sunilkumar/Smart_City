# Real-Time Feedback System Documentation

## Overview

A comprehensive real-time feedback system has been implemented to enable direct communication between citizens (users who raise issues) and authorized department admins. This system uses **Socket.IO** for real-time bidirectional communication.

---

## Features

### ✅ Real-Time Communication
- **Instant messaging** between users and admins
- **Live typing indicators** to show when someone is typing
- **Real-time message delivery** without page refresh
- **Connection status indicator** (Live badge when connected)

### ✅ Security & Authorization
- **JWT-based authentication** for Socket.IO connections
- **Role-based access control**: Only the report creator and assigned department admin can access the chat
- **Department isolation**: Admins can only chat on reports assigned to their department

### ✅ Message Features
- **Text messages** with up to 2000 characters
- **File attachments** (images and documents, up to 3 files)
- **Message history** with pagination
- **Unread message indicators**
- **Message timestamps** with relative time display
- **Sender identification** with role badges (Admin/User)

### ✅ User Experience
- **Beautiful chat interface** with modern UI
- **Responsive design** works on all devices
- **Message notifications** with unread count badges
- **Smooth animations** and transitions
- **Auto-scroll** to latest messages

---

## Technical Architecture

### Backend Components

#### 1. **Feedback Model** (`/server/models/Feedback.js`)
```javascript
{
  reportId: ObjectId,          // Reference to the report
  sender: ObjectId,             // User who sent the message
  senderRole: String,           // 'citizen' or 'admin'
  message: String,              // Message content (max 2000 chars)
  isRead: Boolean,              // Read status
  attachments: Array,           // File attachments
  timestamps: true              // createdAt, updatedAt
}
```

#### 2. **Socket.IO Configuration** (`/server/config/socket.js`)
- **Authentication middleware**: Validates JWT tokens
- **Room-based communication**: Each report has its own room (`report_${reportId}`)
- **Event handlers**:
  - `join_report` - Join a report's chat room
  - `leave_report` - Leave a report's chat room
  - `send_feedback` - Send a new message
  - `mark_feedback_read` - Mark messages as read
  - `typing` / `stop_typing` - Typing indicators

#### 3. **Feedback Routes** (`/server/routes/feedback.js`)
- `GET /api/feedback/:reportId` - Get all messages for a report
- `POST /api/feedback/:reportId` - Send a message (REST fallback)
- `GET /api/feedback/:reportId/unread-count` - Get unread message count
- `DELETE /api/feedback/:feedbackId` - Delete a message

#### 4. **Updated Report Model**
Added fields to track feedback:
```javascript
{
  feedbackCount: Number,        // Total number of messages
  lastFeedbackAt: Date,         // Timestamp of last message
  hasUnreadFeedback: Boolean    // Unread message indicator
}
```

### Frontend Components

#### 1. **SocketContext** (`/client/src/context/SocketContext.jsx`)
- Manages Socket.IO connection lifecycle
- Provides socket instance to all components
- Handles authentication and reconnection
- Connection status tracking

#### 2. **FeedbackChat Component** (`/client/src/components/FeedbackChat.jsx`)
- Full-featured chat interface
- Real-time message updates
- Typing indicators
- File upload support
- Message history with infinite scroll capability
- Responsive modal design

#### 3. **Integration Points**
- **ReportDetail Page**: Users can open chat from report details
- **AdminReports Page**: Admins can open chat directly from report list
- **App.jsx**: Wrapped with SocketProvider for global socket access

---

## Usage Guide

### For Citizens (Users)

1. **Create a Report**: Submit an issue through the normal reporting flow
2. **View Report Details**: Navigate to "My Reports" and click on a report
3. **Open Feedback Chat**: Click the "Open Feedback Chat" button
4. **Send Messages**: Type your message and click send
5. **Attach Files**: Click the paperclip icon to attach images or documents
6. **Real-time Updates**: Messages from admins appear instantly

### For Admins

1. **View Reports**: Go to Admin Reports dashboard
2. **Open Chat**: Click the "Chat" button on any report (shows message count badge)
3. **Respond to Users**: Send messages and updates directly to the user
4. **Update Status**: Use the edit function to change report status while chatting
5. **Track Conversations**: Unread message count appears on the chat button

---

## API Endpoints

### REST API (Fallback)

#### Get Feedback Messages
```http
GET /api/feedback/:reportId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "feedbacks": [...],
    "pagination": {
      "total": 10,
      "page": 1,
      "pages": 1
    }
  }
}
```

#### Send Feedback Message
```http
POST /api/feedback/:reportId
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- message: "Your message here"
- attachments: [files]

Response:
{
  "success": true,
  "message": "Feedback sent successfully",
  "data": {
    "feedback": {...}
  }
}
```

### Socket.IO Events

#### Client → Server

**Join Report Room**
```javascript
socket.emit('join_report', reportId);
```

**Send Message**
```javascript
socket.emit('send_feedback', {
  reportId: '...',
  message: 'Hello',
  attachments: []
});
```

**Typing Indicator**
```javascript
socket.emit('typing', { reportId: '...' });
socket.emit('stop_typing', { reportId: '...' });
```

**Mark as Read**
```javascript
socket.emit('mark_feedback_read', { reportId: '...' });
```

#### Server → Client

**New Message**
```javascript
socket.on('new_feedback', (data) => {
  // data.feedback - new message object
  // data.reportId - report ID
});
```

**User Typing**
```javascript
socket.on('user_typing', (data) => {
  // data.userName - name of typing user
  // data.userId - ID of typing user
});
```

**Joined Room**
```javascript
socket.on('joined_report', (data) => {
  // Successfully joined report room
});
```

**Error**
```javascript
socket.on('error', (data) => {
  // data.message - error message
});
```

---

## Security Features

### Authentication
- Socket.IO connections require valid JWT token
- Token validated on connection and for each event
- Unauthorized connections are rejected

### Authorization
- **Report Access Control**: 
  - Citizens can only chat on their own reports
  - Admins can only chat on reports assigned to their department
- **Message Deletion**: Users can only delete their own messages
- **Department Isolation**: Strict separation between departments

### Data Validation
- Message length limits (2000 characters)
- File upload limits (3 files maximum)
- Input sanitization on all messages
- File type validation for attachments

---

## Database Schema

### Feedback Collection
```javascript
{
  _id: ObjectId,
  reportId: ObjectId (indexed),
  sender: ObjectId (indexed),
  senderRole: 'citizen' | 'admin',
  message: String (max 2000),
  isRead: Boolean,
  attachments: [{
    url: String,
    publicId: String,
    type: 'image' | 'document'
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `{ reportId: 1, createdAt: -1 }` - Fast message retrieval
- `{ sender: 1, createdAt: -1 }` - User message history

---

## Environment Variables

Add to `/server/.env`:
```env
# Socket.IO Configuration
CLIENT_URL=http://localhost:5173
```

Add to `/client/.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:5000
```

---

## Installation & Setup

### Backend Setup

1. **Install Socket.IO**:
```bash
cd server
npm install socket.io
```

2. **Start Server**:
```bash
npm run dev
```

The server will initialize Socket.IO automatically.

### Frontend Setup

1. **Install Socket.IO Client**:
```bash
cd client
npm install socket.io-client
```

2. **Start Development Server**:
```bash
npm run dev
```

---

## Testing the System

### Manual Testing Steps

1. **Create Two Users**:
   - One citizen account
   - One admin account (with department assigned)

2. **Create a Report**:
   - Login as citizen
   - Submit a report
   - Note the report ID

3. **Test Real-Time Chat**:
   - Keep citizen logged in on one browser
   - Login as admin on another browser (or incognito)
   - Both open the same report
   - Send messages from both sides
   - Verify real-time delivery

4. **Test Typing Indicators**:
   - Start typing in one browser
   - Verify typing indicator appears in the other

5. **Test Attachments**:
   - Upload images/documents
   - Verify they appear in chat

6. **Test Authorization**:
   - Try accessing chat for wrong department (should fail)
   - Try accessing another user's report (should fail)

---

## Performance Considerations

### Optimization Features
- **Lazy Loading**: Messages loaded with pagination
- **Room-based Broadcasting**: Messages only sent to relevant users
- **Connection Pooling**: Efficient Socket.IO connection management
- **Indexed Queries**: Fast database lookups with proper indexes

### Scalability
- **Horizontal Scaling**: Socket.IO supports Redis adapter for multi-server setups
- **Message Limits**: Prevents spam with character limits
- **Connection Limits**: JWT expiration prevents stale connections

---

## Troubleshooting

### Common Issues

**Socket Not Connecting**
- Check if server is running
- Verify CORS settings in socket.io config
- Check JWT token validity
- Verify CLIENT_URL in .env

**Messages Not Appearing**
- Check browser console for errors
- Verify user has permission to access report
- Check if user joined the report room
- Verify Socket.IO connection status

**Typing Indicators Not Working**
- Check if both users are in the same room
- Verify socket events are being emitted
- Check timeout settings (1 second default)

---

## Future Enhancements

### Potential Features
- 📎 **Rich Media Support**: Images preview in chat
- 🔔 **Push Notifications**: Browser notifications for new messages
- 📊 **Read Receipts**: Show when messages are read
- 🔍 **Message Search**: Search through chat history
- 📥 **Export Chat**: Download conversation history
- 🎤 **Voice Messages**: Audio message support
- 📹 **Video Calls**: Integrated video conferencing
- 🤖 **AI Assistant**: Automated responses for common queries
- 📱 **Mobile App**: Native mobile application
- 🌐 **Multi-language**: Internationalization support

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

---

## License

This feedback system is part of the Smart City Portal project.

---

**Last Updated**: October 2025
**Version**: 1.0.0
