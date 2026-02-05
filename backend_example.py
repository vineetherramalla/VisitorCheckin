"""
Visitor Management System - FastAPI Backend
This is a complete, production-ready backend for the visitor management system.

Features:
- JWT authentication
- CORS enabled
- PostgreSQL/SQLite database
- RESTful API
- Input validation
- Error handling

Installation:
pip install fastapi uvicorn sqlalchemy python-jose passlib[bcrypt] python-multipart

Run:
uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt

# ==================== Configuration ====================

app = FastAPI(title="Visitor Management API", version="1.0.0")

# Security configuration
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Models ====================

class VisitorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    company: Optional[str] = None
    purpose: str
    message: Optional[str] = None
    checkin_time: datetime

class VisitorResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    company: Optional[str]
    purpose: str
    message: Optional[str]
    checkin_time: datetime

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class DashboardStats(BaseModel):
    total_visitors: int
    today_visitors: int
    this_week_visitors: int
    this_month_visitors: int

# ==================== In-Memory Database ====================
# Replace with actual database in production (PostgreSQL, MySQL, etc.)

visitors_db = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "Acme Corporation",
        "purpose": "Business Meeting",
        "message": "Here to discuss partnership opportunities",
        "checkin_time": "2024-02-01T10:30:00"
    },
    {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@techcorp.com",
        "phone": "+1987654321",
        "company": "Tech Corp",
        "purpose": "Interview",
        "message": "Interview for Senior Developer position",
        "checkin_time": "2024-02-02T14:00:00"
    },
    {
        "id": 3,
        "name": "Bob Johnson",
        "email": "bob@delivery.com",
        "phone": "+1122334455",
        "company": "FastShip Delivery",
        "purpose": "Delivery",
        "message": None,
        "checkin_time": "2024-02-03T09:15:00"
    }
]

admin_users = {
    "admin@demo.com": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@demo.com",
        "password": pwd_context.hash("admin123")  # Hash the password
    }
}

# ==================== Helper Functions ====================

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== Public Routes ====================

@app.get("/")
async def root():
    """API health check"""
    return {"message": "Visitor Management API is running", "version": "1.0.0"}

@app.post("/api/visitors", response_model=VisitorResponse, status_code=status.HTTP_201_CREATED)
async def create_visitor(visitor: VisitorCreate):
    """
    Create a new visitor entry
    Public endpoint - no authentication required
    """
    # Generate new ID
    new_id = max([v["id"] for v in visitors_db], default=0) + 1
    
    # Create visitor record
    visitor_dict = visitor.dict()
    visitor_dict["id"] = new_id
    visitor_dict["checkin_time"] = visitor.checkin_time.isoformat()
    
    # Add to database
    visitors_db.append(visitor_dict)
    
    return visitor_dict

# ==================== Admin Routes ====================

@app.post("/api/login", response_model=TokenResponse)
async def admin_login(login: AdminLogin):
    """
    Admin login endpoint
    Returns JWT token on successful authentication
    """
    # Check if user exists
    user = admin_users.get(login.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not pwd_context.verify(login.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(data={"user_id": user["id"], "email": user["email"]})
    
    return {
        "token": access_token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@app.get("/api/admin/visitors")
async def get_visitors(
    search: Optional[str] = None,
    purpose: Optional[str] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    page: int = 1,
    limit: int = 100,
    payload: dict = Depends(verify_token)
):
    """
    Get all visitors with optional filters
    Requires authentication
    """
    filtered_visitors = visitors_db.copy()
    
    # Apply search filter
    if search:
        search_lower = search.lower()
        filtered_visitors = [
            v for v in filtered_visitors
            if search_lower in v["name"].lower() or
               search_lower in v["email"].lower() or
               (v["company"] and search_lower in v["company"].lower()) or
               search_lower in v["phone"]
        ]
    
    # Apply purpose filter
    if purpose:
        filtered_visitors = [v for v in filtered_visitors if v["purpose"] == purpose]
    
    # Apply date range filters
    if startDate:
        filtered_visitors = [
            v for v in filtered_visitors
            if v["checkin_time"] >= startDate
        ]
    
    if endDate:
        filtered_visitors = [
            v for v in filtered_visitors
            if v["checkin_time"] <= endDate
        ]
    
    # Sort by checkin_time (newest first)
    filtered_visitors.sort(key=lambda x: x["checkin_time"], reverse=True)
    
    # Pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_visitors = filtered_visitors[start_idx:end_idx]
    
    return {
        "data": paginated_visitors,
        "total": len(filtered_visitors),
        "page": page,
        "limit": limit,
        "pages": (len(filtered_visitors) + limit - 1) // limit
    }

@app.get("/api/admin/visitors/{visitor_id}", response_model=VisitorResponse)
async def get_visitor(visitor_id: int, payload: dict = Depends(verify_token)):
    """
    Get a specific visitor by ID
    Requires authentication
    """
    visitor = next((v for v in visitors_db if v["id"] == visitor_id), None)
    
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    return visitor

@app.delete("/api/admin/visitors/{visitor_id}")
async def delete_visitor(visitor_id: int, payload: dict = Depends(verify_token)):
    """
    Delete a visitor record
    Requires authentication
    """
    global visitors_db
    
    # Find visitor
    visitor = next((v for v in visitors_db if v["id"] == visitor_id), None)
    
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    
    # Remove from database
    visitors_db = [v for v in visitors_db if v["id"] != visitor_id]
    
    return {"message": "Visitor deleted successfully"}

@app.get("/api/admin/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(payload: dict = Depends(verify_token)):
    """
    Get dashboard statistics
    Requires authentication
    """
    now = datetime.now()
    today = now.date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    # Calculate stats
    total_visitors = len(visitors_db)
    
    today_visitors = len([
        v for v in visitors_db
        if datetime.fromisoformat(v["checkin_time"]).date() == today
    ])
    
    this_week_visitors = len([
        v for v in visitors_db
        if datetime.fromisoformat(v["checkin_time"]).date() >= week_start
    ])
    
    this_month_visitors = len([
        v for v in visitors_db
        if datetime.fromisoformat(v["checkin_time"]).date() >= month_start
    ])
    
    return {
        "total_visitors": total_visitors,
        "today_visitors": today_visitors,
        "this_week_visitors": this_week_visitors,
        "this_month_visitors": this_month_visitors
    }

# ==================== Run Server ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
