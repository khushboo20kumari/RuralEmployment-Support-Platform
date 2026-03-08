# AI Copilot Instructions for Rural Employment Support Platform

This document guides AI agents in understanding and contributing to the Rural Employment Support Platform codebase.

## 🎯 Project Overview

**Rural Employment Support Platform** - A full-stack web application connecting rural workers directly with employers, eliminating middlemen exploitation through secure payments and direct connections.

- **Backend**: Node.js + Express.js + MongoDB
- **Frontend**: React + Bootstrap
- **Architecture**: RESTful API with JWT authentication
- **Database**: 7 MongoDB models with relationships

## 🏗️ Critical Architecture Decisions

### 1. **Three-Layer Backend Structure**
```
Routes (HTTP endpoints) → Controllers (business logic) → Models (database)
```
**Files**: `routes/`, `controllers/`, `models/`
- Each controller handles one domain (auth, jobs, payments, etc.)
- Models define data structure with validations
- Routes map HTTP methods to controller functions

### 2. **Role-Based Access Control (3 user types)**
- **Worker**: Job seeker (can apply, track, receive payments)
- **Employer**: Job poster (can post, manage, pay)
- **Admin**: Moderator (approves jobs, manages users)

**Implementation**: 
- `userType` field in User model: `'worker' | 'employer' | 'admin'`
- Middleware at `Backend/middleware/auth.js`: `checkUserType()` restricts routes
- Apply like: `router.post('/jobs', authMiddleware, checkUserType(['employer']), postJob)`

### 3. **Job Approval Workflow**
```
Employer posts job → Admin approves → Workers see it → Workers apply
```
**Key fields in Job model**:
- `isApproved: Boolean` - Admin must approve before visibility
- `jobStatus: 'open' | 'closed'` - Employer can close anytime
- Only jobs with `isApproved: true && jobStatus: 'open'` appear in job listings

### 4. **Escrow Payment System**
```
Employer payment → Platform holds (takes 5% fee) → Worker receives net amount
```
**Payment model logic** (`Backend/controllers/paymentController.js`):
- Advance payment: Employer sends amount, platform takes 5%, worker gets rest
- Final payment: Released after job completion
- Two separate payment records track advance and final separately

### 5. **Frontend-Backend Communication**
- All API calls through `Frontend/src/services/api.js`
- Uses Axios with centralized `getAuthHeader()` for JWT token
- API base URL from `.env`: `REACT_APP_API_URL=http://localhost:5000/api`
- Protected routes in React: `Frontend/src/components/ProtectedRoute.js` checks auth context

## 📂 Key File Organization

### Backend Structure
```
Backend/
├── server.js                    # Express app, MongoDB connection, middleware setup
├── middleware/auth.js           # JWT verification & role checking
├── controllers/
│   ├── authController.js        # Login, register, profile
│   ├── jobController.js         # Post, browse, filter jobs
│   ├── applicationController.js # Apply, manage applications
│   ├── paymentController.js     # Advance & final payments
│   └── [others]                 # Worker, employer, review, admin
├── models/
│   ├── User.js                  # Base auth model (password hashed with bcrypt)
│   ├── Job.js                   # Job posting with employer reference
│   ├── Application.js           # Tracks worker → job application
│   ├── Payment.js               # Payment records with status tracking
│   └── [others]                 # Worker, Employer, Review
└── routes/                      # Maps HTTP methods to controllers
```

### Frontend Structure
```
Frontend/src/
├── pages/                       # 10 major pages
│   ├── EmployerDashboard.js    # Shows employer's jobs with approval status
│   ├── JobList.js              # Displays all open jobs (requires isApproved: true)
│   └── [others]                # Login, Register, Profile, etc.
├── components/
│   ├── ProtectedRoute.js        # Wraps routes requiring auth
│   └── Navbar.js                # Navigation with role-based menu
├── context/AuthContext.js       # Global auth state (user, token)
├── services/api.js              # Centralized API calls with auth headers
└── styles/App.css               # Bootstrap + custom styling
```

## 🔄 Critical Data Flows

### Worker Job Application Flow
```
1. Worker browses jobs (GET /api/jobs, must have isApproved: true)
2. Worker clicks "Apply" (POST /api/applications/:jobId)
   → Creates Application record with status: 'pending'
3. Employer views applications (GET /api/applications/employer/list)
4. Employer accepts (PUT /api/applications/:id/accept)
   → Updates status to 'accepted', initiates payment phase
5. Employer makes advance payment (POST /api/payments/advance)
   → Creates Payment record, transfers funds, updates Application.status to 'accepted'
6. Worker starts work
7. After completion: Employer releases final payment (POST /api/payments/release)
   → Creates new Payment record for remaining amount
```

