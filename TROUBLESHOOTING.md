# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. MongoDB Connection Issues

#### Error: "MongoDB connection error: connect ECONNREFUSED"

**Cause:** MongoDB is not running

**Solutions:**

**Linux:**
```bash
# Check status
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb

# Enable on boot
sudo systemctl enable mongodb
```

**macOS:**
```bash
# Start MongoDB
brew services start mongodb-community

# Check if running
brew services list
```

**Windows:**
```bash
# Start MongoDB service from Services app
# Or run: net start MongoDB
```

**Alternative:** Use MongoDB Atlas (cloud)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

---

### 2. Port Already in Use

#### Error: "Error: listen EADDRINUSE: address already in use :::5000"

**Solution 1:** Kill the process using the port
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Solution 2:** Change the port
Edit `Backend/.env`:
```
PORT=5001
```

Then update `Frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

---

### 3. Module Not Found Errors

#### Error: "Cannot find module 'express'" or similar

**Solution:**
```bash
# In Backend directory
cd Backend
rm -rf node_modules
rm package-lock.json
npm install

# In Frontend directory
cd Frontend
rm -rf node_modules
rm package-lock.json
npm install
```

---

### 4. CORS Errors

#### Error: "Access to XMLHttpRequest blocked by CORS policy"

**Cause:** Backend and Frontend not communicating properly

**Solution:**

1. Check both servers are running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

2. Verify `Frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Clear browser cache and restart

---

### 5. JWT Token Issues

#### Error: "Invalid token" or "No token provided"

**Solutions:**

1. **Clear browser storage:**
```javascript
// In browser console
localStorage.clear()
```

2. **Login again** - Token may have expired

3. **Check JWT_SECRET** - Must be same in production

---

### 6. React Build/Compilation Errors

#### Error: Various React compilation errors

**Solutions:**

1. **Clear cache:**
```bash
cd Frontend
rm -rf node_modules
rm -rf build
npm install
npm start
```

2. **Check Node version:**
```bash
node --version
# Should be v14 or higher
```

3. **Update dependencies:**
```bash
npm update
```

---

### 7. Password Hashing Issues

#### Error: "bcrypt error" or password validation fails

**Solution:**

1. **Reinstall bcryptjs:**
```bash
cd Backend
npm uninstall bcryptjs
npm install bcryptjs
```

2. **Use bcrypt instead:**
```bash
npm install bcrypt
```
Then update imports in code.

---

### 8. Application Not Loading

#### Issue: Blank screen or loading forever

**Solutions:**

1. **Check browser console** (F12) for errors

2. **Verify API connection:**
```bash
# Test backend
curl http://localhost:5000/

# Should return: {"message":"Rural Employment Support Platform API"}
```

3. **Check React environment:**
```bash
cd Frontend
npm start
```

4. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete

---

### 9. Registration/Login Not Working

#### Issue: User can't register or login

**Debugging Steps:**

1. **Check Backend logs** - Look for errors in terminal

2. **Check MongoDB** - Ensure it's connected

3. **Test API directly:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "phone": "1234567890",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "worker"
  }'
```

4. **Check validation:**
   - Email must be valid format
   - Phone number required
   - Passwords must match
   - All required fields filled

---

### 10. Jobs Not Displaying

#### Issue: Job list is empty

**Solutions:**

1. **Seed sample data:**
```bash
cd Backend
npm run seed
```

2. **Post a job manually:**
   - Login as employer
   - Click "Post Job"
   - Fill details and submit

3. **Check database:**
```bash
mongosh
use rural_employment
db.jobs.find()
```

---

### 11. File Upload Issues

#### Issue: Cannot upload documents

**Solution:**

1. **Check uploads folder exists:**
```bash
cd Backend
ls -la uploads/
```

2. **Create if missing:**
```bash
mkdir uploads
chmod 755 uploads
```

3. **Verify multer configuration** in controllers

---

### 12. Payment System Issues

#### Issue: Payment not processing

**Debugging:**

1. **Check payment model** - Ensure fields are correct

2. **Verify application accepted** - Payment only for accepted applications

3. **Check employer balance** - In production, integrate payment gateway

4. **Review backend logs** - Look for payment errors

---

### 13. Environment Variables Not Loading

#### Issue: process.env returns undefined

**Solutions:**

1. **Check .env file location:**
   - Backend: `Backend/.env`
   - Frontend: `Frontend/.env`

2. **Restart servers** after changing .env

3. **Verify dotenv is loaded:**
```javascript
// In server.js
require('dotenv').config();
console.log('Checking env:', process.env.PORT);
```

4. **Frontend env variables must start with REACT_APP_**

---

### 14. Database Data Issues

#### Issue: Data not saving or incorrect data

**Solutions:**

1. **Check MongoDB connection**

2. **Verify model schemas** match data structure

3. **Clear and reseed database:**
```bash
mongosh
use rural_employment
db.dropDatabase()
# Then run seed script
```

---

### 15. Performance Issues

#### Issue: Slow loading or high response times

**Solutions:**

1. **Add database indexes:**
```javascript
// In models
schema.index({ field: 1 });
```

2. **Optimize queries:**
```javascript
// Use select to limit fields
.select('name email')

// Use lean for read-only
.lean()
```

3. **Enable compression:**
```javascript
// In server.js
const compression = require('compression');
app.use(compression());
```

---

## Debugging Tips

### Enable Debug Logging

**Backend:**
```javascript
// In server.js
console.log('Request:', req.method, req.path);
console.log('Body:', req.body);
```

**Frontend:**
```javascript
// In components
console.log('State:', state);
console.log('Response:', response.data);
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check failed requests
5. Click on request to see details

### MongoDB Debugging

```bash
# Connect to MongoDB
mongosh

# Switch to database
use rural_employment

# Check collections
show collections

# View data
db.users.find()
db.jobs.find()
db.applications.find()

# Count documents
db.users.countDocuments()
```

### API Testing

Use Postman or curl to test endpoints:

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com",...}'

# Test with authentication
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Getting Help

If none of these solutions work:

1. **Check the error message carefully**
2. **Search the error online**
3. **Check documentation**
4. **Review code in the relevant files**
5. **Ask for help with:**
   - Exact error message
   - Steps to reproduce
   - Browser/Node version
   - Operating system

---

## Prevention Tips

1. ✅ Always commit working code to git
2. ✅ Keep dependencies updated
3. ✅ Use .gitignore for node_modules and .env
4. ✅ Test changes before deploying
5. ✅ Keep MongoDB backed up
6. ✅ Use environment variables for config
7. ✅ Log errors properly
8. ✅ Handle errors gracefully in code

---

## Emergency Reset

If everything breaks, start fresh:

```bash
# Backend
cd Backend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Frontend
cd Frontend
rm -rf node_modules package-lock.json build
npm install
npm start

# Database
mongosh
use rural_employment
db.dropDatabase()
# Run seed script again
```

---

**Remember:** Most issues are simple configuration or connection problems. Take it step by step! 🚀
