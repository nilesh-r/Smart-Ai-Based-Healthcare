# 🏥 Smart AI-Based Healthcare System

A modern, intelligent healthcare platform connecting patients, doctors, and administrators. This application leverages **Google Gemini 2.0 Flash** for AI-powered symptom checking and **Supabase** for real-time data management.

![Project Banner](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3)

---

## 🚀 Key Features

### 🤖 AI Symptom Checker ("The Brain")
-   **Analyze Symptoms:** Patients can describe their symptoms in plain English.
-   **Powered by Gemini 2.0:** Uses advanced LLMs to provide preliminary diagnoses, severity assessments, and specialist recommendations.
-   **Safety First:** Recognizes emergencies and advises immediate care when necessary.

### 🩺 Doctor Dashboard & Utilities
-   **Patient Management:** View and manage patient records.
-   **Digital Prescription Pad:** Instantly generate and save prescriptions.
-   **Medical Reports:** Upload and review patient medical history.
-   **Real-time Messaging:** Communicate with patients directly (in development).

### 👑 Admin & Role Management
-   **Role-Based Access:** Distinct portals for **Admins**, **Doctors**, and **Patients**.
-   **User Oversight:** Admins can manage all user accounts and view system-wide statistics.
-   **Audit Trails:** Secure logging of all critical actions for HIPAA compliance readiness.

### ⚡ Technical Highlights
-   **Real-Time Sync:** powered by Supabase Realtime for instant dashboard updates.
-   **Modern UI/UX:** Built with React, Tailwind CSS, and Framer Motion for a glassmorphism-inspired, responsive design.
-   **Secure Authentication:** Row Level Security (RLS) ensures data privacy.

---

## 🛠️ Tech Stack

### Frontend (Client)
-   **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
-   **Icons & UI:** [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
-   **Charts:** [Recharts](https://recharts.org/)
-   **State/Data:** [Supabase Client](https://supabase.com/docs/reference/javascript/introduction)

### Backend (Server)
-   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
-   **AI Model:** Google Gemini 2.0 Flash (via `google-genai` SDK)
-   **Server:** Uvicorn

### Database
-   **Platform:** [Supabase](https://supabase.com/) (PostgreSQL)
-   **Features:** Auth, Database, Realtime, Storage

---

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+)
-   Python (v3.9+)
-   Supabase Account & Project
-   Google AI Studio API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Smart-Ai-Based-Healthcare
```

### 2. Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd client
npm install
```
Create a `.env.local` file in `client/` with your Supabase keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Run the development server:
```bash
npm run dev
```
*Access the frontend at `http://localhost:5173`*

### 3. Backend Setup
Open a new terminal, navigate to the server directory, and install dependencies:
```bash
cd server
pip install -r requirements.txt
```
Create a `.env` file in `server/` with your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key
```
Start the FastAPI server:
```bash
python main.py
```
*The API will run at `http://localhost:8000`*

---

## 📂 Project Structure

```
Smart-Ai-Based-Healthcare/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/          # Application routes (Dashboards, Login, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Supabase configuration
│   │   └── ...
│   ├── package.json
│   └── ...
├── server/                 # FastAPI Backend
│   ├── main.py             # Server entry point
│   ├── ai_model.py         # Gemini AI integration logic
│   ├── requirements.txt
│   └── ...
├── database/               # SQL Migrations & Schemas
└── README.md
```

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.

---

*Built with ❤️ for the future of healthcare.*
