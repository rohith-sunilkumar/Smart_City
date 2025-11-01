# 🔧 Troubleshooting Guide - Department Filtering Not Working

## 🔍 Diagnostic Steps

### **Step 1: Check Database**

Run the diagnostic script:
```bash
cd server
npm run check-db
```

This will show you:
- ✅ All reports and their assigned departments
- ✅ All admin users and their departments
- ✅ Department distribution
- ✅ Any issues found

---

### **Step 2: Check Server Logs**

When you create a report, look for:
```
📝 Creating report with: {
  category: 'Road Service Department',
  assignedDepartment: 'road_service',
  priority: 'medium'
}
✅ Report created: { ... }
```

When admin fetches reports, look for:
```
📥 GET /api/reports - User: {
  name: 'John Doe',
  role: 'admin',
  department: 'road_service'
}
🔒 Admin filter applied: John Doe (road_service)
🔍 Final query: { assignedDepartment: 'road_service' }
📊 Found 5 reports
```

---

## 🐛 Common Issues & Fixes

### **Issue 1: Admin Has No Department**

**Symptom**:
```
⚠️  WARNING: Admin has no department assigned!
```

**Cause**: Admin user was created without a department

**Fix**:
1. **Option A**: Re-register the admin with department
2. **Option B**: Update admin in database:

```bash
# In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { department: "road_service" } }
)
```

---

### **Issue 2: Reports Have No assignedDepartment**

**Symptom**:
```
❌ X reports have no assignedDepartment
```

**Cause**: Old reports created before the fix

**Fix**: Run migration script
```bash
cd server
npm run migrate
```

---

### **Issue 3: Wrong Department Assignment**

**Symptom**: Report shows in wrong admin's view

**Check**:
1. Run `npm run check-db`
2. Look at the report's `assignedDepartment`
3. Compare with admin's `department`

**Fix**: Update the report:
```javascript
// In MongoDB
db.reports.updateOne(
  { _id: ObjectId("...") },
  { $set: { assignedDepartment: "road_service" } }
)
```

---

### **Issue 4: Category-Department Mismatch**

**Symptom**:
```
category: "Road Service Department"
assignedDepartment: "water_management"  // WRONG!
```

**Cause**: Bug in classification or manual error

**Fix**: Update to match:
```javascript
db.reports.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      category: "Road Service Department",
      assignedDepartment: "road_service"
    } 
  }
)
```

---

## 📊 Expected Database State

### **Reports Collection**:
```javascript
{
  _id: ObjectId("..."),
  title: "Pothole on Main Street",
  description: "...",
  category: "Road Service Department",
  assignedDepartment: "road_service",  // Must match category
  priority: "high",
  status: "open",
  reporter: ObjectId("..."),
  createdAt: ISODate("...")
}
```

### **Users Collection (Admin)**:
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@road.gov",
  role: "admin",
  department: "road_service",  // MUST BE SET
  createdAt: ISODate("...")
}
```

---

## 🔍 Debugging Checklist

### **When Creating Report**:
- [ ] Check server logs for "📝 Creating report with:"
- [ ] Verify `assignedDepartment` is set correctly
- [ ] Verify it matches the category

### **When Admin Logs In**:
- [ ] Check server logs for "📥 GET /api/reports - User:"
- [ ] Verify admin has `department` field
- [ ] Check for "🔒 Admin filter applied"
- [ ] Verify query has `assignedDepartment`

### **When Viewing Reports**:
- [ ] Check "📊 Found X reports"
- [ ] Verify count matches expected
- [ ] Check sample report in logs

---

## 🛠️ Manual Fixes

### **Fix 1: Update Admin Department**

```javascript
// MongoDB shell
use smart_city_db

// Update specific admin
db.users.updateOne(
  { email: "admin@road.gov" },
  { $set: { department: "road_service" } }
)

