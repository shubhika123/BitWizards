# Myntra HackerRamp

An AI-powered, hyper-local discovery and trust layer that re-imagines Myntra for Tier-2 and Tier-3 (T2/T3) India.

---

## 🎯 The Bharat Opportunity

**"The next Myntra customer does not live in a metro."**

While e-commerce search defaults to generic keyword catalogs, shoppers in non-metro India are driven by regional micro-seasons, weather variations, local language dialects, community trust, and festival calendars. The **Myntra Bharat Layer** makes the platform culturally aware, context-personalized, and locally connected.

### 🌟 Core Capabilities
1. **AI Bharat Feed**: A location-aware dynamic homepage adapting to weather, local trends, budget, and local festivals (e.g. Teej, Onam, Chhath Puja).
2. **AI Natural Language Shopping**: Search in local phrasing and dialects (e.g., *"Cotton office wear for Chennai weather under ₹1500"*, *"Wedding outfit for Jaipur in August"*).
3. **Local Bazaar**: A bridge connecting verified local boutiques and tailors to consumers. Supports a mock **"Request Best Price"** negotiation feature.
4. **Outfit Circle**: A cooperative social canvas where communities can share styles, vote, comment, and collaborate.
5. **Explainable AI Recommendation Badges**: Transparency tags (e.g., *"Trending in Lucknow"*, *"Suitable for current monsoon climate"*) to build instant consumer trust.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI (Python)
- **AI Engine**: Gemini 2.5 Flash API
- **Data & Vector Search**: Supabase / FAISS / Local Vector Index

---

## 🚀 Getting Started

### 1. Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` variables (refer to `.env.example`).
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
