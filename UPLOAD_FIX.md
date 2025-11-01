# Image Upload Fix

## Issue
Error: `ENOENT: no such file or directory, open 'uploads/images-...'`

## Root Cause
The `uploads/` directory exists but may have permission issues or the server needs restart.

## Solution

### 1. Ensure uploads directory exists
```bash
cd server
mkdir -p uploads
chmod 755 uploads
```

### 2. Restart the server
```bash
# Kill existing server
lsof -ti:5001 | xargs kill -9

# Start server again
npm run dev
```

### 3. Configuration Check
The server is already configured correctly:
- `server.js` line 36: `app.use('/uploads', express.static('uploads'));`
- `config/cloudinary.js` saves files to `uploads/` directory
- Images are accessible at `/uploads/filename`

## How It Works

1. User uploads image through form
2. Multer saves file to `server/uploads/` with unique filename
3. File path stored in database as `/uploads/filename`
4. Express serves static files from `/uploads` route
5. Frontend displays image using the stored path

## Test Upload

1. Go to Report Issue page
2. Fill in title and description
3. Select an image file
4. Click Submit
5. Image should upload successfully

## Common Issues

### Permission Denied
```bash
chmod 755 server/uploads
```

### Server Not Serving Files
Restart the server - the static middleware needs to be loaded

### File Not Found After Upload
Check that:
- File was actually saved to `server/uploads/`
- Filename matches what's in the database
- Server is running and serving static files
