# Quick Setup Guide

## Step 1: Install MongoDB
Make sure MongoDB is installed and running on your system.

**Check if MongoDB is running:**
```bash
mongosh
```

If not installed, install MongoDB:
- **Ubuntu/Debian:** `sudo apt install mongodb`
- **macOS:** `brew install mongodb-community`
- **Windows:** Download from mongodb.com

## Step 2: Setup Backend

```bash
# Navigate to Backend folder
cd Backend

# Install dependencies
npm install

# Start the server (development mode)
npm run dev

# Backend will run on http://localhost:5000
```

## Step 3: Setup Frontend

Open a **new terminal** window:

```bash
# Navigate to Frontend folder
cd Frontend

# Install dependencies
npm install

# Start the React app
npm start

# Frontend will open at http://localhost:3000
```

## Step 4: Test the Application

1. **Open browser:** http://localhost:3000
2. **Register as Worker:**
   - Click "Register"
   - Select "Worker" as user type
   - Fill in details and submit
3. **Register as Employer:** (in another browser/incognito)
   - Click "Register"
   - Select "Employer" as user type
   - Fill in details and submit
4. **Post a Job** (as Employer):
   - Go to "Post Job"
   - Fill job details
   - Submit
5. **Apply for Job** (as Worker):
   - Browse jobs
   - Click on a job
   - Click "Apply Now"
6. **Manage Applications** (as Employer):
   - View applications on your posted jobs

## Default Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rural_employment
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Issues

### Issue: MongoDB connection error
**Solution:** Make sure MongoDB is running
```bash
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

### Issue: Port already in use
**Solution:** Change port in Backend/.env
```
PORT=5001
```

### Issue: CORS error
**Solution:** Backend already has CORS enabled. Make sure both servers are running.

## Testing API Endpoints

You can test API endpoints using:
- **Postman:** Import endpoints from README
- **Thunder Client:** VS Code extension
- **curl:** Command line

Example API call:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Worker",
    "email": "worker@test.com",
    "phone": "1234567890",
    "password": "password123",
    "confirmPassword": "password123",
    "userType": "worker",
    "village": "Test Village",
    "district": "Test District",
    "state": "Test State"
  }'
```

## Project Structure

```
RuralEmployment-Support-Platform/
├── Backend/
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # File uploads
│   ├── server.js        # Entry point
│   ├── package.json
│   └── .env
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API calls
│   │   ├── styles/      # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
└── README.md

```

## Next Steps

1. ✅ Setup and run the application
2. ✅ Test worker and employer flows
3. ✅ Customize the platform for your needs
4. 🔧 Add payment gateway integration
5. 🔧 Deploy to production server
6. 🔧 Configure domain and SSL
7. 🔧 Add monitoring and analytics

## Support

If you encounter any issues:
1. Check if both backend and frontend are running
2. Verify MongoDB connection
3. Check console for error messages
4. Review API endpoint responses

Happy Coding! 🚀
