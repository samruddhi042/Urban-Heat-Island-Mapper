# 🚀 Complete Run Guide - UHI Maharashtra Ensemble Platform

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm/yarn installed
- Google Maps API key (optional, for map features)
- Gemini API key (optional, for AI advisor)

## 📦 Step 1: Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Set Up Environment Variables (Optional)

Create a `.env` file in the `backend/` directory:

```bash
# For Windows PowerShell
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# For Linux/Mac
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
```

**Note:** The backend works without Gemini API key, but AI advisor will use fallback responses.

### 1.3 Verify Models Are Present

Check that your `.joblib` model files are in `backend/models/`:

```bash
# Should show files like:
# cluster_pune_metropolitan__UHI_Intensity_C.joblib
# cluster_pune_metropolitan__Health_Risk_Index.joblib
# etc.
ls backend/models/*.joblib
```

### 1.4 Start the Backend Server

```bash
cd backend
uvicorn main:app --reload
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Successfully loaded X cluster-specific model(s)
```

**✅ Backend is running when you see:**
- Server running on `http://127.0.0.1:8000`
- Models loaded successfully (check the log message)

### 1.5 Verify Backend (Optional)

Open in browser: http://127.0.0.1:8000/docs

You should see the Swagger API documentation.

Test endpoint:
```bash
curl http://127.0.0.1:8000/
```

Should return: `{"status":"ok","message":"UHI Maharashtra Ensemble Platform API","version":"1.0.0"}`

---

## 🎨 Step 2: Frontend Setup

### 2.1 Install Frontend Dependencies

Open a **new terminal** (keep backend running):

```bash
# Make sure you're in the project root
npm install
# or
yarn install
```

### 2.2 Set Up Environment Variables (Optional)

Create a `.env` file in the project root:

```bash
# For Google Maps (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2.3 Start the Frontend Development Server

```bash
npm run dev
# or
yarn dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**✅ Frontend is running when you see:**
- Server running on `http://localhost:5173` (or port 3000)

---

## 🎯 Step 3: Access the Application

1. **Open your browser** and go to: http://localhost:5173
2. You should see the **Home page** of the UHI Maharashtra Ensemble Platform

---

## ✅ Verification Checklist

### Backend Verification

- [ ] Backend server running on port 8000
- [ ] Models loaded (check terminal logs - should show "Successfully loaded X model(s)")
- [ ] API docs accessible at http://127.0.0.1:8000/docs
- [ ] Health check works: http://127.0.0.1:8000/

### Frontend Verification

- [ ] Frontend server running (usually port 5173)
- [ ] Home page loads successfully
- [ ] No console errors in browser

### Integration Verification

- [ ] **Predict Page** (`/predict`): Can make predictions
- [ ] **Simulator Page** (`/simulator`): Can run simulations
- [ ] **Map Explorer** (`/map`): Shows clusters (may use fallback if API fails)
- [ ] **Dashboard** (`/dashboard`): Shows metrics
- [ ] **Recommendations** (`/recommendations`): Shows strategies
- [ ] **AI Advisor** (`/ai-advisor`): Can chat (uses fallback if Gemini not configured)

---

## 🔧 Troubleshooting

### Issue: "Loaded zero models"

**Solution:**
1. Check that `.joblib` files exist in `backend/models/`
2. Verify file names match pattern: `cluster_<name>__<type>.joblib`
3. Check backend terminal logs for specific error messages
4. The backend will use fallback calculations if models aren't found

### Issue: Backend won't start

**Solutions:**
```bash
# Check if port 8000 is in use
# Windows:
netstat -ano | findstr :8000

# Kill process if needed, or use different port:
uvicorn main:app --reload --port 8001
```

### Issue: Frontend can't connect to backend

**Solutions:**
1. Verify backend is running on `http://127.0.0.1:8000`
2. Check browser console for CORS errors
3. Verify `API_BASE` in frontend files points to `http://127.0.0.1:8000`
4. Check backend CORS settings in `backend/main.py`

### Issue: Models not loading

**Check:**
1. File names must match: `cluster_<name>__UHI_Intensity_C.joblib` or `cluster_<name>__Health_Risk_Index.joblib`
2. Files must be in `backend/models/` directory
3. Check file permissions
4. Backend will log specific errors - check terminal output

### Issue: CORS errors

**Solution:** Backend already configured for CORS. If issues persist:
1. Check `backend/main.py` - CORS middleware should allow all origins
2. Verify frontend URL matches what's allowed

---

## 📝 Quick Commands Reference

### Backend
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Install dependencies
pip install -r requirements.txt

# Check models
ls models/*.joblib
```

### Frontend
```bash
# Start frontend
npm run dev

# Install dependencies
npm install

# Build for production
npm run build
```

---

## 🎯 Expected Behavior

### When Everything Works:

1. **Backend Terminal Shows:**
   ```
   INFO: Successfully loaded 14 cluster-specific model(s)
   INFO: Application startup complete.
   INFO: Uvicorn running on http://127.0.0.1:8000
   ```

2. **Frontend Terminal Shows:**
   ```
   VITE ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

3. **Browser:**
   - Home page loads
   - All navigation works
   - Predict page can make predictions
   - Simulator works
   - Map shows clusters
   - Dashboard shows metrics
   - Recommendations load
   - AI Advisor works (with or without Gemini API)

---

## 🆘 Still Having Issues?

1. **Check both terminal windows** - backend and frontend should both be running
2. **Check browser console** (F12) for errors
3. **Check backend terminal** for model loading messages
4. **Verify ports:**
   - Backend: `http://127.0.0.1:8000`
   - Frontend: `http://localhost:5173` (or 3000)

---

## 📚 Additional Resources

- Backend API Docs: http://127.0.0.1:8000/docs
- Backend README: `backend/README.md`
- Quick Start: `backend/QUICKSTART.md`

---

**🎉 You're all set! The application should now be fully functional.**


