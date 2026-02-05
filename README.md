# Visitor Management System

A professional, full-stack visitor management web application with separate user and admin portals.

## 🚀 Features

### User Side (Visitor Form)
- ✅ Clean, branded visitor registration form
- ✅ Auto-capture check-in date & time
- ✅ Real-time form validation
- ✅ Success/error notifications
- ✅ Company branding (logo & name)
- ✅ Mobile-responsive design

### Admin Side (Dashboard)
- ✅ Secure JWT-ready authentication
- ✅ Professional admin dashboard
- ✅ Visitor statistics (total, today, week, month)
- ✅ Complete visitor management table
- ✅ Advanced search & filters
  - Search by name, email, company, phone
  - Filter by purpose of visit
  - Date range filtering
  - Sort by date (ascending/descending)
- ✅ Pagination
- ✅ Export to CSV
- ✅ Delete visitor records
- ✅ Refresh data
- ✅ Protected routes
- ✅ Responsive layout

## 📋 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend (Integration Ready)
- **Python FastAPI** (recommended)
- **PostgreSQL/MySQL** (database)
- **JWT** - Authentication

## 📁 Project Structure

```
visitor-management-system/
├── src/
│   ├── admin/                  # Admin-specific components
│   │   ├── AdminLogin.jsx      # Admin login page
│   │   ├── Dashboard.jsx       # Admin dashboard with stats
│   │   ├── Visitors.jsx        # Visitor table with filters
│   │   └── Sidebar.jsx         # Admin navigation sidebar
│   ├── components/             # Shared components
│   │   └── VisitorForm.jsx     # User-facing visitor form
│   ├── routes/                 # Route protection
│   │   └── ProtectedRoute.jsx  # Auth guard for admin routes
│   ├── services/               # API & Auth services
│   │   ├── api.js              # API service layer
│   │   └── auth.js             # Authentication utilities
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles + Tailwind
├── .env                        # Environment variables
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_COMPANY_NAME=Your Company Name
VITE_COMPANY_LOGO=/logo.png
```

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## 🔐 Authentication Flow

### Admin Login
1. User enters email & password
2. Frontend calls `/api/login`
3. Backend validates credentials
4. Returns JWT token + user data
5. Token stored in localStorage
6. User redirected to dashboard

### Protected Routes
- All `/admin/*` routes (except `/admin/login`) require authentication
- ProtectedRoute component checks for valid token
- Redirects to login if unauthenticated
- Auto-logout on 401 responses

### Demo Credentials
```
Email: admin@demo.com
Password: admin123
```
*(Update these in your backend)*

## 🔌 Backend API Endpoints

### Visitor Endpoints

#### Submit Visitor Form
```http
POST /api/visitors
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "purpose": "Business Meeting",
  "message": "Here for partnership discussion",
  "checkin_time": "2024-02-03T10:30:00Z"
}

Response: 201 Created
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  ...
}
```

### Admin Endpoints

#### Admin Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "admin123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@demo.com"
  }
}
```

#### Get All Visitors
```http
GET /api/admin/visitors
Authorization: Bearer <token>

Query Parameters:
  - search: string (optional)
  - purpose: string (optional)
  - startDate: date (optional)
  - endDate: date (optional)
  - page: number (optional)
  - limit: number (optional)

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "purpose": "Business Meeting",
      "message": "Partnership discussion",
      "checkin_time": "2024-02-03T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### Get Dashboard Stats
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "total_visitors": 150,
  "today_visitors": 12,
  "this_week_visitors": 45,
  "this_month_visitors": 98
}
```

#### Delete Visitor
```http
DELETE /api/admin/visitors/{id}
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Visitor deleted successfully"
}
```

## 🐍 Sample Python Backend (FastAPI)

Create `backend/main.py`:

```python
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import jwt
from passlib.context import CryptContext

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-here"
pwd_context = CryptContext(schemes=["bcrypt"])
security = HTTPBearer()

# Models
class Visitor(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    purpose: str
    message: Optional[str] = None
    checkin_time: datetime

class AdminLogin(BaseModel):
    email: str
    password: str

# In-memory storage (use database in production)
visitors_db = []
admin_users = {
    "admin@demo.com": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@demo.com",
        "password": pwd_context.hash("admin123")
    }
}

# Helper functions
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.post("/api/visitors", status_code=201)
async def create_visitor(visitor: Visitor):
    visitor_dict = visitor.dict()
    visitor_dict["id"] = len(visitors_db) + 1
    visitors_db.append(visitor_dict)
    return visitor_dict

@app.post("/api/login")
async def admin_login(login: AdminLogin):
    user = admin_users.get(login.email)
    if not user or not pwd_context.verify(login.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({"user_id": user["id"]}, SECRET_KEY, algorithm="HS256")
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@app.get("/api/admin/visitors")
async def get_visitors(payload: dict = Depends(verify_token)):
    return {"data": visitors_db}

@app.get("/api/admin/dashboard/stats")
async def get_stats(payload: dict = Depends(verify_token)):
    today = datetime.now().date()
    return {
        "total_visitors": len(visitors_db),
        "today_visitors": len([v for v in visitors_db if datetime.fromisoformat(v["checkin_time"]).date() == today]),
        "this_week_visitors": 0,  # Implement week logic
        "this_month_visitors": 0  # Implement month logic
    }

@app.delete("/api/admin/visitors/{visitor_id}")
async def delete_visitor(visitor_id: int, payload: dict = Depends(verify_token)):
    global visitors_db
    visitors_db = [v for v in visitors_db if v["id"] != visitor_id]
    return {"message": "Visitor deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Run backend:
```bash
pip install fastapi uvicorn python-jose passlib bcrypt python-multipart
python backend/main.py
```

## 🎨 Customization

### Change Company Branding
Edit `.env`:
```env
VITE_COMPANY_NAME=Your Company
VITE_COMPANY_LOGO=/your-logo.png
```

### Add Custom Purposes
Edit `src/components/VisitorForm.jsx`:
```javascript
const purposeOptions = [
  'Business Meeting',
  'Interview',
  'Your Custom Purpose',
  // Add more...
];
```

### Modify Color Scheme
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#your-color',
    // ...
  }
}
```

## 📱 Features Demo

### User Flow
1. Visit `http://localhost:3000`
2. Fill visitor form
3. Submit → Auto check-in with timestamp
4. Success confirmation

### Admin Flow
1. Visit `http://localhost:3000/admin/login`
2. Login with credentials
3. View dashboard stats
4. Manage visitors:
   - Search & filter
   - Sort by date
   - Export to CSV
   - Delete records

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Protected admin routes
- ✅ Auto-logout on unauthorized
- ✅ Secure token storage
- ✅ Input validation
- ✅ CORS configuration
- ✅ Password hashing (backend)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
# Deploy FastAPI app
# Set environment variables
# Configure database
```

## 📝 License

MIT License - Feel free to use for commercial projects

## 🤝 Support

For issues or questions:
1. Check API endpoint configuration
2. Verify backend is running
3. Check browser console for errors
4. Review network tab for failed requests

---

**Built with ❤️ using React + FastAPI**
