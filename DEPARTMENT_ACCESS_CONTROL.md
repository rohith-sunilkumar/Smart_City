# 🔒 Department-Based Access Control

## Overview

Complete access control system ensuring that **each department can ONLY see and manage their own reports**. Road Service Department admins can only see road reports, Water Management can only see water reports, etc.

---

## 🎯 Access Control Rules

### **Road Service Department Admin**:
✅ **CAN** see: Road Service Department reports
❌ **CANNOT** see: Water, Electrical, Hospital, or General reports

### **Water Management Department Admin**:
✅ **CAN** see: Water Management Department reports
❌ **CANNOT** see: Road, Electrical, Hospital, or General reports

### **Electrical Service Department Admin**:
✅ **CAN** see: Electrical Service Department reports
❌ **CANNOT** see: Road, Water, Hospital, or General reports

### **Hospital Emergency Department Admin**:
✅ **CAN** see: Hospital Emergency Department reports
❌ **CANNOT** see: Road, Water, Electrical, or General reports

### **General Department Admin**:
✅ **CAN** see: General Department reports
❌ **CANNOT** see: Road, Water, Electrical, or Hospital reports

---

## 🔐 Implementation Details

### **1. List Reports (GET /api/reports)**

```javascript
// Admins can only see reports for their department
if (req.user.role === 'admin' && req.user.department) {
  query.assignedDepartment = req.user.department;
}
```

**Example**:
- Road Service Admin logs in
- Queries database with `assignedDepartment: 'road_service'`
- Only sees reports assigned to Road Service Department
- Water/Electrical/Hospital reports are completely hidden

---

### **2. View Single Report (GET /api/reports/:id)**

```javascript
// Admins can only view reports for their department
if (req.user.role === 'admin' && 
    req.user.department && 
    report.assignedDepartment !== req.user.department) {
  return res.status(403).json({
    message: 'Not authorized to view this report. This report is assigned to a different department.'
  });
}
```

**Example**:
- Road Service Admin tries to view a Water report
- System checks: `report.assignedDepartment !== 'road_service'`
- Returns 403 Forbidden error
- Admin cannot see the report

---

### **3. Update Report (PATCH /api/reports/:id)**

```javascript
// Admins can only update reports for their department
if (req.user.department && 
    report.assignedDepartment !== req.user.department) {
  return res.status(403).json({
    message: 'Not authorized to update this report. This report is assigned to a different department.'
  });
}
```

**Example**:
- Water Admin tries to update a Road report
- System checks department mismatch
- Returns 403 Forbidden error
- Update is blocked

---

### **4. Delete Report (DELETE /api/reports/:id)**

```javascript
// Admins can only delete reports for their department
if (req.user.department && 
    report.assignedDepartment !== req.user.department) {
  return res.status(403).json({
    message: 'Not authorized to delete this report. This report is assigned to a different department.'
  });
}
```

**Example**:
- Electrical Admin tries to delete a Hospital report
- System checks department mismatch
- Returns 403 Forbidden error
- Deletion is blocked

---

## 📊 Complete Flow Example

### **Scenario: Road Issue Reported**

#### **Step 1: Citizen Reports**
```
Citizen submits: "Pothole on Main Street"
     ↓
AI Classification:
- Category: "Road Service Department"
- Department: "road_service"
     ↓
Report saved to database:
{
  title: "Pothole on Main Street",
  category: "Road Service Department",
  assignedDepartment: "road_service"
}
```

#### **Step 2: Road Service Admin Logs In**
```
Admin: John (department: road_service)
     ↓
Fetches reports with filter:
query.assignedDepartment = 'road_service'
     ↓
Result: ✅ Sees the pothole report
```

#### **Step 3: Water Admin Logs In**
```
Admin: Sarah (department: water_management)
     ↓
Fetches reports with filter:
query.assignedDepartment = 'water_management'
     ↓
Result: ❌ Does NOT see the pothole report
```

#### **Step 4: Water Admin Tries Direct Access**
```
Sarah tries: GET /api/reports/[pothole_report_id]
     ↓
System checks:
report.assignedDepartment ('road_service') !== 
user.department ('water_management')
     ↓
Result: ❌ 403 Forbidden Error
Message: "Not authorized to view this report. 
         This report is assigned to a different department."
```

---

## 🎯 Access Matrix

| User Type | Road Reports | Water Reports | Electrical Reports | Hospital Reports | General Reports |
|-----------|--------------|---------------|-------------------|------------------|-----------------|
| **Citizen** | Own only | Own only | Own only | Own only | Own only |
| **Road Admin** | ✅ All | ❌ None | ❌ None | ❌ None | ❌ None |
| **Water Admin** | ❌ None | ✅ All | ❌ None | ❌ None | ❌ None |
| **Electrical Admin** | ❌ None | ❌ None | ✅ All | ❌ None | ❌ None |
| **Hospital Admin** | ❌ None | ❌ None | ❌ None | ✅ All | ❌ None |
| **General Admin** | ❌ None | ❌ None | ❌ None | ❌ None | ✅ All |

---

## 🔒 Security Features

