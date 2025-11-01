# Admin Inter-Department Chat Feature

## Overview
Added the ability for admins to chat with other departments and the mayor for coordination and support. This enables cross-departmental communication and direct access to the mayor's office.

## Changes Made

### 1. Frontend Changes

#### AdminDashboard (`client/src/pages/AdminDashboard.jsx`)
- **Added "Department Chats" button** in the header
- Button links to `/chat` page
- Styled with gradient and hover effects
- Includes MessageCircle icon for visual clarity

#### Chat Page (`client/src/pages/Chat.jsx`)
- **Enabled "New Chat" button for admins** (previously only for citizens)
- **Updated new chat modal** to show appropriate departments:
  - Admins can select Mayor Office
  - Admins can select other departments (excluding their own)
  - Added helpful info message for admins
  - Added emojis for better visual identification
- **Enhanced chat list display**:
  - Shows user role (admin/mayor) next to username
  - Better identification of who you're chatting with

### 2. Backend Changes

#### Chat Routes (`server/routes/chat.js`)
- **Updated `/api/chat/start` endpoint**:
  - Now accepts both citizens and admins
  - Prevents admins from chatting with their own department
  - Stores user role and department in chat document
  - Allows admins to initiate chats with other departments and mayor

#### Chat Model (`server/models/Chat.js`)
- **Added new fields**:
  - `userRole`: Tracks if chat initiator is citizen/admin/mayor
  - `userDepartment`: Stores admin's department (null for citizens)
- These fields help identify the chat participants and enable proper routing

## Features

### For Admins
1. **Access Chat**: Click "Department Chats" button on dashboard
2. **Start New Chat**: Click "New Chat" button
3. **Select Recipient**:
   - Mayor Office (for escalations or approvals)
   - Other departments (for coordination)
   - Cannot chat with own department
4. **Send Messages**: Real-time messaging with other departments/mayor
5. **View Conversations**: All active chats in one place

### Use Cases

#### 1. Cross-Department Coordination
**Example**: Road Service admin needs Water Management to shut off water before road repair
- Road Service admin starts chat with Water Management
- Coordinates timing and location
- Both departments stay informed

#### 2. Mayor Escalation
**Example**: Hospital Emergency needs urgent approval for additional resources
- Hospital admin starts chat with Mayor Office
- Explains situation and request
- Mayor can respond and approve quickly

#### 3. Resource Sharing
**Example**: Electrical Service needs equipment from General Department
- Electrical admin chats with General Department
- Requests specific equipment
- Coordinates pickup/delivery

## Technical Details

### Chat Flow
1. Admin clicks "Department Chats" → Navigates to `/chat`
2. Admin clicks "New Chat" → Modal opens
3. Admin selects department/mayor → Submits
4. Backend checks:
   - User is authenticated
   - Not trying to chat with own department
   - Chat doesn't already exist
5. Creates new chat or returns existing
6. Admin can send/receive messages in real-time

### Access Control
- **Citizens**: Can chat with any department
- **Admins**: Can chat with other departments and mayor (not own department)
- **Mayor**: Can view and respond to all chats

### Data Structure
```javascript
Chat {
  userId: ObjectId,
  userName: String,
  userRole: 'citizen' | 'admin' | 'mayor',
  userDepartment: String | null,
  department: String, // Target department
  messages: [Message],
  status: 'active' | 'closed'
}
```

## UI/UX Improvements

### Visual Indicators
- 💬 Chat icon on dashboard button
- 🏛️ Mayor Office emoji
- 🛣️ Road Service emoji
- 💧 Water Management emoji
- ⚡ Electrical Service emoji
- 🏥 Hospital Emergency emoji
- 📋 General Department emoji

### User Feedback
- Info message explaining inter-department chat purpose
- Role badges showing if chatting with admin/mayor
- Department badges with color coding
- Timestamp on each message

## Files Modified
- `client/src/pages/AdminDashboard.jsx` - Added chat button
- `client/src/pages/Chat.jsx` - Enabled admin chat functionality
- `server/routes/chat.js` - Updated chat start endpoint
- `server/models/Chat.js` - Added userRole and userDepartment fields

## Benefits
✅ **Faster Coordination**: Direct communication between departments
✅ **Mayor Access**: Quick escalation path to mayor's office
✅ **Better Collaboration**: Cross-departmental issue resolution
✅ **Audit Trail**: All communications logged and timestamped
✅ **Real-time**: Instant messaging for urgent matters

## Testing
1. Login as admin (any department)
2. Click "Department Chats" button
3. Click "New Chat"
4. Select another department or Mayor Office
5. Send a message
6. Login as admin from selected department or mayor
7. Verify message appears in their chat list
8. Reply to the message
9. Verify real-time communication works

## Future Enhancements
- Push notifications for new messages
- File sharing in chats
- Group chats with multiple departments
- Chat templates for common requests
- Message search functionality
