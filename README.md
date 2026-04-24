# 🌡️ UHI Maharashtra - AI for Cooler Cities

**Advanced Urban Heat Island Monitoring & AI-Powered Climate Analytics Platform**

An intelligent platform for analyzing and mitigating Urban Heat Island (UHI) effects across Maharashtra using machine learning predictions, real-time geospatial analysis, and Gemini AI-powered recommendations.

---

## 📊 Project Overview

The UHI Maharashtra platform combines geospatial data analysis, machine learning, and AI to:
- **Predict** UHI intensity and health risk indices for specific locations
- **Visualize** heat patterns across Maharashtra clusters using interactive maps
- **Simulate** environmental impact scenarios
- **Recommend** data-driven mitigation strategies via AI advisor
- **Monitor** real-time climate data and health implications

---

## 🏗️ Tech Stack

### Frontend
- **React** 18+ with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive design
- **shadcn/ui** for accessible UI components
- **React Query** for state management
- **Google Maps API** for geospatial visualization
- **Supabase** for real-time data

### Backend
- **FastAPI** (Python) for REST API
- **Machine Learning**: scikit-learn, pandas, numpy
- **Gemini AI** for intelligent recommendations
- **Uvicorn** ASGI server

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.8+
- Git

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd mahar-heat-insight

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your Gemini API key

# Run server
uvicorn main:app --reload
```

Backend runs at: **http://127.0.0.1:8000**

---

## 📚 Documentation

- [Frontend Setup](./README.md)
- [Backend API Docs](./backend/README.md)
- [Run Guide](./RUN_GUIDE.md)
- [API Documentation](http://127.0.0.1:8000/docs) (after running backend)

---

## 📡 API Endpoints

### Core Features
- `POST /predict/single` - Single location prediction
- `POST /predict/batch` - Batch CSV predictions
- `POST /simulate` - Environmental impact simulation
- `GET /map/clusters` - Cluster data visualization
- `POST /ai-advisor/chat` - Gemini AI recommendations

For complete API documentation, see [Backend README](./backend/README.md)

---

## 🎯 Project Structure

```
.
├── src/                    # React frontend
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities
├── backend/               # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── models/            # ML model files
│   ├── schemas/           # Data validation
│   └── utils/             # Helper functions
├── public/                # Static assets
└── supabase/              # Database config
```

---

## 🔐 Environment Variables

### Frontend (`.env`)
```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
VITE_SUPABASE_PROJECT_ID=your_id_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_key_here
VITE_SUPABASE_URL=your_url_here
```

### Backend (`backend/.env`)
```
GEMINI_API_KEY=your_key_here
```

See `.env.example` files for templates.

---

## 🚢 Deployment

### Frontend
```bash
npm run build

### Backend
Deploy to any Python ASGI host (Heroku, Railway, AWS Lambda, etc.)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows the project style guidelines
- No personal information in commits
- Environment variables are not exposed
- Tests pass before submitting PR

---

## 📧 Support

For issues, questions, or suggestions, please open a GitHub issue.

---

**Built with ❤️ for Climate Action**