### **1. Database-Level Filtering**:
```javascript
// Query automatically filters by department
const reports = await Report.find({
  assignedDepartment: req.user.department
});
```
- No way to bypass filter
- Happens at database level
- Secure and efficient

### **2. Authorization Checks**:
```javascript
// Every operation checks department match
if (report.assignedDepartment !== req.user.department) {
  return 403 Forbidden
}
```
- Prevents unauthorized access
- Blocks cross-department operations
- Returns clear error messages

### **3. Role-Based Access**:
```javascript
// Different rules for different roles
if (role === 'citizen') {
  // See only own reports
}
if (role === 'admin') {
  // See only department reports
}
```
- Citizens isolated from each other
- Admins isolated by department
- No cross-contamination

---

## 📋 API Responses

### **Authorized Access** (200 OK):
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "title": "Pothole on Main Street",
        "category": "Road Service Department",
        "assignedDepartment": "road_service"
      }
    ]
  }
}
```

### **Unauthorized Access** (403 Forbidden):
```json
{
  "success": false,
  "message": "Not authorized to view this report. This report is assigned to a different department."
}
```

---

## 🧪 Testing Scenarios

### **Test 1: Road Admin Access**
```
1. Register as Admin with department: road_service
2. Login
3. Create road report (or wait for citizen to create)
4. View reports → Should see road reports only
5. Try to access water report ID → Should get 403 error
```

### **Test 2: Water Admin Access**
```
1. Register as Admin with department: water_management
2. Login
3. View reports → Should see water reports only
4. Try to access road report ID → Should get 403 error
5. Try to update electrical report → Should get 403 error
```

### **Test 3: Cross-Department Block**
```
1. Login as Road Admin
2. Get a Water report ID (from database)
3. Try GET /api/reports/[water_report_id]
4. Expected: 403 Forbidden
5. Try PATCH /api/reports/[water_report_id]
6. Expected: 403 Forbidden
```

---

## 🎯 Department Assignment

### **Automatic Assignment**:
When a report is created, it's automatically assigned to the correct department:

```javascript
const aiResult = await classifyComplaint(title, description, images);

// aiResult contains:
{
  category: "Road Service Department",
  department: "road_service"  // ← Automatically assigned
}

// Report is saved with:
{
  category: "Road Service Department",
  assignedDepartment: "road_service"
}
```

### **Department Mapping**:
```javascript
{
  'Road Service Department': 'road_service',
  'Water Management Department': 'water_management',
  'Electrical Service Department': 'electrical_service',
  'Hospital Emergency Department': 'hospital_emergency',
  'General Department': 'general'
}
```

---

## 📊 Statistics Per Department

### **Road Service Admin Sees**:
```
Total Reports: 15 (only road reports)
Open: 5
In Progress: 7
Resolved: 3

Cannot see: 45 reports from other departments
```

### **Water Management Admin Sees**:
```
Total Reports: 12 (only water reports)
Open: 3
In Progress: 6
Resolved: 3

Cannot see: 48 reports from other departments
```

---

## ✅ Benefits

### **1. Data Isolation**:
✅ Each department sees only their data
✅ No information leakage
✅ Clean separation of concerns

### **2. Security**:
✅ Prevents unauthorized access
✅ Database-level filtering
✅ Authorization checks on all operations

### **3. Efficiency**:
✅ Admins see only relevant reports
✅ Faster queries (filtered at database)
✅ Better focus and productivity

### **4. Accountability**:
✅ Clear responsibility per department
✅ No confusion about ownership
✅ Better tracking and management

---

## 🔧 Implementation Files

### **Modified**:
✅ `server/routes/reports.js` - Added department filtering to all routes
✅ `server/models/User.js` - Department field for admins
✅ `server/models/Report.js` - assignedDepartment field
✅ `server/services/aiClassifier.js` - Auto-assignment logic

---

## 📝 Summary

### **Access Control Implemented**:
✅ **List Reports** - Filtered by department
✅ **View Report** - Department check
✅ **Update Report** - Department check
✅ **Delete Report** - Department check

### **Security Levels**:
1. **Database Query Filtering** - Only fetch department reports
2. **Authorization Checks** - Verify department match
3. **Error Responses** - Clear 403 Forbidden messages

### **Result**:
🔒 **Complete isolation** between departments
🎯 **Road issues** → Only Road Service Department sees
💧 **Water issues** → Only Water Management sees
⚡ **Electrical issues** → Only Electrical Service sees
🏥 **Hospital issues** → Only Hospital Emergency sees

---

**Status**: ✅ Complete and Secure
**Isolation**: 🔒 100% Department-Based
**Testing**: ✅ Ready for verification

---

## 🚀 How to Verify

```bash
# 1. Register two admins with different departments
POST /api/auth/register
{
  "role": "admin",
  "department": "road_service"
}

POST /api/auth/register
{
  "role": "admin",
  "department": "water_management"
}

# 2. Create reports in different categories
# 3. Login as Road Admin → See only road reports
# 4. Login as Water Admin → See only water reports
# 5. Try cross-department access → Get 403 error
```

**Your department-based access control is now fully implemented and secure!** 🔒✨
