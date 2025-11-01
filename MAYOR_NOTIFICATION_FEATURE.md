# Mayor Notification System

## Overview
Added a real-time notification bell to the Mayor's navbar that displays pending admin approvals and open reports requiring attention.

## Features Implemented

### 🔔 **Notification Bell Icon**
- **Location**: Desktop navbar, between Chat and Profile menu
- **Visual**: Bell icon with red badge showing total notification count
- **Animation**: Pulsing badge when notifications are present
- **Auto-refresh**: Updates every 30 seconds automatically

### 📊 **Notification Types**

#### 1. **Pending Admin Approvals** (Yellow Badge)
- Shows count of admins waiting for approval
- Icon: UserCheck (yellow)
- Links to: `/mayor/dashboard?tab=pending`
- Message: "X admin(s) waiting for approval"

#### 2. **Open Reports** (Red Badge)
- Shows count of unresolved reports across all departments
- Icon: AlertCircle (red)
- Links to: `/mayor/dashboard?tab=reports`
- Message: "X report(s) need attention"

### 💻 **Desktop View**
- **Notification Bell**: Positioned before profile menu
- **Dropdown Panel**: 
  - Width: 320px
  - Header with Bell icon
  - Scrollable notification list (max-height: 384px)
  - Footer with "View Dashboard" link
  - Empty state: "No new notifications" with bell icon

### 📱 **Mobile View**
- **Notification Card**: Appears below user info in mobile menu
- **Compact Design**: Shows notification count and quick links
- **Color-coded**: Red/orange gradient background
- **Direct Links**: Tap to navigate to specific sections

## Technical Implementation

### **File Modified**
`/client/src/components/Navbar.jsx`

### **Key Changes**

#### 1. **Imports Added**
```javascript
import { Bell, UserCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';
```

#### 2. **State Management**
```javascript
const [showNotifications, setShowNotifications] = React.useState(false);
const [notifications, setNotifications] = React.useState({
  pendingAdmins: 0,
  openReports: 0
});
```

#### 3. **Auto-Refresh Logic**
```javascript
React.useEffect(() => {
  if (user?.role === 'mayor' && token) {
    fetchMayorNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMayorNotifications, 30000);
    return () => clearInterval(interval);
  }
}, [user, token]);
```

#### 4. **API Integration**
```javascript
const fetchMayorNotifications = async () => {
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [statsRes, reportsRes] = await Promise.all([
      axios.get(`${API_URL}/api/mayor/stats`, { headers }),
      axios.get(`${API_URL}/api/mayor/reports-stats`, { headers })
    ]);
    
    setNotifications({
      pendingAdmins: statsRes.data.data.pendingAdmins || 0,
      openReports: reportsRes.data.data.overall.open || 0
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};
```

## UI Components

### **Desktop Notification Bell**
```jsx
{user?.role === 'mayor' && (
  <div className="relative">
    <button onClick={() => setShowNotifications(!showNotifications)}>
      <Bell className="h-6 w-6" />
      {(notifications.pendingAdmins + notifications.openReports) > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {notifications.pendingAdmins + notifications.openReports}
        </span>
      )}
    </button>
    {/* Dropdown content */}
  </div>
)}
```

### **Mobile Notification Card**
```jsx
{user?.role === 'mayor' && (notifications.pendingAdmins > 0 || notifications.openReports > 0) && (
  <div className="px-3 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg mb-2 border border-red-500/30">
    <div className="flex items-center space-x-2 mb-2">
      <Bell className="h-5 w-5 text-red-400" />
      <span className="text-sm font-semibold text-gray-200">Notifications</span>
      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
        {notifications.pendingAdmins + notifications.openReports}
      </span>
    </div>
    {/* Notification links */}
  </div>
)}
```

## API Endpoints Used

### 1. **Mayor Stats**
- **Endpoint**: `GET /api/mayor/stats`
- **Returns**: `pendingAdmins` count
- **Used for**: Pending admin approval notifications

### 2. **Reports Stats**
- **Endpoint**: `GET /api/mayor/reports-stats`
- **Returns**: `overall.open` count
- **Used for**: Open reports notifications

## User Experience

### **Notification Flow**
1. Mayor logs in → Notifications fetch automatically
2. Bell icon shows badge with total count
3. Click bell → Dropdown opens with detailed notifications
4. Click notification → Navigate to relevant dashboard section
5. Auto-refresh every 30 seconds keeps data current

### **Visual Indicators**
- **Red pulsing badge**: Urgent attention needed
- **Yellow icon**: Pending approvals
- **Red icon**: Open reports
- **Empty state**: Clean "No notifications" message

### **Interaction**
- **Click bell**: Toggle dropdown
- **Click notification**: Navigate + close dropdown
- **Click outside**: Dropdown closes automatically (browser default)
- **Mobile**: Compact card with direct links

## Benefits

### ✅ **For Mayors**
- **Real-time awareness** of pending tasks
- **Quick access** to important sections
- **Visual priority** with color-coded badges
- **Mobile-friendly** design

### ✅ **For System**
- **Reduces dashboard load** - mayors see notifications without visiting dashboard
- **Improves response time** - immediate visibility of pending items
- **Better UX** - consistent with modern web app patterns
- **Scalable** - easy to add more notification types

## Future Enhancements

### Possible Additions:
1. **Sound/Desktop notifications** when new items arrive
2. **Mark as read** functionality
3. **Notification history** page
4. **Custom notification preferences**
5. **Push notifications** via service workers
6. **Real-time updates** via WebSocket instead of polling
7. **More notification types**:
   - High priority reports
   - Reports pending >7 days
   - Admin activity logs
   - System alerts

## Testing Checklist

### ✅ **Desktop View**
- [ ] Bell icon appears for mayor role only
- [ ] Badge shows correct count
- [ ] Badge animates (pulse effect)
- [ ] Dropdown opens/closes on click
- [ ] Notifications display correctly
- [ ] Links navigate to correct pages
- [ ] Empty state shows when no notifications
- [ ] Auto-refresh works (check after 30s)

### ✅ **Mobile View**
- [ ] Notification card appears in mobile menu
- [ ] Card shows correct counts
- [ ] Links work correctly
- [ ] Card only shows when notifications exist
- [ ] Layout is responsive

### ✅ **Functionality**
- [ ] API calls succeed
- [ ] Error handling works
- [ ] Counts update in real-time
- [ ] Navigation closes dropdown/menu
- [ ] Works across different screen sizes

## Summary

The Mayor Notification System provides:
- ✅ Real-time notifications for pending tasks
- ✅ Visual badges with counts
- ✅ Quick navigation to relevant sections
- ✅ Auto-refresh every 30 seconds
- ✅ Desktop and mobile support
- ✅ Clean, modern UI design
- ✅ Easy to extend with more notification types

**Result**: Mayors can now stay informed about pending admin approvals and open reports without manually checking the dashboard!
