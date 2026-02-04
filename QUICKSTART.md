# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Python 3.8+ (for backend)

## Frontend Setup (3 steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
The `.env` file is already created with default values:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_COMPANY_NAME=TechCorp Solutions
VITE_COMPANY_LOGO=/logo.png
```

**Customize as needed:**
- Change `VITE_COMPANY_NAME` to your company name
- Update `VITE_API_BASE_URL` when you deploy backend

### Step 3: Run Development Server
```bash
npm run dev
```

**The app will open at:** `http://localhost:3000`

✅ **User Form:** `http://localhost:3000`  
✅ **Admin Login:** `http://localhost:3000/admin/login`

---

## Backend Setup (Optional - For Full Functionality)

### Step 1: Install Python Dependencies
```bash
pip install fastapi uvicorn sqlalchemy python-jose passlib[bcrypt] python-multipart
```

### Step 2: Run the Sample Backend
```bash
python backend_example.py
```

**Backend runs at:** `http://localhost:8000`

### Step 3: Test the API
Open browser: `http://localhost:8000/docs`  
You'll see the interactive API documentation (Swagger UI)

---

## 🎯 Testing the Application

### Test User Side (Visitor Form)
1. Visit `http://localhost:3000`
2. Fill out the visitor form:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Company: Acme Corp
   - Purpose: Business Meeting
   - Message: (optional)
3. Click "Check In"
4. You should see a success message
5. **Check backend console** - visitor data should be logged

### Test Admin Side
1. Visit `http://localhost:3000/admin/login`
2. Login with demo credentials:
   - **Email:** admin@demo.com
   - **Password:** admin123
3. You should be redirected to the dashboard
4. View statistics on the dashboard
5. Click "Visitors" to see the visitor table
6. Try these features:
   - **Search:** Type a name or email
   - **Filter by Purpose:** Select from dropdown
   - **Date Filter:** Pick date range
   - **Sort:** Toggle between newest/oldest first
   - **Export:** Download as CSV
   - **Delete:** Remove a visitor record
   - **Pagination:** Navigate through pages

---

## 📱 Features to Test

### User Form Features
- ✅ Form validation (try submitting empty)
- ✅ Email validation (try invalid email)
- ✅ Phone validation (try letters)
- ✅ Success message after submission
- ✅ Form reset after successful submission

### Admin Dashboard Features
- ✅ Login authentication
- ✅ Statistics cards (total, today, week, month)
- ✅ Protected routes (try visiting /admin/dashboard without login)
- ✅ Auto-logout on expired token

### Visitor Management Features
- ✅ Search by name, email, company, phone
- ✅ Filter by purpose of visit
- ✅ Filter by date range
- ✅ Sort ascending/descending
- ✅ Pagination (add 15+ visitors to test)
- ✅ Export to CSV
- ✅ Delete visitor with confirmation
- ✅ Refresh data
- ✅ Empty state (when no results)
- ✅ Loading states

---

## 🔧 Customization Guide

### Change Company Branding
Edit `.env`:
```env
VITE_COMPANY_NAME=My Awesome Company
```

### Change Colors
Edit `tailwind.config.js` → `theme.extend.colors.primary`

### Add More Purpose Options
Edit `src/components/VisitorForm.jsx` → `purposeOptions` array

### Modify Table Columns
Edit `src/admin/Visitors.jsx` → table headers and cells

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection errors
- Check if backend is running on port 8000
- Verify `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors

### Login not working
- Make sure backend is running
- Check credentials: `admin@demo.com` / `admin123`
- Open browser DevTools → Network tab to see API calls

### Visitors not showing
- Submit a visitor form first
- Click "Refresh" button in admin panel
- Check if backend received the data (console logs)

---

## 📚 Next Steps

1. **Connect Real Database**
   - Replace in-memory storage with PostgreSQL/MySQL
   - See `backend_example.py` for SQLAlchemy setup

2. **Deploy to Production**
   - Frontend: Vercel, Netlify, or AWS S3
   - Backend: Railway, Render, or AWS EC2

3. **Add More Features**
   - Check-out time tracking
   - Visitor badges/QR codes
   - Email notifications
   - Photo capture
   - Host assignment

4. **Enhance Security**
   - HTTPS only
   - Rate limiting
   - Input sanitization
   - CSRF protection

---

## 🎉 You're All Set!

The application is now running. Test all features and customize as needed.

**Need Help?**
- Check the main README.md for detailed documentation
- Review API endpoints in backend_example.py
- Test API at http://localhost:8000/docs

**Happy Coding! 🚀**
