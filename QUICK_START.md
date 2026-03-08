# 🚀 Quick Start Guide

## 📱 Start the Application (2 Terminals Required)

### **Terminal 1 - Backend Server**
```bash
cd Backend
npm install  # First time only
npm run dev
```
✅ Server runs on: `http://localhost:5000`  
✅ API endpoints: `http://localhost:5000/api/*`

### **Terminal 2 - Frontend App**
```bash
cd Frontend
npm install  # First time only
npm start
```
✅ App opens on: `http://localhost:3000`

---

## 👤 Login Credentials (Test Accounts)

### **Admin Account** (Can approve jobs, view analytics)
```
Email:    admin@ruralemp.com
Password: admin123
Role:     Admin (全部Access)
```

### **Worker Account** (Can browse jobs, apply, track earnings)
```
Email:    rajesh@worker.com
Password: password123
Role:     Worker
```

### **Employer Account** (Can post jobs, manage applications, make payments)
```
Email:    priya@employer.com
Password: password123
Role:     Employer
```

---

## 🧪 Test Complete User Journey

### **Step 1: Admin Approves Jobs**
1. Open `http://localhost:3000`
2. Login as Admin (admin@ruralemp.com)
3. Go to **Admin Dashboard**
4. Click **"Pending Jobs"** tab
5. See jobs awaiting approval
6. Click **"Review"** button
7. Click **"✅ Approve"** to make job visible to workers

### **Step 2: Worker Finds & Applies**
1. Open new browser tab/window
2. Login as Worker (rajesh@worker.com)
3. Go to **Worker Dashboard**
4. Click **"🔍 Browse Jobs"** button
5. See approved jobs
6. Click job card → **"Apply Now"**
7. Submit application
8. See application in **"📋 View Applications"** - in "⏳ Pending" tab

### **Step 3: Employer Reviews & Accepts**
1. Open new browser tab/window
2. Login as Employer (priya@employer.com)
3. Go to **Employer Dashboard**
4. Click **"Applications"** button
5. See worker's application
6. Click **"✓ Accept"**
7. Application moves to "Accepted" status

### **Step 4: Employer Makes Payment**
1. In Employer account, click on accepted application
2. Click **"💳 Make Payment"**
3. Enter amount: `5000`
4. Select payment method: `UPI`
5. Confirm payment
6. Platform takes 5% fee, worker gets rest

### **Step 5: Worker Receives Payment**
1. Switch to Worker account
2. Go to **"💳 View Payments"** (or click Worker Menu → Payments)
3. See payment in "✓ Completed" tab
4. Amount shown: 4750 (5000 - 5% fee)

### **Step 6: View Analytics**
1. Go back to Admin account
2. Admin Dashboard
3. Click **"📊 Analytics"** tab
4. See platform revenue: 250 (5% of 5000)

---

## 📊 Dashboard Overview

### **Admin Dashboard** (`/admin`)
- 8 stat cards (jobs, users, payments, revenue)
- 3 tabs: Jobs, Users, Analytics
- Approve/reject jobs easily
- View all user accounts

### **Worker Dashboard** (`/worker-dashboard`)
- Stats: Pending, Accepted, Completed, Earnings
- Profile completion progress
- Quick action buttons
- Application tabs (Pending, Accepted, Completed)

### **Employer Dashboard** (`/employer-dashboard`)
- Stats: Posted, Approved, Pending, Active
- Job list with approval status
- Filter: All, Approved, Pending, Closed
- Direct link to applications

### **Payment Tracking** (`/payments`)
- 4 stats cards (total, advance, final, pending)
- 5 filter tabs (all, advance, final, completed, pending)
- Payment history table with details
- Fee breakdown explanation

---

## 🔗 Important URLs

```
Home              http://localhost:3000
Login             http://localhost:3000/login
Register          http://localhost:3000/register

Worker Pages:
  Dashboard       http://localhost:3000/worker-dashboard
  Browse Jobs     http://localhost:3000/jobs
  Applications    http://localhost:3000/applications
  Profile         http://localhost:3000/profile
  Payments        http://localhost:3000/payments

Employer Pages:
  Dashboard       http://localhost:3000/employer-dashboard
  Post Job        http://localhost:3000/employer/post-job
  My Jobs         (visible in dashboard)
  Applications    (visible in dashboard)

Admin Pages:
  Dashboard       http://localhost:3000/admin (auto-redirected if admin)
  Job Approval    (tab in admin dashboard)
  User List       (tab in admin dashboard)
  Analytics       (tab in admin dashboard)

API:
  Base URL        http://localhost:5000/api
  Docs            See .github/copilot-instructions.md
```

