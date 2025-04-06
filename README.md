# Maxi Yatzy

A modern, multiplayer Yatzy game built with Next.js 15.2.4, featuring real-time gameplay and a sleek user interface.

## 🎯 Project Overview

Maxi Yatzy is a digital adaptation of the classic dice game Yatzy, enhanced with modern features and multiplayer capabilities. The game allows players to compete in real-time, track scores, and enjoy a seamless gaming experience.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (planned)

## ✨ Features

- Real-time multiplayer gameplay
- Modern, responsive UI with TailwindCSS
- Secure authentication with NextAuth.js
- Persistent game state with MongoDB
- Score tracking and statistics
- Mobile-friendly design

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📦 Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── lib/             # Utility functions and shared logic
├── types/           # TypeScript type definitions
└── styles/          # Global styles and Tailwind config
```

## 🔧 Development

- Uses React Server Components by default
- Implements error boundaries and loading states
- Follows TypeScript best practices
- Implements proper error handling and logging

## 📝 License

MIT License - See LICENSE file for details