// Verify
db.users.find({ role: "admin" }, { name: 1, email: 1, department: 1 })
```

### **Fix 2: Update Report Department**

```javascript
// Update specific report
db.reports.updateOne(
  { title: "Pothole on Main Street" },
  { $set: { assignedDepartment: "road_service" } }
)

// Update all reports with category but no department
db.reports.updateMany(
  { 
    category: "Road Service Department",
    assignedDepartment: { $exists: false }
  },
  { $set: { assignedDepartment: "road_service" } }
)
```

### **Fix 3: Bulk Update by Category**

```javascript
// Road reports
db.reports.updateMany(
  { category: "Road Service Department" },
  { $set: { assignedDepartment: "road_service" } }
)

// Water reports
db.reports.updateMany(
  { category: "Water Management Department" },
  { $set: { assignedDepartment: "water_management" } }
)

// Electrical reports
db.reports.updateMany(
  { category: "Electrical Service Department" },
  { $set: { assignedDepartment: "electrical_service" } }
)

// Hospital reports
db.reports.updateMany(
  { category: "Hospital Emergency Department" },
  { $set: { assignedDepartment: "hospital_emergency" } }
)

// General reports
db.reports.updateMany(
  { category: "General Department" },
  { $set: { assignedDepartment: "general" } }
)
```

---

## 🧪 Test Procedure

### **Complete Test**:

1. **Check Database**:
```bash
npm run check-db
```

2. **Create Test Report**:
```bash
# As citizen
POST /api/reports
{
  "title": "Test Road Issue",
  "description": "Pothole on street",
  "category": "Road Service Department"
}
```

3. **Check Server Logs**:
```
📝 Creating report with: {
  category: 'Road Service Department',
  assignedDepartment: 'road_service'
}
```

4. **Login as Road Admin**:
```bash
# Check logs
📥 GET /api/reports - User: { role: 'admin', department: 'road_service' }
🔒 Admin filter applied
🔍 Final query: { assignedDepartment: 'road_service' }
📊 Found 1 reports
```

5. **Login as Water Admin**:
```bash
# Check logs
📥 GET /api/reports - User: { role: 'admin', department: 'water_management' }
🔒 Admin filter applied
🔍 Final query: { assignedDepartment: 'water_management' }
📊 Found 0 reports  ✅ CORRECT!
```

---

## 📋 Quick Reference

### **Department Codes**:
| Category | Department Code |
|----------|----------------|
| Road Service Department | road_service |
| Water Management Department | water_management |
| Electrical Service Department | electrical_service |
| Hospital Emergency Department | hospital_emergency |
| General Department | general |

### **Commands**:
```bash
# Check database
npm run check-db

# Run migration
npm run migrate

# View server logs
npm run dev
```

---

## ✅ Success Criteria

### **Correct Setup**:
- ✅ All admins have `department` field set
- ✅ All reports have `assignedDepartment` field
- ✅ Category matches assignedDepartment
- ✅ Server logs show correct filtering
- ✅ Each admin sees only their reports

---

## 🚨 If Still Not Working

### **1. Check Environment**:
- Is the server running?
- Is MongoDB connected?
- Are you using the correct database?

### **2. Clear and Restart**:
```bash
# Stop server
# Clear node_modules if needed
rm -rf node_modules
npm install

# Restart
npm run dev
```

### **3. Verify User Token**:
- Logout and login again
- Token might have old user data
- Check localStorage in browser

### **4. Check Frontend**:
- Is it calling the correct API?
- Check Network tab in browser
- Verify Authorization header

---

## 📞 Debug Output Template

When reporting issues, provide:

```
1. Database Check Output:
   [paste npm run check-db output]

2. Server Logs (Create Report):
   [paste logs from report creation]

3. Server Logs (Admin Fetch):
   [paste logs from GET /api/reports]

4. Admin User Info:
   Name: ...
   Email: ...
   Department: ...

5. Report Info:
   Title: ...
   Category: ...
   assignedDepartment: ...
```

---

**Run `npm run check-db` first to diagnose the issue!** 🔍