---

## 🧰 Troubleshooting

### **"Port 5000 already in use"**
```bash
# Find & kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### **"MongoDB connection error"**
```bash
# Make sure MongoDB is running
mongosh  # Should connect successfully

# Or check in code: Backend/server.js line 15
# MONGODB_URI=mongodb://localhost:27017/rural_employment
```

### **"Module not found" error**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **CORS errors**
```
Backend/server.js has CORS configured for:
- http://localhost:3000
- process.env.FRONTEND_URL
```

### **"Invalid email or password"** when logging in
```
Make sure you've seeded test data:
cd Backend && node seed.js

Check if user exists:
mongosh → use rural_employment → db.users.find()
```

---

## 📝 Test Data Generation

If test accounts don't exist, seed them:

```bash
cd Backend
node seed.js
```

This creates:
- ✅ 1 Admin user
- ✅ 1 Worker user  
- ✅ 1 Employer user
- ✅ 5 Sample jobs
- ✅ Sample applications

---

## 🎯 Key Features to Test

| Feature | Test Steps |
|---------|-----------|
| **Admin Approval** | Admin Dashboard → Pending Jobs tab → Approve |
| **Job Application** | Worker Dashboard → Browse Jobs → Apply Now |
| **Payment Tracking** | Worker/Employer → View Payments → See history |
| **Application Status** | Worker Dashboard → Tabs (Pending/Accepted/Completed) |
| **Earnings** | Worker Dashboard → Stats card "Total Earnings" |
| **Profile Completion** | Worker Dashboard → Progress bar on top |
| **Platform Revenue** | Admin Dashboard → Analytics tab → Revenue stat |

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - Bcrypt with 10 rounds  
✅ **Role-Based Access** - Worker/Employer/Admin segregation  
✅ **Protected Routes** - API endpoints require auth token  
✅ **CORS Enabled** - Only trusted origins allowed  
✅ **Environment Variables** - Secrets in .env file  

---

## 📦 Tech Stack

**Frontend:**
- React 18+
- React Router
- Bootstrap 5
- Axios (HTTP client)
- React Toastify (notifications)

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose (ODM)
- JWT (authentication)
- Bcrypt (password hashing)

**Database:**
- MongoDB (NoSQL)
- 7 Collections: User, Worker, Employer, Job, Application, Payment, Review

---

## 🆘 Need Help?

### **Check Documentation:**
1. `.github/copilot-instructions.md` - Architecture & patterns
2. `README.md` - Project overview
3. `FEATURES_IMPLEMENTED.md` - What's been built
4. `Backend/controllers/*.js` - Business logic
5. `Frontend/src/services/api.js` - API endpoints

### **Common Issues & Solutions:**
- **Can't login?** → Run `node seed.js` to create test users
- **Page not found?** → Check URL (use forward slashes, no spaces)
- **API error?** → Check Backend running on port 5000
- **Styles not loading?** → Hard refresh browser (Ctrl+Shift+R)
- **Database error?** → Check MongoDB is running (`mongosh`)

---

## ✅ Checklist Before Going Live

- [ ] MongoDB is running locally or on cloud (MongoDB Atlas)
- [ ] Backend `.env` configured with:
  - `PORT=5000`
  - `MONGODB_URI=mongodb://localhost:27017/rural_employment`
  - `JWT_SECRET=your_secret_key`
  - `JWT_EXPIRE=7d`
  - `NODE_ENV=development`
- [ ] Frontend `.env` configured with:
  - `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Test all 3 user types (Admin, Worker, Employer)
- [ ] Test complete job flow (post → approve → apply → pay)
- [ ] Check payment calculations (5% fee applied correctly)
- [ ] Verify mobile responsiveness
- [ ] Test error scenarios (invalid login, server down, etc)

---

## 🚀 Next Steps

1. **Explore the codebase** - Read the AI instructions
2. **Run the app** - Follow Quick Start Guide
3. **Test all flows** - Use all 3 user accounts
4. **Customize** - Modify colors, text, branding
5. **Deploy** - Use Vercel (Frontend) + Heroku/Render (Backend)

---

**Happy coding! Your platform is ready to connect rural workers with employers! 🌾💼**
