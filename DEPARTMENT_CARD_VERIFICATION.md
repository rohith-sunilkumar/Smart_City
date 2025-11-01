# Department Card Image Verification Feature

## Overview
Added image upload functionality to the admin registration process, allowing the mayor to verify admin legitimacy by viewing their department ID card before approval.

## Changes Made

### 1. Backend Changes

#### User Model (`server/models/User.js`)
- Added `departmentCardImage` field (String, required for admin role)
- Stores Cloudinary URL of the uploaded department card image

#### Auth Routes (`server/routes/auth.js`)
- Updated `/api/auth/register` endpoint to handle multipart/form-data
- Integrated multer middleware for file upload
- Added image validation (5MB max, image files only)
- Uploads images to Cloudinary in `department_cards` folder
- Validates that admin users must provide department card image
- Proper error handling and file cleanup

### 2. Frontend Changes

#### Register Page (`client/src/pages/Register.jsx`)
- Added image upload component with drag-and-drop support
- Real-time image preview before upload
- File validation (size and type)
- Image removal functionality
- Updated form submission to use FormData for file upload
- Required field validation for admin department card

#### API Utilities (`client/src/utils/api.js`)
- Updated `authAPI.register()` to detect and handle FormData
- Automatically sets correct Content-Type header for multipart uploads

#### Mayor Dashboard (`client/src/pages/MayorDashboard.jsx`)
- Added "Dept. Card" column to admin list table
- "View Card" button for each admin with uploaded image
- Modal popup to display department card image
- Shows admin details alongside card for verification
- Direct approval from card viewing modal
- Fallback for missing images

## Features

### For Admins (Registration)
1. Select admin role and department
2. Upload department ID card image (required)
3. Preview image before submission
4. Remove and re-upload if needed
5. Validation ensures image is provided

### For Mayor (Verification)
1. View all pending admin requests
2. Click "View Card" to see department ID
3. Modal displays:
   - Full-size department card image
   - Admin name, email, phone
   - Department selection
   - Registration date
4. Approve directly from card viewing modal
5. Close and review other admins

## Technical Details

### Image Upload Flow
1. Admin selects image file in registration form
2. Frontend validates file (size, type)
3. Creates preview using FileReader
4. On submit, creates FormData with all fields + image
5. Backend receives multipart/form-data
6. Multer saves to local `uploads/` temporarily
7. Cloudinary uploads to cloud storage
8. Local file deleted after successful upload
9. Cloudinary URL saved to database

### Security
- File size limit: 5MB
- Only image files accepted
- Temporary files cleaned up after upload
- Failed uploads don't create orphaned files
- Cloudinary provides secure image hosting

## Usage

### Admin Registration
1. Navigate to `/register`
2. Select "Admin" role
3. Choose department
4. Click upload area or drag image
5. Preview appears with remove option
6. Complete other fields
7. Submit form

### Mayor Verification
1. Login as mayor
2. Navigate to "Admin Signup Requests" tab
3. See "View Card" button for each admin
4. Click to open verification modal
5. Review card and admin details
6. Click "Approve Admin" if legitimate
7. Or close and review others

## Files Modified
- `server/models/User.js`
- `server/routes/auth.js`
- `client/src/pages/Register.jsx`
- `client/src/pages/MayorDashboard.jsx`
- `client/src/utils/api.js`

## Dependencies Used
- **multer**: File upload middleware
- **cloudinary**: Cloud image storage
- **lucide-react**: Icons (Upload, X, Eye, etc.)

## Notes
- Existing admins without images show "No image" in table
- Image preview uses data URL for instant feedback
- Cloudinary configuration in `server/config/cloudinary.js`
- Uploads folder already exists in server directory
