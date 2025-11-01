# 🗄️ Department-Specific Database Collections

## 🎯 Architecture

Instead of separate databases, we use **separate MongoDB collections** for each department within the same database. This is more efficient and easier to manage.

---

## 📊 Collections Structure

### **5 Department Collections**:

1. **roadservicereports** - Road Service Department
2. **watermanagementreports** - Water Management Department
3. **electricalservicereports** - Electrical Service Department
4. **hospitalemergencyreports** - Hospital Emergency Department
5. **generalreports** - General Department

---

## 🔧 How It Works

### **When Report is Created**:
```
1. Citizen submits: "Pothole on street"
        ↓
2. AI classifies: Road Service Department
        ↓
3. System determines: department = "road_service"
        ↓
4. Gets model: RoadServiceReports
        ↓
5. Saves to: roadservicereports collection
        ↓
6. Result: Report stored in Road database only!
```

### **When Admin Fetches Reports**:
```
1. Road Admin logs in
        ↓
2. System checks: user.department = "road_service"
        ↓
3. Gets model: RoadServiceReports
        ↓
4. Queries: roadservicereports collection
        ↓
5. Returns: Only road reports
        ↓
6. Water reports: Not accessible!
```

---

## 🚀 New API Endpoints

### **Create Report** (Department-Specific):
```http
POST /api/department-reports
```

**Response**:
```json
{
  "success": true,
  "data": {
    "report": { ... },
    "department": "road_service",
    "collection": "roadservicereports"
  }
}
```

### **Get Reports** (Admin's Department Only):
```http
GET /api/department-reports
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "department": "road_service",
    "collection": "roadservicereports",
    "pagination": { ... }
  }
}
```

### **Get All Department Stats**:
```http
GET /api/department-reports/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "road_service": {
      "collection": "roadservicereports",
      "total": 15,
      "open": 5,
      "inProgress": 7,
      "resolved": 3
    },
    "water_management": {
      "collection": "watermanagementreports",
      "total": 12,
      ...
    }
  }
}
```

---

## 📊 View Department Databases

### **Command**:
```bash
npm run show-depts
```

### **Output**:
```
📊 DEPARTMENT-SPECIFIC COLLECTIONS:
═══════════════════════════════════════

🏢 ROAD SERVICE
   Collection: roadservicereports
   Total Reports: 5
   Reports:
   1. Pothole on Main Street
      Status: open | Priority: high
      Reporter: John Doe
      Created: 10/22/2025, 3:30 PM
   2. Road crack on Park Ave
      Status: in-progress | Priority: medium
      ...

🏢 WATER MANAGEMENT
   Collection: watermanagementreports
   Total Reports: 3
   Reports:
   1. Water leak on Oak Street
      Status: open | Priority: high
      ...

🏢 ELECTRICAL SERVICE
   Collection: electricalservicereports
   Total Reports: 4
   ...

🏢 HOSPITAL EMERGENCY
   Collection: hospitalemergencyreports
   Total Reports: 2
   ...

🏢 GENERAL
   Collection: generalreports
   Total Reports: 1
   ...

📈 STATISTICS BY DEPARTMENT:
═══════════════════════════════════════

ROAD SERVICE:
  Total: 5
  Open: 2
  In Progress: 2
  Resolved: 1
  Closed: 0

WATER MANAGEMENT:
  Total: 3
  Open: 1
  In Progress: 1
  Resolved: 1
  Closed: 0

...

💾 MONGODB COLLECTIONS:
═══════════════════════════════════════

road_service              → roadservicereports
water_management          → watermanagementreports
electrical_service        → electricalservicereports
hospital_emergency        → hospitalemergencyreports
general                   → generalreports
```

---

## 🎯 Benefits

### **1. Complete Isolation**:
✅ Each department has its own collection
✅ No cross-department data access
✅ Clean separation

### **2. Better Performance**:
✅ Smaller collections = faster queries
✅ Department-specific indexes
✅ Optimized for each department

### **3. Easier Management**:
✅ View each department's data separately
✅ Clear statistics per department
✅ Easy to backup/restore by department

### **4. Scalability**:
✅ Can add more departments easily
✅ Each collection can grow independently
✅ Better resource management

---

## 🔍 Database Structure

### **MongoDB Database**: `smart_city_db`

**Collections**:
```
smart_city_db/
├── users (all users)
├── roadservicereports (road reports only)
├── watermanagementreports (water reports only)
├── electricalservicereports (electrical reports only)
├── hospitalemergencyreports (hospital reports only)
└── generalreports (general reports only)
```

---

## 📋 Model Mapping

### **Helper Function**:
```javascript
const getDepartmentModel = (department) => {
  const models = {
    'road_service': RoadServiceReports,
    'water_management': WaterManagementReports,
    'electrical_service': ElectricalServiceReports,
    'hospital_emergency': HospitalEmergencyReports,
    'general': GeneralReports
  };
  return models[department];
};
```

### **Usage**:
```javascript
// Get Road Service model
const RoadModel = getDepartmentModel('road_service');

// Create report in road collection
await RoadModel.create({ ... });

// Query road collection
const roadReports = await RoadModel.find({});
```

---

## 🧪 Testing

### **Test 1: Create Road Report**
```bash
POST /api/department-reports
{
  "title": "Pothole",
  "description": "Large pothole",
  "category": "Road Service Department"
}

# Check which collection it went to
npm run show-depts
# Should show in roadservicereports
```

### **Test 2: Admin Access**
```bash
# Login as Road Admin
GET /api/department-reports

# Response shows:
{
  "collection": "roadservicereports",
  "reports": [...]  // Only road reports
}
```

### **Test 3: Cross-Department Isolation**
```bash
# Login as Water Admin
GET /api/department-reports

# Response shows:
{
  "collection": "watermanagementreports",
  "reports": [...]  // Only water reports, NO road reports
}
```

---

## ✅ Summary

### **Implementation**:
✅ **5 separate collections** for 5 departments
✅ **Automatic routing** based on classification
✅ **Complete isolation** between departments
✅ **Easy to view** with `npm run show-depts`

### **Features**:
✅ Department-specific storage
✅ Automatic collection selection
✅ Admin sees only their collection
✅ Statistics per department
✅ Clean database structure

### **Commands**:
```bash
npm run show-depts    # View all department databases
npm run dev           # Start server with new routes
```

---

**Each department now has its own dedicated MongoDB collection!** 🗄️✨

**Run `npm run show-depts` to see all department databases!** 📊
