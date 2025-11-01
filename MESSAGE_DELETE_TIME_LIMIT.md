# ⏱️ Message Deletion Time Limit Feature

## Overview

Implemented a 2-minute time limit for message deletion in the chat system. Users (citizens, admins, and mayors) can only delete their own messages within 2 minutes of sending them.

---

## Implementation Details

### Backend Implementation

**File**: `/server/routes/chat.js`  
**Route**: `DELETE /api/chat/:chatId/message/:messageIndex`  
**Lines**: 300-310

#### Added Time Check:
```javascript
// Check if message is within 2 minutes of being sent
const messageTime = new Date(message.timestamp);
const currentTime = new Date();
const timeDifferenceInMinutes = (currentTime - messageTime) / (1000 * 60);

if (timeDifferenceInMinutes > 2) {
  return res.status(403).json({
    success: false,
    message: 'Messages can only be deleted within 2 minutes of sending'
  });
}
```

#### Validation Flow:
1. ✅ Verify chat exists
2. ✅ Verify message index is valid
3. ✅ Verify user is the message sender
4. ✅ **NEW**: Verify message is within 2 minutes old
5. ✅ Delete message if all checks pass

---

### Frontend Implementation

**File**: `/client/src/pages/Chat.jsx`  
**Lines**: 21, 37-44, 267-271, 296-304

#### Added Real-Time Update Mechanism:
```javascript
// State to track current time
const [currentTime, setCurrentTime] = useState(new Date());

// Update current time every second to hide delete buttons after 2 minutes
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000); // Update every second

  return () => clearInterval(interval);
}, []);
```

#### Added Time Check in UI:
```javascript
// Check if message is within 2 minutes (recalculated every second)
const messageTime = new Date(msg.timestamp);
const currentTime = new Date();
const timeDifferenceInMinutes = (currentTime - messageTime) / (1000 * 60);
const canDelete = isOwn && timeDifferenceInMinutes <= 2;
```

#### UI Behavior:
- Delete button only appears for messages sent within the last 2 minutes
- Button has updated tooltip: "Delete message (within 2 minutes)"
- **Button automatically disappears after 2 minutes in real-time** (no refresh needed)
- Updates every second via `setInterval`

---

## How It Works

### Timeline Example:

```
Message sent at 10:00:00 AM
    ↓
10:00:00 - 10:02:00 → ✅ Delete button visible & functional
    ↓
10:02:01 onwards → ❌ Delete button hidden, deletion blocked
```

### User Experience:

**Within 2 Minutes:**
```
User sends message
    ↓
Delete button appears next to message
    ↓
User clicks Delete
    ↓
Confirmation dialog appears
    ↓
User confirms
    ↓
✅ Message deleted successfully
```

**After 2 Minutes:**
```
User sends message
    ↓
Delete button appears
    ↓
⏱️ 2 minutes pass
    ↓
Delete button disappears automatically
    ↓
❌ User cannot delete message anymore
```

**If User Tries to Delete via API After 2 Minutes:**
```
User attempts deletion
    ↓
Backend checks timestamp
    ↓
Time > 2 minutes
    ↓
❌ Returns 403 error: "Messages can only be deleted within 2 minutes of sending"
```

---

## Security Features

### Backend Validation:
1. **Ownership Check**: Only message sender can delete
2. **Time Check**: Only within 2 minutes
3. **Double Protection**: Even if frontend is bypassed, backend enforces the rule

### Frontend UX:
1. **Visual Feedback**: Button only shows when deletion is allowed
2. **Tooltip**: Clear indication of time limit
3. **Automatic Hiding**: Button disappears after 2 minutes

---

## Testing Scenarios

### ✅ Test 1: Delete Within 2 Minutes
1. User sends a message
2. Immediately sees delete button
3. Clicks delete within 2 minutes
4. **Expected**: Message deleted successfully

### ✅ Test 2: Delete After 2 Minutes (Frontend - Real-Time)
1. User sends a message
2. Delete button is visible
3. User waits and watches
4. **Expected**: After exactly 2 minutes, delete button automatically disappears (no refresh needed)
5. **Mechanism**: Component re-renders every second, recalculating time difference

