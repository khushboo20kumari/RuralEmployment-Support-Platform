# Quick Reference Card: Bilingual & Job Completion Features

## 🎯 Feature #1: Bilingual Support (Hindi & English)

### For Users:
```
Location: Navbar (top right)
Button: 🌐 with text "English" or "हिंदी"
Click: Switches language instantly
Saved: Preference persists
```

### For Developers:
```javascript
// Step 1: Import hook
import { useLanguage } from '../hooks/useLanguage';

// Step 2: Use in component
const { t, language, toggleLanguage } = useLanguage();

// Step 3: Display translations
<h1>{t('home.title')}</h1>
<button>{t('common.save')}</button>

// Step 4: Add new translation to translations.js
en: { mySection: { key: 'English text' } }
hi: { mySection: { key: 'हिंदी टेक्स्ट' } }
```

### Translation Keys (Sample):
```
navbar.home       → Home / घर
navbar.jobs       → Browse Jobs / काम देखें
home.title        → Direct Jobs for Rural Workers / ग्रामीण रोजगार मंच
common.save       → Save / सहेजें
common.loading    → Loading... / लोड हो रहा है...
```

---

## 🎯 Feature #2: Job Completion

### For Workers:
```
Location: Worker Dashboard → Accepted Tab
Button: "✅ काम पूरा किया"
Flow:
  1. Click button
  2. Confirm dialog appears
  3. Button shows "⏳ प्रोसेस हो रहा है..."
  4. Success! Job moves to "✅ पूरा" tab
  5. Employer gets notification to release final payment
```

### For Developers:
```javascript
// Button already added to WorkerDashboard
// Handler function already implemented
// API method already exists

// To test:
1. Login as worker
2. Go to Worker Dashboard
3. Find accepted job
4. Click "काम पूरा किया" button
5. Confirm dialog
6. See success message
7. Check job in completed tab

// If adding to another component:
import { applicationAPI } from '../services/api';

const handleMarkComplete = async (id) => {
  try {
    await applicationAPI.markAsCompleted(id);
    toast.success('काम पूरा किया गया!');
    refreshData();
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### API Endpoint:
```
PUT /api/applications/:applicationId/complete
Header: Authorization: Bearer {token}
Success Response: { message: 'काम सफलतापूर्वक पूरा किया गया।' }
```

---

## 📚 Translation Dictionary Quick Lookup

### Navigation (navbar.*)
```
home, jobs, applications, dashboard, profile, 
payments, admin, login, logout, register, language
```

### Homepage (home.*)
```
title, subtitle, hero1, heroDesc1, hero2, heroDesc2,
hero3, heroDesc3, problems, problem1/2/3, 
problem1Desc/2Desc/3Desc, browseJobs, registerNow
```

### Worker Dashboard (workerDashboard.*)
```
title, welcome, activeApplications, acceptedApplications,
completedJobs, buildTrust, totalEarnings, fullPayment,
browseJobs, myApplications, viewPayments, editProfile,
yourApplications, pending, accepted, completed, markCompleted,
markCompletedConfirm, completedSuccess, completedError, processing
```

### Common (common.*)
```
loading, error, success, warning, cancel, save, delete, 
edit, view, apply, submit, back, next, close, pleaseWait,
noData, errorOccurred, tryAgain
```

---

## 🔧 Common Tasks

### Add New Translation:
```javascript
// File: Frontend/src/services/translations.js

// Find the section or create new one
export const translations = {
  en: {
    mySection: {
      newKey: 'English text here'
    }
  },
  hi: {
    mySection: {
      newKey: 'हिंदी टेक्स्ट यहाँ'
    }
  }
}

// Use in component
const { t } = useLanguage();
<p>{t('mySection.newKey')}</p>
```

### Use Conditional Language:
```javascript
const { language, t } = useLanguage();

if (language === 'en') {
  // English-specific logic
} else {
  // Hindi-specific logic
}
```

### Migrate Hardcoded Component to Bilingual:
```javascript
// Before
<h1>काम की सूची</h1>

// After
import { useLanguage } from '../hooks/useLanguage';

