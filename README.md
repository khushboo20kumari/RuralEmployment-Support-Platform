# Rural Employment Support Platform

A comprehensive platform connecting rural workers with employers, eliminating middlemen exploitation and providing secure payment systems.

## 🌟 Features

### For Workers
- ✅ Easy registration and profile creation
- ✅ Browse and apply for jobs
- ✅ Track application status
- ✅ Secure advance payment system
- ✅ Build work history and ratings
- ✅ Skill verification

### For Employers
- ✅ Post job requirements
- ✅ Find and hire skilled workers
- ✅ Manage applications
- ✅ Secure payment processing
- ✅ Worker verification system
- ✅ Review and rating system

### Platform Benefits
- 🚫 No middlemen - direct connection
- 🔒 Secure payment escrow system
- ⭐ Rating and review system
- 📱 Simple, mobile-friendly interface
- 💰 Transparent pricing
- 📊 Work history tracking

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Bootstrap** - UI components
- **Axios** - API calls
- **React Toastify** - Notifications

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection URI)
- npm or yarn

### Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `.env` file and update:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rural_employment
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the backend server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🗄️ Database Models

### User
- Basic user information (name, email, phone, password)
- User type (worker/employer/admin)
- Address details
- Verification status

### Worker Profile
- Skills and experience
- Rates (hourly/daily/monthly)
- Availability
- ID verification
- Work history and ratings

### Employer Profile
- Company information
- Business type
- Contact details
- Verification documents
- Hiring statistics

### Job
- Title and description
- Work type and location
- Salary details
- Working hours
- Requirements
- Status (open/closed/filled)

### Application
- Worker-Job connection
- Status tracking
- Employer notes
- Acceptance/rejection details

### Payment
- Advance payment system
- Transaction details
- Platform commission
- Payment status
- Release mechanism

### Review
- Rating system (1-5 stars)
- Comments
- Review type (worker/employer)
- Detailed ratings (punctuality, quality, etc.)

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get worker by ID
- `GET /api/workers/profile/me` - Get my worker profile
- `PUT /api/workers/profile/update` - Update worker profile

### Employers
- `GET /api/employers` - Get all employers
- `GET /api/employers/:id` - Get employer by ID
- `GET /api/employers/profile/me` - Get my employer profile
- `PUT /api/employers/profile/update` - Update employer profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Post new job (employer only)
- `GET /api/jobs/my-jobs/list` - Get my posted jobs
- `PUT /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/close` - Close job

### Applications
- `POST /api/applications/apply/:jobId` - Apply for job
- `GET /api/applications/my-applications/list` - Get my applications
- `GET /api/applications/job/:jobId/applications` - Get job applications
- `PUT /api/applications/:applicationId/status` - Update application status
- `DELETE /api/applications/:applicationId/cancel` - Cancel application

### Payments
- `POST /api/payments/advance` - Create advance payment
- `PUT /api/payments/:paymentId/release` - Release payment
- `GET /api/payments/worker/earnings` - Get worker earnings
- `GET /api/payments/my-payments/list` - Get employer payments
- `GET /api/payments/:paymentId/details` - Get payment details

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:userId` - Get reviews for user
- `GET /api/reviews/my-reviews/list` - Get my reviews

## 💰 Revenue Model

The platform generates revenue through:

1. **Placement Fee**: ₹300-₹1000 per successful worker placement
2. **Commission**: 5-10% from first salary payment
3. **Subscription Plans**:
   - Free: Basic features
   - Basic: ₹2000/month
   - Premium: ₹5000/month
   - Enterprise: Custom pricing

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- User type verification
- Secure payment handling
- ID verification system

## 🚀 Deployment Guide (Complete with Data)

### Prerequisites
- GitHub account with repository pushed
- MongoDB Atlas account (free tier available)
- Render account (free tier available)
- Vercel account (free tier available)

### Step 1: MongoDB Atlas Setup (With Data)

#### 1.1 Create Cluster
1. Go to https://cloud.mongodb.com
2. Create a new Project
3. Create a **Cluster** (FREE tier is fine)
4. Click "Connect" and note the connection details

#### 1.2 Create Database User
1. In MongoDB Atlas, go to **"Database Access"** → **"Add New Database User"**
2. Choose "Password" authentication
3. Create username and password
4. Select **"Atlas Admin"** role (for full access)
5. Click **"Create User"**
6. Save the credentials securely

#### 1.3 Configure Network Access
1. Go to **"Network Access"** (left sidebar under Security)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** button
4. This adds `0.0.0.0/0` (required for Render dynamic IPs)
5. Click **"Confirm"** and wait for status to become ACTIVE (1-2 minutes)

#### 1.4 Get Connection String
1. Click "Connect" on your cluster
2. Select "Drivers" → "Node.js"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your actual credentials
5. Replace `<dbname>` with `rural_employment`

**Example:**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/rural_employment?retryWrites=true&w=majority
```

#### 1.5 Populate Test Data (Optional)
1. Navigate to Backend:
```bash
cd Backend
npm install
```

