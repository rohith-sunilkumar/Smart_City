# 🏛️ Department-Based Admin System

## Overview

Implemented a department-based system where admin users are assigned to specific departments and only see reports relevant to their department.

---

## 🏢 Departments

### Available Departments:

1. **Road Service Department** (`road_service`)
   - Handles: Road maintenance, potholes, road damage, traffic issues

2. **Hospital Emergency Department** (`hospital_emergency`)
   - Handles: Medical emergencies, accidents, urgent health issues

3. **Water Management Department** (`water_management`)
   - Handles: Water supply, drainage, sewage, water blockage, leakage

4. **Electrical Service Department** (`electrical_service`)
   - Handles: Power outages, electrical issues, streetlights, transformers

5. **General Department** (`general`)
   - Handles: Other issues that don't fit specific categories

---

## 📊 Report Categories

Reports are automatically categorized and assigned to departments:

| Category | Department | Examples |
|----------|-----------|----------|
| `road` | `road_service` | Potholes, road damage, traffic |
| `emergency` | `hospital_emergency` | Medical emergencies, accidents |
| `water` | `water_management` | Water supply, drainage, sewage |
| `electrical` | `electrical_service` | Power outage, streetlights |
| `other` | `general` | Miscellaneous issues |

---

## 🔄 How It Works

### 1. **Admin Registration**
- Admin selects their department during registration
- Department field is **required** for admin accounts
- Citizens don't need to select a department

### 2. **Report Submission**
- Citizens submit reports with title and description
- AI automatically classifies the report
- Report is assigned to appropriate department

### 3. **Department Filtering**
- Admins only see reports assigned to their department
- Citizens see only their own reports
- Each department works independently

---

## 🎯 Implementation Details

### **Backend Changes**

#### 1. User Model (`server/models/User.js`)
```javascript
department: {
  type: String,
  enum: ['road_service', 'hospital_emergency', 'water_management', 'electrical_service', 'general'],
  required: function() {
    return this.role === 'admin';
  }
}
```

#### 2. Report Model (`server/models/Report.js`)
```javascript
category: {
  type: String,
  enum: ['road', 'emergency', 'water', 'electrical', 'other'],
  default: 'other'
}

assignedDepartment: {
  type: String,
  enum: ['road_service', 'hospital_emergency', 'water_management', 'electrical_service', 'general'],
  default: 'general'
}
```

#### 3. Auth Routes (`server/routes/auth.js`)
- Added department validation for admin registration
- Department field included in login/register responses
- Validates department is provided for admin users

#### 4. Reports Routes (`server/routes/reports.js`)
```javascript
// Admins can only see reports for their department
if (req.user.role === 'admin' && req.user.department) {
  query.assignedDepartment = req.user.department;
}
```

#### 5. AI Classifier (`server/services/aiClassifier.js`)
Updated category-to-department mapping:
```javascript
const categoryToDepartment = {
  road: 'road_service',
  emergency: 'hospital_emergency',
  water: 'water_management',
  electrical: 'electrical_service',
  other: 'general'
};
```

---

### **Frontend Changes**

#### 1. Register Page (`client/src/pages/Register.jsx`)
- Added department dropdown for admin users
- Shows only when "Admin" role is selected
- Required field with validation
- 5 department options available

```jsx
{formData.role === 'admin' && (
  <div>
    <label>Department *</label>
    <select name="department" required>
      <option value="">Select Department</option>
      <option value="road_service">Road Service Department</option>
      <option value="hospital_emergency">Hospital Emergency Department</option>
      <option value="water_management">Water Management Department</option>
      <option value="electrical_service">Electrical Service Department</option>
      <option value="general">General Department</option>
    </select>
  </div>
)}
```

---

## 🔐 Access Control

### **Citizens**:
- ✅ Can report any type of issue
- ✅ See only their own reports
- ✅ No department restrictions

### **Admins**:
- ✅ Must select department during registration
- ✅ See only reports assigned to their department
- ✅ Can update status of department reports
- ✅ Can add notes to department reports

---

## 📋 User Flow

### **Citizen Flow**:
1. Register as Citizen (no department needed)
2. Login
3. Report an issue (any category)
4. AI assigns to appropriate department
5. Track report status