### Admin Approval Flow
```
1. Employer posts job (POST /api/jobs)
   → Job created with isApproved: false
2. Admin views pending jobs (GET /api/admin/jobs)
3. Admin approves (PUT /api/admin/jobs/:id/approve)
   → Sets isApproved: true, job now visible to workers
```

## ⚙️ Development Patterns

### Controller Pattern
Each controller function follows this structure:
```javascript
exports.functionName = async (req, res) => {
  try {
    // 1. Validate input
    if (!req.body.field) return res.status(400).json({ message: '...' });
    
    // 2. Find user/related data
    const user = await User.findById(req.userId);
    
    // 3. Check permissions
    if (user.userType !== 'employer') 
      return res.status(403).json({ message: 'Access denied' });
    
    // 4. Execute business logic
    const result = await Model.create/update/delete(...);
    
    // 5. Return response
    res.status(201).json({ message: '...', result });
  } catch (error) {
    res.status(500).json({ message: 'Error...', error: error.message });
  }
};
```

### Authentication Pattern
```javascript
// Protecting a route
router.post('/path', authMiddleware, checkUserType(['employer']), controller);

// In controller, access authenticated user via:
req.user       // Full user object
req.userId     // User's MongoDB ID
```

### API Call Pattern (Frontend)
```javascript
// All API calls defined in services/api.js
export const jobAPI = {
  getAll: (params) => axios.get(`${API_URL}/jobs`, { params }),
  create: (data) => axios.post(`${API_URL}/jobs`, data, { headers: getAuthHeader() }),
};

// Used in components
const response = await jobAPI.getAll({ workType: 'construction' });
```

## 🔒 Security Conventions

- **Passwords**: Hashed with bcrypt (10 rounds) via `User.pre('save')` hook
- **Authentication**: JWT tokens with 7-day expiry
- **Authorization**: Role checks in middleware before controller execution
- **Validation**: Always validate `req.body` before database operations
- **File uploads**: Stored in `Backend/uploads/`, accessed via `/uploads` route

## 🚀 Command Reference

### Backend
```bash
cd Backend
npm install              # Install dependencies
npm run dev              # Start with nodemon (watches for changes)
npm start                # Production start
node seed.js             # Create test data
node test-db.js          # Test MongoDB connection
```

### Frontend
```bash
cd Frontend
npm install              # Install dependencies
npm start                # Start dev server (port 3000)
npm run build            # Production build
```

### Test Credentials (from seed.js)
- Admin: `admin@ruralemp.com` / `admin123`
- Worker: `rajesh@worker.com` / `password123`
- Employer: `priya@employer.com` / `password123`

## 📋 Common Tasks & Where to Make Changes

| Task | Files to Modify |
|------|-----------------|
| Add new API endpoint | Create route in `routes/`, logic in `controllers/`, expose in `server.js` |
| Add new database field | Update `models/`, add validation, update controller logic |
| Add new permission | Modify `checkUserType()` in `middleware/auth.js` |
| Add new page | Create file in `Frontend/src/pages/`, add route in `App.js` |
| Add new API call | Define in `Frontend/src/services/api.js`, use in component |
| Fix job visibility | Check `isApproved: true` in job queries in `jobController.js` |
| Fix payment logic | Review calculation in `paymentController.js`, check `platformFee` |
| Modify dashboard stats | Update stats calculation in page component |

## 🛑 Critical Implementation Rules

1. **Always check `isApproved`** when querying jobs for worker listings
2. **Always verify user role** before allowing sensitive operations
3. **Always hash passwords** - never store plaintext (automatic via User model hook)
4. **Always validate input** before database operations
5. **Always include error handling** with descriptive messages
6. **Always use JWT token** from header for authentication
7. **Always apply 5% platform fee** to payments (see paymentController.js line 51)

## 🔗 Cross-Component Communication

- **Frontend → Backend**: Axios calls to `/api/*` endpoints
- **Backend → Database**: Mongoose models with validations
- **Frontend State**: AuthContext for user/token globally
- **API Response Format**: Always `{ message: '...', data: {...} }`

## 📌 Special Notes

- MongoDB URI: `process.env.MONGODB_URI` (default: `mongodb://localhost:27017/rural_employment`)
- CORS enabled for `localhost:3000` and `REACT_APP_FRONTEND_URL` from .env
- File uploads go to `Backend/uploads/`, served via `/uploads` static route
- Job filters are case-sensitive (workType uses underscores: `construction_labour`)
- Payment transactions are immutable once created (create new record for additional payments)

## 🎯 Next Steps for Development

1. Start with user flows (registration → job posting → application → payment)
2. Test each endpoint with provided test credentials
3. Verify database records match expected state
4. Check frontend displays match backend data
5. Test role-based access (worker shouldn't access employer routes)
6. Validate payment calculations (5% fee correctly applied)
