# 🏥 Smart AI-Based Healthcare System

Welcome to the **Smart AI-Based Healthcare System**! This is a modern web application designed to help doctors manage patients and help patients check their symptoms using advanced Artificial Intelligence.

---

## 🚀 Key Features

### 1. 🤖 AI Symptom Checker (The "Brain")
-   **What it does:** You describe your symptoms (e.g., "I have a headache and fever"), and the AI acts like a doctor.
-   **How it works:** It uses **Google Gemini 2.0 Flash** (a super-smart AI) to analyze your text.
-   **Smart & Safe:**
    -   It gives a diagnosis, severity level, and suggests which specialist to see.
    -   It acts responsibly: If the AI is "busy" (rate limited), it politely asks you to wait instead of crashing.
    -   It recommends *safe* over-the-counter medicines for temporary relief.

### 2. 📝 Digital Prescription Pad
-   **For Doctors:** A dedicated dashboard to write prescriptions.
-   **No Appointment Needed:** Doctors can now save a prescription for *anyone* instantly.
-   **Saved Securely:** All prescriptions are saved directly to the database so they are never lost.

### 3. 🛡️ Security & Privacy (HIPAA Ready)
-   **Private Data:** Doctors can only see their own patients. Patients can only see their own data.
-   **Audit Logs:** The system secretly tracks *everything*. If someone adds a report or writes a prescription, it is logged in a secure "Audit Trail" so admins know exactly who did what.

### 4. 🎨 Modern Design
-   **Beautiful UI:** Glass-like cards, smooth animations, and a professional medical color scheme (Teal & Indigo).
-   **Mobile Friendly:** Works great on phones and computers.

### 5. 👑 Admin Dashboard & Role Management
-   **Comprehensive Oversight:** Admins can view and manage all registered Doctors and Patients.
-   **Strict Role Separation:** Users are assigned specific roles (Patient, Doctor, Admin) with tailored access privileges.
-   **Professional Profiles:** Doctors can create detailed profiles with specializations, experience, and bios.

### 6. ⚡ Real-Time Data Sync
-   **Instant Updates:** Powered by **Supabase Realtime**, the Admin Dashboard updates instantly when new users register or update their profiles—no page refresh required.
-   **Live Monitoring:** Watch the platform grow in real-time.

---

## 🛠️ How to Run the Project

This project has two parts: the **Frontend** (what you see) and the **Backend** (the AI brain). You need to run **BOTH** for everything to work.

### Step 1: Start the Frontend (The Website)
1.  Open a terminal in the `client` folder.
2.  Run this command:
    ```bash
    npm run dev
    ```
3.  Click the link (usually `http://localhost:5173`) to open the app.

### Step 2: Start the Backend (The AI Server)
1.  Open a **new** terminal (keep the first one running!).
2.  Go to the `server` folder:
    ```bash
    cd server
    ```
3.  Run the server:
    ```bash
    python main.py
    ```
4.  You will see: `INFO: AI Server running in REAL INTELLIGENCE mode`.

---

## 📂 Project Structure (Where is everything?)

-   **`client/` (The Frontend)**
    -   `src/pages/`: All the screens (Home, Dashboard, Symptom Checker).
    -   `src/pages/admin/`: Admin-specific dashboards for managing users.
    -   `src/components/`: Reusable parts like Buttons, Cards, and the Navbar.
    -   `src/lib/`: Helpers for database connection (Supabase).

-   **`server/` (The Backend)**
    -   `main.py`: The entry point for the Python server.
    -   `ai_model.py`: The brain code that talks to Google Gemini.
    -   `.env`: Where your secret API Key acts.

-   **`database/`**
    -   SQL scripts used to set up the database tables and security rules.

---

## 💡 Troubleshooting

-   **"System Busy" Message?**
    -   The AI performs very complex thinking. If you ask too many questions too fast, it might say "System Busy". Just wait **60 seconds** and try again. It's protecting itself from overload!

-   **"Connection Refused"?**
    -   Make sure the Python server (Step 2) is actually running!

---

*Built with ❤️ using React, Python, Supabase, and Google Gemini.*