### ✅ Test 3: Delete After 2 Minutes (API Attempt)
1. User sends a message
2. Waits more than 2 minutes
3. Attempts deletion via API call
4. **Expected**: Backend returns 403 error with message "Messages can only be deleted within 2 minutes of sending"

### ✅ Test 4: Different User Roles
1. **Citizen** sends message → Can delete within 2 minutes ✅
2. **Admin** sends message → Can delete within 2 minutes ✅
3. **Mayor** sends message → Can delete within 2 minutes ✅

### ✅ Test 5: Cannot Delete Others' Messages
1. User A sends message
2. User B tries to delete it (even within 2 minutes)
3. **Expected**: Backend returns 403 error "You can only delete your own messages"

---

## Time Calculation

### Formula:
```javascript
const timeDifferenceInMinutes = (currentTime - messageTime) / (1000 * 60);
```

### Breakdown:
- `currentTime - messageTime` = difference in milliseconds
- `/ 1000` = convert to seconds
- `/ 60` = convert to minutes

### Example:
```
Message sent: 10:00:00 AM
Current time: 10:01:30 AM

Difference = 90,000 milliseconds
           = 90 seconds
           = 1.5 minutes
           
1.5 <= 2 → ✅ Can delete
```

---

## Error Messages

### Backend Errors:

| Scenario | Status Code | Message |
|----------|-------------|---------|
| Chat not found | 404 | "Chat not found" |
| Invalid message index | 400 | "Invalid message index" |
| Not message owner | 403 | "You can only delete your own messages" |
| **Time limit exceeded** | **403** | **"Messages can only be deleted within 2 minutes of sending"** |

---

## Benefits

### For Users:
- ✅ Quick correction of typos or mistakes
- ✅ Privacy control for recent messages
- ✅ Clear visual indication of deletion window

### For System:
- ✅ Prevents abuse of deletion feature
- ✅ Maintains conversation integrity
- ✅ Audit trail for older messages
- ✅ Reduces confusion in long conversations

### For Moderation:
- ✅ Messages become permanent after 2 minutes
- ✅ Prevents users from hiding evidence of misconduct
- ✅ Maintains accountability

---

## Technical Considerations

### Performance:
- Time calculation is done client-side for UI
- No additional database queries needed
- Component re-renders every second via `setInterval`
- Minimal performance impact (only updates state, not DOM unless needed)
- Interval cleanup on component unmount prevents memory leaks

### Timezone Handling:
- Uses JavaScript `Date` objects
- Timestamps stored in UTC in database
- Calculations work regardless of user timezone

### Edge Cases Handled:
1. ✅ Message sent just before 2-minute mark
2. ✅ User refreshes page (recalculates on load)
3. ✅ Multiple users in same chat
4. ✅ Network delays

---

## Future Enhancements

Potential improvements:
- [ ] Show countdown timer on delete button
- [ ] Visual indicator showing time remaining
- [ ] Configurable time limit per user role
- [ ] "Edit" feature instead of just delete
- [ ] Notification when deletion window expires

---

## Files Modified

1. **Backend**: `/server/routes/chat.js` (Lines 300-310)
   - Added 2-minute time validation

2. **Frontend**: `/client/src/pages/Chat.jsx` (Lines 21, 37-44, 267-271, 296-304)
   - Added `currentTime` state
   - Added `setInterval` to update time every second
   - Added time calculation for each message
   - Conditional delete button rendering based on real-time check

---

## Status

✅ **IMPLEMENTED** - 2-minute deletion time limit active

All users (citizens, admins, mayors) can now:
- ✅ Delete their own messages within 2 minutes
- ✅ See delete button only when deletion is allowed
- ✅ Get clear error message if time limit exceeded
- ❌ Cannot delete messages older than 2 minutes

---

**Feature Implemented**: October 26, 2025  
**Backend Changes**: `/server/routes/chat.js`  
**Frontend Changes**: `/client/src/pages/Chat.jsx`  
**Time Limit**: 2 minutes from message timestamp
