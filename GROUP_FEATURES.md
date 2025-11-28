# Group Project Features - Taskini

## ✅ New Features Added

### 1. Task Assignment (Group Projects)
- **Assigned To Label**: Each task now displays who is responsible for it
- **User Selection**: When creating/editing tasks, you can assign them to any team member
- **Visual Indicator**: Assigned users are shown with their profile photo (or initial) and name
- **Group Collaboration**: Tasks created by one user can be assigned to another team member

### 2. Sidebar Navigation
- **Purple-themed sidebar** with gradient background
- **User profile display** at the top showing photo and info
- **Quick navigation** to:
  - My Tasks
  - Profile
  - Home
- **Responsive design**: Hidden on mobile, toggleable via menu button
- **Menu toggle button** in header (mobile view)

### 3. Profile Page
- **Round Profile Photo Upload**:
  - Click "Change Photo" to upload a new profile picture
  - Photos are displayed in a beautiful round frame with purple border
  - Supports JPG, PNG, GIF formats (max 5MB)
  
- **Profile Information**:
  - Full Name (editable)
  - Email Address (read-only, cannot be changed)
  - Department (e.g., Engineering, Design, Marketing)
  - Position (e.g., Developer, Designer, Manager)
  - Phone Number
  - Bio (up to 500 characters)
  
- **Change Password**:
  - Secure password change with current password verification
  - Minimum 6 characters required
  
- **Completed Tasks History**:
  - View all tasks you've completed (created by you or assigned to you)
  - Shows task details, dates, and status
  - Helps track your contribution to group projects

### 4. User Management (Backend)
- **Get All Users**: API endpoint to fetch all users for task assignment
- **Profile Management**: Full CRUD operations for user profiles
- **File Upload**: Secure profile photo upload with multer

## 🎨 Design Features

### Purple Theme
- All new components follow the purple color scheme
- Gradient backgrounds on sidebar and buttons
- Consistent styling throughout

### Responsive Design
- Sidebar adapts to mobile/desktop
- Profile page works on all screen sizes
- Task cards show assigned users beautifully

## 📡 API Endpoints

### Users
- `GET /api/users` - Get all users (for assignment dropdown)

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile information
- `POST /api/profile/photo` - Upload profile photo
- `PUT /api/profile/password` - Change password
- `GET /api/profile/tasks` - Get user's completed tasks

### Tasks (Updated)
- Tasks now include `assignedTo` field
- Tasks show both creator and assigned user
- Users can see tasks assigned to them

## 🚀 How to Use

### Assigning Tasks
1. Click "+ Create New Task" or edit an existing task
2. In the "Assign To" dropdown, select a team member
3. Save the task
4. The assigned user will see the task in their task list

### Accessing Profile
1. Click the menu button (☰) in the header (mobile) or use the sidebar (desktop)
2. Click "Profile" in the sidebar
3. Update your information, upload a photo, or change your password

### Viewing Completed Tasks
1. Go to Profile page
2. Click "Completed Tasks" tab
3. See all tasks you've completed

## 👥 Group Project Benefits

1. **Task Ownership**: Clear indication of who's responsible for each task
2. **Team Collaboration**: Assign tasks to team members based on expertise
3. **Accountability**: Track who completed what tasks
4. **User Profiles**: Learn about your team members (department, position, bio)
5. **Visual Recognition**: Profile photos make it easy to identify team members

## 🔧 Technical Details

### Backend
- Multer for file uploads
- Static file serving for profile photos
- Enhanced user model with profile fields
- Task model already had `assignedTo` field

### Frontend
- FormData for photo uploads
- User list fetching for assignment dropdown
- Profile state management
- Sidebar state management with toggle

## 📝 Notes

- Profile photos are stored in `backend/uploads/profiles/`
- Photos are served from `http://localhost:5000/uploads/...`
- All users can see all other users (for group project assignment)
- Tasks show both creator and assigned user information

Enjoy your enhanced group project management! 🎉

