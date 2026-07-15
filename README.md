# Transport AI App

Transport AI is a full-stack, AI-powered application designed to streamline the processing of transport receipts. It leverages the Google Gemini API to intelligently extract data from transport receipts and allows users to export the processed data into formatted Excel spreadsheets.

## 🚀 Key Features

* **AI-Powered Data Extraction**: Utilize Google's Gemini API to automatically parse and extract key information from transport receipt images/documents.
* **Excel Export**: Easily generate and download comprehensive Microsoft Excel (.xlsx) reports of your extracted transport data (powered by Apache POI).
* **Secure Authentication**: Robust user authentication system utilizing JSON Web Tokens (JWT) and Spring Security.
* **Modern & Responsive UI**: Beautiful, interactive user interface built with Next.js, TailwindCSS, shadcn/ui components, Recharts for data visualization, and Framer Motion for smooth animations.
* **Email Integration**: Built-in Java Mail support for sending notifications or handling email-based workflows.
* **Database Versioning**: Reliable database schema management using Flyway migrations with a PostgreSQL database.
* **Containerized Workflows**: Easy deployment and development using Docker and Docker Compose for both local and production environments.

---

## 🛠️ Technology Stack

### Frontend
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router) & React 19
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Data Visualization**: [Recharts](https://recharts.org/)
* **Forms & Validation**: React Hook Form & Zod

### Backend
* **Framework**: [Spring Boot 4.1](https://spring.io/projects/spring-boot)
* **Language**: Java 17
* **Database**: PostgreSQL
* **Security**: Spring Security & JWT Auth
* **Migrations**: Flyway
* **Excel Processing**: Apache POI
* **AI Integration**: Google Gemini API

---

## 📦 Project Structure

```
transport-ai-app/
├── backend/                  # Spring Boot Java application
│   ├── src/                  # Backend source code
│   ├── pom.xml               # Maven dependencies
│   └── Dockerfile            # Backend Docker build instructions
├── frontend/                 # Next.js React application
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable UI components (shadcn)
│   ├── package.json          # Node dependencies
│   └── Dockerfile            # Frontend Docker build instructions
├── docker-compose.yml        # Local development Docker configuration
├── docker-compose.prod.yml   # Production Docker configuration
└── .env.prod.template        # Template for production environment variables
```

---

## 💻 Getting Started (Local Development)

### Prerequisites
* Docker & Docker Compose
* Node.js (v18+ recommended)
* Java 17 (if running backend locally without Docker)
* Maven (if running backend locally without Docker)

### 1. Environment Setup
Create a `.env` file in the root directory and populate it with your specific credentials. You can use `.env.prod.template` as a reference.

**Required `.env` variables:**
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=transport_ai

DATABASE_URL=jdbc:postgresql://localhost:5432/transport_ai
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password

GEMINI_API_KEY=your_google_gemini_api_key

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
SESSION_HOURS=12
```

### 2. Running with Docker Compose (Recommended)

You can spin up the entire stack (PostgreSQL database and backend) using Docker Compose.

```bash
docker-compose up --build
```
* The **Backend API** will be available at: `http://localhost:8080`
* The **PostgreSQL Database** will be mapped to port `5432`

### 3. Running the Frontend Locally

Open a new terminal window, navigate to the frontend directory, install dependencies, and start the development server.

```bash
cd frontend
npm install
npm run dev
```
* The **Frontend Web App** will be available at: `http://localhost:3000`

---

## 🚀 Production Deployment

For production environments, ensure you use the production docker-compose file:

1. Copy `.env.prod.template` to `.env` and fill in secure credentials.
2. Build and start the containers in detached mode:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📝 License

This project is proprietary and confidential.