2. Create `.env` file in Backend with:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/rural_employment?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
```

3. Run seed script to add test data:
```bash
node seed.js
```

This creates:
- 1 Admin user (admin@ruralemp.com / admin123)
- 3 Worker accounts
- 2 Employer accounts
- 5 sample jobs with approval status
- Payment records

**Test Credentials:**
```
Admin:    admin@ruralemp.com / admin123
Worker:   rajesh@worker.com / password123
Employer: priya@employer.com / password123
```

---

### Step 2: Backend Deployment (Render)

#### 2.1 Push to GitHub
```bash
# From project root
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2.2 Create Render Service
1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Connect your GitHub repository
5. Configure:
   - **Name:** `rural-employment-api`
   - **Root Directory:** `Backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid if needed)

#### 2.3 Add Environment Variables in Render
Click **"Environment"** and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/rural_employment?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=(leave blank for now, update after Vercel deployment)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
RAZORPAY_KEY_SECRET=razorpay_secret_key_here
```

#### 2.4 Deploy
1. Click **"Create Web Service"**
2. Render will build and deploy automatically
3. Wait for message: **"Your service is live 🎉"**
4. Copy your backend URL (example: `https://rural-employment-api.onrender.com`)
5. Note: First deployment may take 2-3 minutes

---

### Step 3: Frontend Deployment (Vercel)

#### 3.1 Deploy to Vercel
1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. **"Import Git Repository"**
4. Select your GitHub repository
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

#### 3.2 Add Environment Variables in Vercel
Click **"Environment Variables"** and add:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_XXXXXXXX
```

(Replace `your-backend-url` with your actual Render backend URL)

#### 3.3 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. Get your frontend URL (example: `https://your-app.vercel.app`)
4. Wait for deployment to complete

---

### Step 4: Update Backend CORS Configuration

#### 4.1 Add Frontend URL to Render
1. Go to Render dashboard
2. Click your backend service
3. Go to **"Environment"**
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Click **"Save"** (this will redeploy automatically)

#### 4.2 Verify CORS is Working
- Go to your Vercel frontend URL
- Try to login or register
- If successful, CORS is configured correctly

---

### Step 5: Test Complete Application

#### 5.1 Test Login Flow
1. Go to your frontend URL
2. Login with test credentials (example):
   - Email: `admin@ruralemp.com`
   - Password: `admin123`
3. Verify you reach the dashboard

#### 5.2 Test Job Posting (Employer)
1. Login as employer (`priya@employer.com / password123`)
2. Go to **"Post Job"**
3. Fill job details and submit
4. Verify job appears in admin dashboard pending approval
5. As admin, approve the job
6. Verify job now appears in worker job listings

#### 5.3 Test Job Application (Worker)
1. Login as worker (`rajesh@worker.com / password123`)
2. Browse available jobs
3. Click **"Apply"** on a job
4. Check "My Applications" to see status

#### 5.4 Test Payment Flow
1. As employer, go to **"Applications"**
2. Accept a worker's application
3. Click **"Make Payment"**
4. Use Razorpay test card: `4111 1111 1111 1111`
5. Enter any CVV and future date
6. Verify payment appears in both dashboards

---

## 🛠️ Troubleshooting Deployment

### MongoDB Connection Error
**Error:** `Could not connect to any servers in your MongoDB Atlas cluster`

**Solution:**
1. Go to MongoDB Atlas → **Network Access**
2. Verify `0.0.0.0/0` is showing with **ACTIVE** status
3. Wait 3-5 minutes if status is PENDING
4. Go to Render dashboard
5. Click **"Manual Deploy"** → **"Deploy latest commit"**
6. Check logs for "MongoDB connected successfully"

### CORS Error in Frontend
**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
1. Verify `REACT_APP_API_URL` in Vercel environment matches your Render backend URL
2. Verify `FRONTEND_URL` in Render environment matches your Vercel frontend URL
3. Redeploy both services
4. Clear browser cache (Ctrl+Shift+Delete)

### Jobs Not Appearing for Workers
**Issue:** Posted jobs don't show in job listings

**Solution:**
1. Login as admin
2. Go to "Admin Dashboard"
3. Find the job in **"Pending Approvals"**
4. Click **"Approve"**
5. Job will now appear for workers

### Payment Not Processing
**Issue:** Razorpay payment button not working

**Solution:**
1. Verify `RAZORPAY_KEY_ID` is set in both:
   - Render backend environment
   - Vercel frontend environment
2. Use Razorpay test keys (not production keys)
3. For testing, use card: `4111 1111 1111 1111`

### Service Goes to Sleep
**Note:** Free Render instances go to sleep after 15 minutes of inactivity. Upgrade to paid plan for continuous availability.

---

### Environment Templates
- Backend template: [Backend/.env.example](Backend/.env.example)
- Frontend template: [Frontend/.env.example](Frontend/.env.example)

### Deployment Configuration Files
- Backend: [render.yaml](render.yaml) - Render deployment blueprint
- Frontend: [Frontend/vercel.json](Frontend/vercel.json) - Vercel SPA routing

## 📱 User Flow

### Worker Flow
1. Register as worker
2. Complete profile with skills
3. Browse available jobs
4. Apply for jobs
5. Wait for employer acceptance
6. Complete work
7. Receive payment
8. Get/give reviews

### Employer Flow
1. Register as employer
2. Complete company profile
3. Post job requirements
4. Review applications
5. Accept suitable workers
6. Make advance payment
7. Release payment after work completion
8. Give/receive reviews

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For support and queries:
- Email: support@ruralemployment.com
- Phone: +91-XXXXXXXXXX

## 🎯 Future Enhancements

- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] AI-based job matching
- [ ] Video verification
- [ ] Multiple languages support
- [ ] Payment gateway integration
- [ ] GPS-based location tracking
- [ ] Advanced analytics dashboard
- [ ] Skill certification system

---

**Made with ❤️ for Rural India**
