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

## 🚀 Deployment

### 1) MongoDB Atlas Setup
1. Create a MongoDB Atlas cluster.
2. Create DB user and password.
3. In Network Access, allow your hosting provider IPs (or `0.0.0.0/0` for quick setup).
4. Copy connection string as `MONGODB_URI`.

### 2) Backend Deployment (Render)
This repository includes [render.yaml](render.yaml) for quick setup.

1. Push project to GitHub.
2. In Render, create service from repository (Blueprint or manual Web Service).
3. Use `Backend` as root directory.
4. Build command: `npm install`
5. Start command: `npm start`
6. Configure environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE=7d`
   - `FRONTEND_URL` (your Vercel frontend URL)
   - `NODE_ENV=production`
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (if using payments)
7. Deploy and copy backend URL (example: `https://your-backend.onrender.com`).

### 3) Frontend Deployment (Vercel)
This repository includes [Frontend/vercel.json](Frontend/vercel.json) for SPA route support.

1. Import repository in Vercel.
2. Set Root Directory to `Frontend`.
3. Framework preset: Create React App.
4. Add environment variables:
   - `REACT_APP_API_URL=https://your-backend.onrender.com/api`
   - `REACT_APP_RAZORPAY_KEY_ID` (if using payments)
5. Deploy.

### 4) Final CORS + API check
1. Update backend `FRONTEND_URL` with deployed Vercel URL.
2. Redeploy backend.
3. Test:
   - Register/Login
   - Post Job
   - Browse Jobs
   - Payments (if enabled)

### Environment Templates
- Backend template: [Backend/.env.example](Backend/.env.example)
- Frontend template: [Frontend/.env.example](Frontend/.env.example)

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