const MyComponent = () => {
  const { t } = useLanguage();
  return <h1>{t('jobList.title')}</h1>;
};
```

---

## 🧪 Testing Checklist

### Bilingual:
- [ ] 🌐 button visible in navbar
- [ ] Click switches Hindi ↔ English
- [ ] All visible text changes
- [ ] Refresh page → language persists
- [ ] Mobile view → button works
- [ ] No console errors

### Job Completion:
- [ ] "काम पूरा किया" visible on accepted jobs
- [ ] Click shows confirmation dialog
- [ ] Dialog text is in Hindi
- [ ] Confirm → loading state shows
- [ ] Success toast appears (Hindi)
- [ ] Job moves to completed tab
- [ ] Can't find job in accepted tab anymore
- [ ] Stats update (completed jobs count increases)

---

## ⚡ Performance Tips

### Don't:
❌ Store language in component state
❌ Hardcode text (always use t())
❌ Create new translation objects in components
❌ Import translations directly (use hook instead)

### Do:
✅ Use useLanguage() hook
✅ Add translations to translations.js once
✅ Reuse translation keys across components
✅ Put language in localStorage (automatic)
✅ Let context handle updates

---

## 🐛 Troubleshooting

### Language not switching?
```
1. Check console for errors
2. Verify component uses useLanguage()
3. Ensure App.js has LanguageProvider
4. Check if inside LanguageProvider (all routes wrapped)
```

### Translation missing?
```
1. Check key path: t('section.key')
2. Look in translations.js for that key
3. If missing, add both en and hi versions
4. Verify spelling matches
```

### Job completion not working?
```
1. Check backend is running
2. Test API manually: curl /api/applications/{id}/complete
3. Check browser network tab
4. Verify JWT token is valid
5. Check worker ownership of application
```

### Loading state stuck?
```
1. Check API is responding
2. Check error in console
3. Try refreshing page
4. Check localStorage.clear() if persisted error
```

---

## 📱 Mobile Testing

```
View: Responsive design
Orientation: Works in landscape & portrait
Touch: Buttons are 48px+ tall
Text: Readable without zoom
Language: Toggle works on mobile
Completion: Button accessible on small screens
Toast: Appears without blocking UI
```

---

## 🎨 UI Reference

### Language Button:
```
Location: Navbar, after jobs link
Style: outline-info variant
Size: sm
Text: "🌐 English" or "🌐 हिंदी"
On Click: Toggles language instantly
```

### Job Completion Button:
```
Location: WorkerDashboard, accepted applications tab
Style: outline-success variant
Size: sm
Text: "✅ काम पूरा किया"
On Hover: Slight highlight
On Click: Shows confirmation
Loading: Text changes to "⏳ प्रोसेस हो रहा है..."
Disabled: true during loading (prevents double-click)
```

### Success Toast:
```
Message: "काम पूरा किया गया! मालिक को अंतिम भुगतान जारी करने की प्रतीक्षा करें।"
Type: success (green)
Duration: 3 seconds
Position: top-right
Auto-close: yes
```

---

## 📊 Files at a Glance

| File | Size | Type | Purpose |
|------|------|------|---------|
| LanguageContext.js | 25 lines | New | Language state |
| useLanguage.js | 18 lines | New | Hook for translations |
| translations.js | 537 lines | New | 200+ keys |
| App.js | +3 lines | Mod | Add provider |
| Navbar.js | +15 lines | Mod | Add toggle button |
| WorkerDashboard.js | +40 lines | Mod | Add completion handler |

---

## 🚀 Deployment Command

```bash
# Build for production
cd Frontend
npm run build

# Output: Frontend/build folder ready to deploy

# Test build locally
npm install -g serve
serve -s build
# Opens http://localhost:3000

# Deploy
# Copy Frontend/build folder to your server
# Restart backend if needed
```

---

## 💬 Translation Guidelines

### For Hindi Translations:
- Use simple, everyday language
- Avoid complex grammar
- Use present tense when possible
- Keep sentences short (5-10 words)
- Use emojis for clarity
- Example: "काम पूरा किया" instead of "कार्य को समाप्त किया जाना"

### For English Translations:
- Use active voice
- Keep professional but friendly
- Use "you" where applicable
- Short sentences
- Example: "Mark job complete" instead of "Indicate job completion"

---

## ✅ Done! You Have:

✅ Bilingual support (Hindi & English)
✅ 200+ translation keys ready
✅ Language toggle button
✅ Job completion feature
✅ Complete payment workflow
✅ Full documentation
✅ Production-ready code
✅ This quick reference

**Status**: Ready to deploy 🎉

