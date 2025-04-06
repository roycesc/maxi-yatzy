# Maxi Yatzy

A modern, multiplayer Yatzy game built with Next.js 15.2.4, featuring real-time gameplay and a sleek user interface.

## 🎯 Project Overview

Maxi Yatzy is a digital adaptation of the classic dice game Yatzy, enhanced with modern features and multiplayer capabilities. The game allows players to compete in real-time, track scores, and enjoy a seamless gaming experience.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Neon Serverless Postgres
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## ✨ Features

- Real-time multiplayer gameplay
- Modern, responsive UI with TailwindCSS
- Secure authentication with NextAuth.js
- Persistent game state with Neon Serverless Postgres
- Score tracking and statistics
- Mobile-friendly design
- Core game logic unit tested with Jest

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Git
- A Neon account ([neon.tech](https://neon.tech/))
- A Vercel account ([vercel.com](https://vercel.com/))

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd maxi-yatzy
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Neon Database:**
    *   Create a new project on Neon.
    *   Note down the **Pooled Connection String** from the Neon dashboard.
4.  **Integrate with Vercel:**
    *   Connect your Vercel project to your Neon project via the Vercel Integrations marketplace. This handles production environment variables.
5.  **Set up Local Environment Variables:**
    *   Copy the `.env.example` (if it exists) or create a `.env` file manually.
    *   Populate `.env`:
        ```dotenv
        # Paste your Neon Pooled Connection String here for local development
        DATABASE_URL="postgres://<user>:<password>@<pooler-host>.neon.tech/<database>?sslmode=require"

        # Generate a secret: openssl rand -base64 32
        NEXTAUTH_SECRET="YOUR_STRONG_SECRET_HERE"

        # Development server URL
        NEXTAUTH_URL="http://localhost:3000"
        ```
    *   **Important:** Replace placeholders with your actual Neon connection string and a generated `NEXTAUTH_SECRET`.
6.  **Run Database Migrations:**
    ```bash
    npm run db:migrate
    ```
    *   This command uses the `DATABASE_URL` from your `.env` file to set up the schema in your Neon database.
7.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Your app should now be running on `http://localhost:3000` and connected to your Neon database for local development.

## 🔧 Development

- Uses React Server Components by default
- Implements error boundaries and loading states
- Follows TypeScript best practices
- Implements proper error handling and logging
- Includes unit tests using Jest (run with `npm test`)

## 📝 License

MIT License - See LICENSE file for details
