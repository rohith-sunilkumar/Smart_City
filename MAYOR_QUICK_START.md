# 🚀 Mayor System - Quick Start Guide

## ✅ What's New

You now have a **Mayor Portal** that controls admin access to the system!

## 🎯 Quick Access

### Mayor Login (Permanent Access)
- **URL**: http://localhost:3000/mayor/login
- **Email**: `mayor@city.gov`
- **Password**: `mayor123`
- ⚠️ **These credentials are permanent and provide full admin control**

### Features
✅ View admin signup requests from registration page
✅ Approve/reject admin registrations
✅ Remove existing admins
✅ View system statistics
✅ Monitor all departments

## 📋 How to Use

### Step 1: Access Mayor Portal
1. Go to http://localhost:3000/login
2. Click **"Mayor Portal Access →"** at the bottom
3. Login with mayor credentials

### Step 2: Manage Admins
- **Pending Approvals Tab**: See admins waiting for approval
- **All Admins Tab**: See all admins in the system
- **Approve Button**: Approve pending admins
- **Remove Button**: Delete any admin

### Step 3: Test the Flow
1. Register a new admin at `/register`
2. Try to login as that admin (will be blocked)
3. Login as mayor and approve the admin
4. Admin can now login successfully!

## 🔐 What Changed

### For Admins
- ⚠️ New admin registrations now require mayor approval
- ❌ Can't login until approved
- ✅ After approval, everything works as before

### For Citizens
- ✅ No changes - citizens work exactly the same

### For Existing Admins
- ✅ Automatically approved
- ✅ Can login immediately
- ✅ No action needed

## 🎨 Current Structure (Unchanged)

```
Citizens
  ↓
Register/Login → Report Issues → View Own Reports

Admins (After Approval)
  ↓
Login → View Department Reports → Manage Reports
  ↓
Road Admin → Road Reports Only
Water Admin → Water Reports Only
(Complete Isolation)

Mayor (New!)
  ↓
Login → Approve Admins → Remove Admins → View Stats
```

## 📊 Mayor Dashboard

### Statistics Cards
- **Total Admins**: All admin accounts
- **Approved**: Admins who can login
- **Pending**: Admins waiting for approval
- **Citizens**: Total citizen accounts

### Admin Table
- Name and email
- Department badge
- Approval status
- Registration date
- Action buttons

## 🧪 Test Scenarios

### Scenario 1: New Admin Registration
```
1. Go to /register
2. Fill form with role "admin"
3. Select department (e.g., Road Service)
4. Submit registration
5. Try to login → Blocked with message
6. Login as mayor
7. Approve the admin
8. Admin can now login
```

### Scenario 2: Remove Admin
```
1. Login as mayor
2. Go to "All Admins" tab
3. Find admin to remove
4. Click "Remove" button
5. Confirm deletion
6. Admin is deleted from system
```

## 🔗 Important Links

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Mayor Login**: http://localhost:3000/mayor/login
- **Regular Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register

## ⚡ Quick Commands

```bash
# Create new mayor account (if needed)
cd server
npm run create-mayor

# Check if servers are running
curl http://localhost:5000/health
curl http://localhost:3000
```

## 🎉 Summary

Your Smart City Portal now has:
- ✅ Mayor portal for admin management
- ✅ Admin approval system
- ✅ Complete admin control
- ✅ All existing features intact
- ✅ No changes to current structure

**Everything is ready to use!** 🚀

Login as mayor and start managing admins!
