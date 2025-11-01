# Mayor Dashboard Chat Button

## Overview
Added "Department Chats" button to the Mayor Dashboard for easy access to all department communications.

## Changes Made

### MayorDashboard.jsx
- **Added imports**: `Link` from react-router-dom and `MessageCircle` icon
- **Added chat button** in the header section next to the title
- Button styled consistently with Admin Dashboard
- Includes hover animation and gradient styling

## Features

### Chat Button
- **Location**: Top right of Mayor Dashboard header
- **Icon**: MessageCircle icon for visual clarity
- **Link**: Navigates to `/chat` page
- **Styling**: 
  - Gradient violet-to-purple background
  - Hover scale effect
  - Smooth transitions

### Mayor Chat Capabilities
The mayor can:
- View all department chats (from all departments)
- Respond to citizen inquiries across all departments
- Communicate with admins from any department
- Monitor inter-department communications
- Provide guidance and approvals

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  👑 Mayor Dashboard          [💬 Department Chats]      │
│  Manage admin accounts and monitor system activity      │
└─────────────────────────────────────────────────────────┘
```

## Access Control
- Mayor has access to **all chats** across all departments
- Can view and respond to:
  - Citizen → Department chats
  - Admin → Mayor chats
  - Admin → Admin (inter-department) chats

## Files Modified
- `client/src/pages/MayorDashboard.jsx`

## Benefits
✅ **Quick Access**: One-click access to all department communications
✅ **Consistent UI**: Matches Admin Dashboard design
✅ **Better Oversight**: Mayor can monitor all communications
✅ **Faster Response**: Easy to respond to escalations and requests

## Testing
1. Login as mayor
2. Navigate to Mayor Dashboard
3. Click "Department Chats" button
4. Verify navigation to chat page
5. Verify all department chats are visible
6. Test sending messages to different departments
