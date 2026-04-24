# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Set Up Environment (Optional - for Gemini AI)

Create a `.env` file:

```bash
# Copy the example (if .env.example exists)
# Or create manually:
echo "GEMINI_API_KEY=your_key_here" > .env
```

**Note:** The API works without Gemini API key, but AI advisor will use fallback responses.

### Step 3: Run the Server

```bash
uvicorn main:app --reload
```

The API will be available at: **http://127.0.0.1:8000**

## ✅ Verify Installation

1. Open http://127.0.0.1:8000/docs in your browser
2. You should see the Swagger API documentation
3. Try the health check: http://127.0.0.1:8000/

## 📝 Test an Endpoint

```bash
# Test single prediction
curl -X POST http://127.0.0.1:8000/predict/single \
  -H "Content-Type: application/json" \
  -d '{
    "cluster": "cluster_pune_metropolitan",
    "features": {
      "latitude": 18.52,
      "longitude": 73.85,
      "month": 6
    }
  }'
```

## 🔗 Connect Frontend

Your frontend is already configured to use `http://127.0.0.1:8000`. Just make sure:

1. Backend is running on port 8000
2. Frontend is running (usually on port 5173 or 3000)
3. CORS is enabled (already configured in `main.py`)

## 🎯 Available Endpoints

- `POST /predict/single` - Single location prediction
- `POST /predict/batch` - Batch CSV prediction
- `POST /simulate` - UHI simulation
- `GET /map/clusters` - Get all clusters
- `GET /map/zone/{name}` - Get zone details
- `POST /ai-advisor/chat` - AI chat (requires Gemini API key)
- `GET /dashboard/metrics` - Model metrics
- `GET /recommendations/strategies` - Recommendations

See full documentation at http://127.0.0.1:8000/docs


