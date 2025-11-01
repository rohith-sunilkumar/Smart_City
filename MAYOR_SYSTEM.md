# 👑 Mayor System - Admin Management

## Overview

The Mayor System provides a secure administrative portal for the city mayor to manage admin accounts. The mayor can approve or reject admin registration requests and remove existing admins.

## Features

✅ **Separate Mayor Login Portal** - Dedicated login page at `/mayor/login`
✅ **Admin Approval System** - All new admin registrations require mayor approval
✅ **Admin Management Dashboard** - View, approve, and remove admin accounts
✅ **Department Statistics** - Monitor admin distribution across departments
✅ **Real-time Updates** - Instant feedback on admin actions

## Access Information

### Mayor Login Credentials
- **URL**: http://localhost:3000/mayor/login
- **Email**: `mayor@city.gov`
- **Password**: `mayor123`
- ⚠️ **Change password after first login!**

## How It Works

### 1. Admin Registration Flow

```
Citizen registers as Admin
         ↓
Account created with isApproved: false
         ↓
Admin tries to login
         ↓
Login blocked - "Pending approval from mayor"
         ↓
Mayor approves admin
         ↓
Admin can now login and access dashboard
```

### 2. Mayor Dashboard Features

#### **Statistics Overview**
- Total Admins
- Approved Admins
- Pending Admins
- Total Citizens

#### **Admin Management Tabs**
- **Pending Approvals** - View and approve new admin requests
- **All Admins** - View all admins (approved and pending)

#### **Admin Actions**
- ✅ **Approve** - Approve pending admin accounts
- 🗑️ **Remove** - Delete admin accounts (with confirmation)

### 3. Department Isolation

The existing department isolation system remains **unchanged**:
- Road admins only see road reports
- Water admins only see water reports
- Each department has its own database collection
- Complete data isolation between departments

## API Endpoints

### Mayor Routes (Protected - Mayor Only)

```javascript
GET    /api/mayor/stats              // Get dashboard statistics
GET    /api/mayor/pending-admins     // Get pending admin requests
GET    /api/mayor/all-admins         // Get all admins
PATCH  /api/mayor/approve-admin/:id  // Approve an admin
DELETE /api/mayor/remove-admin/:id   // Remove an admin
```

## Database Changes

### User Model Updates

```javascript
{
  role: {
    type: String,
    enum: ['citizen', 'admin', 'mayor'],  // Added 'mayor'
    default: 'citizen'
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'admin';  // Admins need approval
    }
  }
}
```

## Usage Guide

### For Admins

1. **Register** at `/register` with role "admin"
2. **Wait** for mayor approval
3. **Login** after approval at `/login`
4. **Access** admin dashboard

### For Mayor

1. **Login** at `/mayor/login`
2. **View** pending admin requests
3. **Approve** or **Remove** admins
4. **Monitor** system statistics

## Testing the System

### Test 1: Admin Registration & Approval

```bash
# 1. Register new admin
POST /api/auth/register
{
  "name": "Test Admin",
  "email": "testadmin@demo.com",
  "password": "password123",
  "role": "admin",
  "department": "road_service"
}

# 2. Try to login (should fail)
POST /api/auth/login
{
  "email": "testadmin@demo.com",
  "password": "password123"
}
# Response: "Your admin account is pending approval from the mayor"

# 3. Login as mayor and approve
# Visit: http://localhost:3000/mayor/login
# Approve the admin

# 4. Admin can now login successfully
```

### Test 2: Remove Admin

```bash
# 1. Login as mayor
# 2. Go to "All Admins" tab
# 3. Click "Remove" on any admin
# 4. Confirm deletion
# 5. Admin is removed from system
```

## Security Features

✅ **Role-based Access Control** - Only mayors can access mayor routes
✅ **JWT Authentication** - Secure token-based authentication
✅ **Protected Routes** - Frontend and backend route protection
✅ **Approval System** - Admins can't access system without approval
✅ **Confirmation Dialogs** - Prevent accidental admin deletion

## File Structure

### Backend
```
server/
├── models/
│   └── User.js                    # Updated with mayor role
├── routes/
│   ├── auth.js                    # Updated with approval check
│   └── mayor.js                   # New mayor routes
├── middleware/
│   └── auth.js                    # Authorization middleware
└── scripts/
    └── createMayor.js             # Script to create mayor account
```

### Frontend
```
client/src/
├── pages/
│   ├── MayorLogin.jsx             # Mayor login page
│   └── MayorDashboard.jsx         # Mayor dashboard
└── App.jsx                        # Updated with mayor routes
```

## Commands

```bash
# Create mayor account
cd server
npm run create-mayor

# Start backend
npm run dev

# Start frontend (in new terminal)
cd client
npm run dev
```

## Important Notes

⚠️ **Current Structure Preserved**
- All existing functionality remains unchanged
- Department isolation still works
- Citizen and admin flows unchanged
- Only added mayor layer on top

⚠️ **Security**
- Change default mayor password immediately
- Use strong passwords in production
- Enable HTTPS in production
- Implement rate limiting for login attempts

⚠️ **Admin Approval**
- All new admin registrations require approval
- Existing admins are automatically approved
- Citizens don't need approval

## Troubleshooting

### Issue: Mayor can't login
**Solution**: Ensure mayor account exists
```bash
cd server
npm run create-mayor
```

### Issue: Admin says "pending approval"
**Solution**: Login as mayor and approve the admin

### Issue: Can't access mayor dashboard
**Solution**: Ensure you're logged in with mayor credentials

## Future Enhancements

- [ ] Email notifications for admin approval
- [ ] Audit log for mayor actions
- [ ] Bulk admin approval
- [ ] Admin suspension (instead of deletion)
- [ ] Multi-mayor support
- [ ] Password reset for admins

---

**Your Smart City Portal now has complete admin management! 🎉**

**Mayor Portal**: http://localhost:3000/mayor/login
**Credentials**: mayor@city.gov / mayor123
