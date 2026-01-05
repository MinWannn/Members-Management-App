# Membership Management System

A comprehensive full-stack application for managing organization members, subscriptions, and payments. This system replaces legacy WordPress plugins with a modern, scalable, and secure solution built with the MERN stack (PostgreSQL variant).

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## 🚀 Key Features

### 👥 Member Management
- **Registration Workflow**: Secure user registration with detailed profiles (First Name, Last Name, Father's Name, ID Number).
- **Approval System**: SuperAdmin approval required for new accounts to ensure security.
- **Role-Based Access**: Distinct roles for **SuperAdmin** (full control) and **Users** (personal profile access).

### 📅 Subscription Tracking
- **Flexible Plans**: Support for various subscription durations (1, 3, 6, 9, 12 months).
- **Automated Management**: 
  - Auto-conversion of expired subscriptions to "Supporter" status.
  - Automated email reminders 10 days before expiration.
- **History**: Complete history of all subscription changes.

### 💰 Financial Overview
- **Payment Tracking**: Record and view all payments.
- **Revenue Analytics**: Real-time dashboard for tracking income.
- **Bank Integration**: Display organization bank details for transfers.

### 📊 Dashboard & Reporting
- **Real-time Stats**: Live counters for total members, active subscriptions, and revenue.
- **Visual Analytics**: Interactive charts for member growth and subscription distribution.
- **PDF Exports**: Generate professional PDF reports for user history.

## 🛠️ Tech Stack

- **Frontend**: 
  - React 18
  - Vite
  - Material-UI (MUI)
  - Recharts
  - Axios

- **Backend**: 
  - Node.js
  - Express
  - PostgreSQL (Neon.tech)
  - PDFKit
  - Nodemailer

- **DevOps**:
  - Netlify (Frontend Hosting)
  - Render (Backend Hosting)
  - GitHub Actions (CI/CD)

## 📂 Project Structure

```bash
sepam-members-app/
├── backend/                 # Node.js API
│   ├── migrations/         # SQL Schema migrations
│   ├── src/
│   │   ├── config/        # Database & App config
│   │   ├── controllers/   # Business logic
│   │   ├── jobs/          # Cron jobs (reminders, auto-conversion)
│   │   ├── middleware/    # Auth & Error handling
│   │   ├── models/        # Database queries
│   │   ├── routes/        # API Endpoints
│   │   └── services/      # Email, PDF, Stripe services
│   └── server.js          # Entry point
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth state management
│   │   ├── pages/         # Page views
│   │   └── services/      # API integration
│   └── netlify.toml       # Deployment config
└── shared/                  # Shared constants/types
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Neon.tech)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/sepam-members-app.git
    cd sepam-members-app
    ```

2.  **Install Dependencies**
    ```bash
    # Install root dependencies
    npm install

    # Install Backend dependencies
    cd backend && npm install

    # Install Frontend dependencies
    cd ../frontend && npm install
    ```

3.  **Environment Setup**

    Create a `.env` file in `backend/`:
    ```env
    PORT=5000
    DATABASE_URL=postgres://user:pass@host:5432/db_name
    JWT_SECRET=your_super_secret_key
    FRONTEND_URL=http://localhost:5173
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    ```

    Create a `.env` file in `frontend/`:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

4.  **Database Setup**
    Run the migration script to create tables:
    ```bash
    cd backend
    npm run migrate
    ```
    *(Optional) Seed demo data:*
    ```bash
    npm run seed
    ```

5.  **Run Locally**
    From the root directory:
    ```bash
    npm run dev
    ```
    This will start both backend (port 5000) and frontend (port 5173) concurrently.

## 🌐 Deployment

### 1. Database (Neon.tech)
- Create a project on Neon.tech.
- Get the connection string.
- Run the `backend/migrations/001_initial_schema.sql` script.

### 2. Backend (Render)
- Create a Web Service connected to the `backend` directory.
- Build Command: `npm install`
- Start Command: `npm start`
- Add Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.).

### 3. Frontend (Netlify)
- Create a new site from Git connected to the `frontend` directory.
- Build Command: `npm run build`
- Publish Directory: `dist`
- Add Environment Variable: `VITE_API_URL` pointing to your Render backend URL.

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
