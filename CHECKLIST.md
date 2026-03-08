# 🚀 Rural Employment Platform - Startup Checklist

## Prerequisites Check

- [ ] Node.js installed (v14+)
  ```bash
  node --version
  ```

- [ ] npm installed
  ```bash
  npm --version
  ```

- [ ] MongoDB installed and running
  ```bash
  mongosh
  # or
  sudo systemctl status mongodb
  ```

## Installation Steps

### 1. Backend Setup

```bash
cd Backend
npm install
```

- [ ] Dependencies installed
- [ ] `.env` file exists and configured
- [ ] MongoDB URI is correct in `.env`

### 2. Test MongoDB Connection

```bash
npm run test-db
```

- [ ] MongoDB connection successful

### 3. Seed Sample Data (Optional)

```bash
npm run seed
```

- [ ] Sample worker account created
- [ ] Sample employer account created
- [ ] Sample jobs created

### 4. Start Backend Server

```bash
npm run dev
```

- [ ] Server running on http://localhost:5000
- [ ] No errors in console
- [ ] MongoDB connected message appears

### 5. Frontend Setup (New Terminal)

```bash
cd Frontend
npm install
```

- [ ] Dependencies installed
- [ ] `.env` file exists
- [ ] API URL configured correctly

### 6. Start Frontend Server

```bash
npm start
```

- [ ] React app opens at http://localhost:3000
- [ ] No compilation errors
- [ ] Home page loads correctly

## Testing Checklist

### Basic Functionality

- [ ] Home page loads
- [ ] Navigation works
- [ ] Register page accessible

### Worker Flow

- [ ] Register as worker
- [ ] Login with worker account
- [ ] View worker dashboard
- [ ] Browse jobs
- [ ] View job details
- [ ] Apply for a job
- [ ] View applications

### Employer Flow

- [ ] Register as employer
- [ ] Login with employer account
- [ ] View employer dashboard
- [ ] Post a new job
- [ ] View posted jobs
- [ ] See job applications (if any)

### Profile Management

- [ ] Update basic profile
- [ ] Update worker/employer details
- [ ] View reviews

## Quick Test Accounts

If you ran the seed script, use these:

**Worker Account:**
- Email: `rajesh@worker.com`
- Password: `password123`

**Employer Account:**
- Email: `priya@employer.com`
- Password: `password123`

## API Endpoints Test

Test if backend is working:

```bash
# Health check
curl http://localhost:5000/

# Register test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890","password":"pass123","confirmPassword":"pass123","userType":"worker"}'
```

## Common Issues & Solutions

### ❌ MongoDB Connection Failed
**Solution:** 
```bash
# Start MongoDB
sudo systemctl start mongodb
# or
brew services start mongodb-community
```

### ❌ Port Already in Use
**Solution:** Change port in `Backend/.env`
```
PORT=5001
```

### ❌ Cannot find module
**Solution:** 
```bash
npm install
```

### ❌ CORS Error
**Solution:** Both servers must be running. Check URLs in Frontend `.env`

## Verification

### Backend Running ✅
- [ ] Terminal shows "Server running on port 5000"
- [ ] Terminal shows "MongoDB connected successfully"
- [ ] Visit http://localhost:5000/ shows API message

### Frontend Running ✅
- [ ] Terminal shows "Compiled successfully"
- [ ] Browser opens automatically at http://localhost:3000
- [ ] Home page displays correctly

### Both Communicating ✅
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can view dashboard
- [ ] Can browse jobs

## Development Commands

### Backend
```bash
cd Backend
npm run dev       # Start with nodemon (auto-restart)
npm start         # Start in production mode
npm run test-db   # Test MongoDB connection
npm run seed      # Seed sample data
```

### Frontend
```bash
cd Frontend
npm start         # Start development server
npm run build     # Build for production
```

## Next Steps After Setup

1. ✅ Test worker registration
2. ✅ Test employer registration
3. ✅ Post a test job
4. ✅ Apply to a job
5. ✅ Test payment flow
6. ✅ Test review system
7. 🔧 Customize as needed
8. 🔧 Deploy to production

## Production Deployment Checklist

- [ ] Update JWT_SECRET in production
- [ ] Configure production MongoDB (MongoDB Atlas)
- [ ] Update CORS settings
- [ ] Set NODE_ENV=production
- [ ] Configure production API URL
- [ ] Build frontend for production
- [ ] Setup SSL certificate
- [ ] Configure domain
- [ ] Setup monitoring
- [ ] Setup backups

## Support

If something doesn't work:

1. **Check both terminals** - Both servers should be running
2. **Check MongoDB** - Must be running and accessible
3. **Check console logs** - Look for error messages
4. **Check network tab** - In browser dev tools
5. **Verify .env files** - URLs and credentials correct

## Success! 🎉

If all checkboxes are checked, your platform is ready to use!

Visit: http://localhost:3000

---

**Quick Links:**
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- MongoDB: mongodb://localhost:27017

**Documentation:**
- [README.md](README.md) - Full documentation
- [SETUP.md](SETUP.md) - Setup guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