### **Admin Flow**:
1. Register as Admin
2. **Select Department** (required)
3. Login
4. See reports for their department only
5. Manage and update reports

---

## 🎨 UI Updates

### **Registration Page**:
- Role selection cards (Citizen/Admin)
- **Department dropdown** (appears for Admin)
- Department icon (Building2)
- Helper text: "You will only see reports assigned to your department"

### **Admin Dashboard**:
- Shows only department-specific reports
- Department name displayed in profile
- Filtered statistics for department

---

## 🔄 AI Classification

### **How AI Assigns Departments**:

1. **Analyzes** report title and description
2. **Classifies** into category (road, emergency, water, electrical, other)
3. **Maps** category to department automatically
4. **Assigns** report to department

### **Example**:
```
Report: "Large pothole on Main Street"
↓
AI Classification: category = "road"
↓
Department Assignment: "road_service"
↓
Visible to: Road Service Department admins only
```

---

## 📊 Department Statistics

Each department admin sees:
- Total reports for their department
- Open reports count
- In-progress reports count
- Resolved reports count
- Department-specific trends

---

## 🚀 Benefits

### **For Citizens**:
✅ Don't need to know which department to contact
✅ AI automatically routes to correct department
✅ Faster response from specialized teams

### **For Admins**:
✅ See only relevant reports
✅ Focus on their area of expertise
✅ Better workload management
✅ Specialized handling

### **For Government**:
✅ Organized workflow
✅ Clear responsibility
✅ Better tracking and accountability
✅ Efficient resource allocation

---

## 🔧 Testing

### **Test Admin Registration**:
1. Go to `/register`
2. Select "Admin" role
3. Choose a department (e.g., "Road Service Department")
4. Complete registration
5. Login and verify you see only department reports

### **Test Report Assignment**:
1. Login as citizen
2. Report a road issue
3. Logout
4. Login as Road Service admin
5. Verify the report appears in your dashboard

---

## 📝 API Examples

### **Register Admin**:
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@roadservice.gov",
  "password": "password123",
  "role": "admin",
  "department": "road_service"
}
```

### **Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@roadservice.gov",
      "role": "admin",
      "department": "road_service"
    },
    "token": "..."
  }
}
```

### **Get Department Reports**:
```
GET /api/reports
Authorization: Bearer <admin_token>

// Returns only reports where assignedDepartment matches admin's department
```

---

## 🎯 Department Mapping

### **Complete Mapping Table**:

| Issue Type | Citizen Reports As | AI Classifies As | Assigned To Department |
|------------|-------------------|------------------|----------------------|
| Pothole | "Pothole on street" | `road` | `road_service` |
| Medical Emergency | "Accident victim" | `emergency` | `hospital_emergency` |
| Water Leak | "Pipe burst" | `water` | `water_management` |
| Power Outage | "No electricity" | `electrical` | `electrical_service` |
| Other | "General complaint" | `other` | `general` |

---

## ✅ Validation

### **Admin Registration Validation**:
- ✅ Department is required for admin
- ✅ Must be one of 5 valid departments
- ✅ Cannot register admin without department

### **Report Assignment Validation**:
- ✅ Every report gets a department
- ✅ Department matches category
- ✅ Fallback to 'general' if uncertain

---

## 🔄 Future Enhancements

### **Potential Additions**:
1. **Multi-department admins** - Admins managing multiple departments
2. **Department transfer** - Reassign reports between departments
3. **Department hierarchy** - Sub-departments and supervisors
4. **Department analytics** - Performance metrics per department
5. **Department notifications** - Email alerts for new reports

---

## 📚 Summary

### **What Was Implemented**:
✅ 5 government departments
✅ Department field in User model
✅ Department-based report filtering
✅ Admin registration with department selection
✅ AI auto-assignment to departments
✅ Updated categories (road, emergency, water, electrical)
✅ Department validation
✅ UI for department selection

### **Key Features**:
- **Automatic routing** - AI assigns reports to correct department
- **Access control** - Admins see only their department's reports
- **Specialized handling** - Each department focuses on their expertise
- **Clear organization** - Better workflow and accountability

---

**Status**: ✅ Complete
**Ready for**: Testing and deployment
**Next Step**: Test with different department admins
