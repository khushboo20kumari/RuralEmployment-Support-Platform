# 🚀 Razorpay Setup - Quick Start Guide

## Step 1: Razorpay Account बनाएं

1. Visit: https://dashboard.razorpay.com/signup
2. Sign up with email
3. **Test Mode** में switch करें (top-left corner)

## Step 2: API Keys Copy करें

1. Dashboard में जाएं
2. Settings → API Keys → "Generate Test Key"
3. Copy करें:
   - **Key ID**: `rzp_test_xxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxx`

## Step 3: Backend में Keys Add करें

File: `Backend/.env`
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
```

## Step 4: Frontend में Key ID Add करें

File: `Frontend/.env`
```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

## Step 5: Servers Restart करें

```bash
# Backend (Terminal 1)
cd Backend
node server.js

# Frontend (Terminal 2)  
cd Frontend
npm start
```

## Step 6: Test Payment करें! 🎉

1. Login as Employer: `priya@employer.com` / `password123`
2. Go to **Payments** page
3. Enter amount → Click "एडवांस भुगतान करें"
4. Razorpay modal खुलेगा
5. Test Payment:
   - **UPI**: `success@razorpay` (any 6-digit PIN)
   - **Card**: `4111 1111 1111 1111` (any CVV/expiry)

✅ **Done! Payment integration complete!**

---

## 💳 Test Credentials

**Test UPI IDs:**
- Success: `success@razorpay`
- Failure: `failure@razorpay`

**Test Cards:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

**CVV**: Any 3 digits  
**Expiry**: Any future date  
**UPI PIN**: Any 4 or 6 digits

---

## 🔄 Complete Payment Flow

1. **Employer**: Advance payment → Razorpay → Platform
2. **Platform**: 5% fee deduct → Store in database
3. **Worker**: Job complete mark करता है
4. **Employer**: Release final payment button click
5. **Platform**: Worker को transfer

---

**Full Documentation**: `RAZORPAY_INTEGRATION.md`
