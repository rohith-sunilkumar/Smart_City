# Image Upload Fix - Department Card Verification

## Issue
The admin registration was failing with "Failed to upload department card image" error when Cloudinary credentials were not configured.

## Root Cause
The backend was attempting to upload images to Cloudinary without checking if the service was properly configured. When Cloudinary credentials were missing or invalid, the upload would fail and return an error.

## Solution Implemented

### 1. Backend Changes (`server/routes/auth.js`)
- Added check for Cloudinary configuration before attempting upload
- Implemented fallback to local file storage when Cloudinary is not configured
- Images are now stored in `/uploads/` directory with proper error handling

**Logic Flow:**
1. Check if Cloudinary credentials exist in environment variables
2. If configured: Upload to Cloudinary and delete local file
3. If not configured OR upload fails: Keep file in local storage
4. Store either Cloudinary URL or local path in database

### 2. Frontend Changes (`client/src/pages/MayorDashboard.jsx`)
- Imported `getImageUrl` helper function
- Updated image display to use helper function
- Helper automatically handles both Cloudinary URLs and local paths

## How It Works Now

### With Cloudinary Configured
1. Admin uploads department card
2. File saved temporarily to `uploads/` folder
3. Uploaded to Cloudinary cloud storage
4. Cloudinary URL saved to database
5. Local file deleted
6. Mayor views image from Cloudinary

### Without Cloudinary (Development Mode)
1. Admin uploads department card
2. File saved to `uploads/` folder
3. Local path saved to database (e.g., `/uploads/departmentCardImage-123456-card.jpg`)
4. File remains in local storage
5. Mayor views image from local server

## Benefits
- ✅ Works in development without Cloudinary setup
- ✅ Graceful fallback to local storage
- ✅ No registration failures due to missing credentials
- ✅ Production-ready with Cloudinary when configured
- ✅ Automatic URL construction for both scenarios

## Configuration

### For Local Development (No Setup Required)
Images will be stored locally in `server/uploads/` directory.

### For Production with Cloudinary
Add these environment variables to `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing
1. Register as admin with department card image
2. Check if registration succeeds
3. Login as mayor
4. View admin's department card in approval modal
5. Verify image displays correctly

## Files Modified
- `server/routes/auth.js` - Added Cloudinary check and fallback logic
- `client/src/pages/MayorDashboard.jsx` - Added getImageUrl import and usage

## Notes
- Local storage is perfectly fine for development and testing
- Cloudinary is recommended for production for better scalability
- The `uploads/` folder is already configured to be served as static files
- Images are accessible at `http://localhost:5000/uploads/filename.jpg`
