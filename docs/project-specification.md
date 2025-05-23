# Project Documentation: Multiplayer Maxi Yatzy Online (Mobile-Friendly)

**Version:** 1.4
**Date:** 2025-04-06

## 1. Introduction

This document outlines the specifications and design for a web-based, multiplayer version of the Maxi Yatzy dice game. The game will support 2-4 players, utilize 6 dice, and follow the specific Maxi Yatzy rules provided. It aims to provide a modern, intuitive, and engaging online experience, specifically designed to be fully functional and visually appealing on both desktop and mobile devices.

**A key goal is to deliver a user experience that feels polished, playful, and immediately intuitive, taking inspiration from the high quality standards often seen in Nintendo games.**

The application will be built using Next.js and Tailwind CSS, featuring user accounts, guest play, game creation/joining via codes, win/loss tracking, daily login rewards, animated and selectable dice, an automatic first roll per turn, a prominent Call To Action (CTA) button, and an optional "coin" betting system.

## 2. Goals and Objectives

*   **Develop a functional Maxi Yatzy game:** Implement the core rules accurately for 6 dice.
*   **Enable Multiplayer:** Support real-time gameplay for 2-4 players simultaneously.
*   **Deliver a High-Quality, Playful UI/UX:** Create a visually appealing, polished interface with satisfying interactions and intuitive controls, aiming for a "Nintendo-like" feel in terms of quality and approachability.
*   **Ensure Responsive, Mobile-First Design:** Prioritize a seamless experience on smaller screens.
*   **User Authentication:** Allow players to register/login or play as guests.
*   **Game Management:** Enable logged-in users to create private games and share unique codes.
*   **Persistence & Engagement:** Track stats and implement daily login rewards.
*   **Betting System (Optional):** Implement a virtual coin betting feature.
*   **Cross-platform Accessibility:** Ensure playability on modern web browsers.
*   **Streamlined Gameplay:** Implement an automatic first roll for faster turns.

## 3. Target Audience

This documentation is intended for the development team (developers, designers, potentially QA) involved in building the Multiplayer Maxi Yatzy game.

## 4. Features

### 4.1. Core Gameplay
- 6 dice gameplay ✅
- Automatic first roll per turn ✅
- Score tracking and validation ✅
- Turn-based gameplay ✅
- **NOTE**: Core gameplay logic has been fully implemented and fixed as of the latest update. All players (including the first player) now correctly receive their three rolls per turn, with the first roll being automatic.

### 4.2. Multiplayer Functionality
- Real-time game state synchronization ⚠️
- 2-4 player support ✅
- Game code sharing ⚠️
- Player turn management ✅

### 4.3. User Accounts & Authentication
- User registration and login (using **email** as the primary identifier) ❌
- Guest play support: ⚠️
    - Allows users to play without creating an account.
    - Guests are prompted for a display name when creating or joining a game.
    - Guest names must be unique within a specific active game session.
- Profile management (for registered users) ❌
- Statistics tracking (primarily for registered users, guests have transient sessions) ❌
- **NOTE**: Authentication logic has known issues that need to be resolved before release.

### 4.4. Game Management (Logged-in Users & Guests)
- Game creation (both logged-in users and guests)
- Private game codes
- Player invitations (via game code sharing)
- Game state persistence

### 4.5. Persistence & Stats
- Win/loss tracking
- Daily login rewards
- Player statistics
- Game history

### 4.6. Betting System (Optional)
- Virtual coin system
- Bet placement
- Win/loss tracking
- Coin management

### 4.7. User Interface (UI) & User Experience (UX)

*   **Nintendo-like Feel & Polish:** ⚠️
    *   **Playful Visuals:** Employ a bright, clean, and inviting art style. Graphics should be clear and easy to understand. Avoid overly complex or sterile designs. Consider subtle, charming elements where appropriate.
    *   **Satisfying Feedback (Juiciness):** Interactions should feel responsive and rewarding. This includes smooth animations for dice rolls and scoring, clear visual cues for selection/hover/disabled states, and well-timed, pleasant sound effects for key actions (dice rolling, holding, scoring points - *core SFX are important even in MVP*).
    *   **Highly Intuitive Flow:** Game actions must be obvious. Minimize cognitive load and friction. Guide the player clearly through their turn (what dice are held, what action is next, which scores are available). Error states should be clear and helpful.
    *   **Simplicity & Clarity:** Avoid clutter. Focus attention on the core game elements (dice, score sheet, main action button). Menus and settings should be straightforward and easy to navigate.
    *   **Attention to Detail:** High level of polish in transitions, alignment, typography, and consistency across the application.
    *   **NOTE**: UI implementation is in progress; improvements needed particularly for mobile responsiveness, animations, and visual feedback.

*   **Animated Dice Rolls:** Dice rolling action will be animated (e.g., visually distinct tumbling effect) contributing to the playful feel.
*   **Intuitive Controls:**
    *   **Dice Selection:** Dice are clearly displayed and easily selectable (tap/click) to toggle 'held' state. Held dice are visually distinct and the selection action feels responsive.
    *   **Main Call to Action (CTA):** A prominent, clearly labeled button for the primary action ("Roll Again", "Score Turn") is persistently visible and accessible, especially on mobile (e.g., fixed/sticky at the bottom).
    *   **Score Selection:** Easy interaction (tap/click) on available score categories. Potential scores should be clearly highlighted or previewed. The selection should provide immediate visual confirmation.
    *   **Visual Feedback:** Clear indication of remaining rolls, current player's turn, real-time score updates for all players.

*   **Mobile-First Responsive Design:**
    *   **Layout:** Adapts gracefully, prioritizing clarity and ease of use on small screens.
    *   **Touch Targets:** Large and well-spaced for touch interaction.
    *   **Readability:** Legible text across devices.
    *   **Navigation:** Simple, mobile-friendly menus.
    *   **Performance:** Optimized assets and smooth, lightweight animations.
    *   **Score Sheet Display:** Designed for mobile readability (scrolling, accordions, tabs, focused views).

## 5. Technical Specifications

*   **Frontend Framework:** Next.js (React framework)
*   **Styling:** Tailwind CSS
*   **Animation Library (Optional):** `Framer Motion`, CSS transitions/animations
*   **State Management:** React Context API / Zustand / Redux Toolkit
*   **Backend Logic:** Next.js API Routes
*   **Real-time Communication:** WebSockets (`Socket.IO`, `Pusher`, Supabase Realtime)
*   **Database:** Neon Serverless Postgres ([neon.tech](https://neon.tech/))
*   **ORM:** Prisma ([prisma.io](https://www.prisma.io/))
*   **Sound:** Web Audio API or a lightweight library for implementing core SFX
*   **Deployment:** Vercel ([vercel.com](https://vercel.com/))

## 6. Database Schema

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(cuid())
  // Username is now optional, mainly for display
  username             String?   
  password             String?   // Hashed password
  // Email is now required and unique, used for login
  email                String    @unique 
  name                 String?   // Optional full name
  emailVerified        DateTime? // For potential email verification flows
  image                String?   // Profile picture URL
  accounts             Account[] // Required for NextAuth OAuth providers
  sessions             Session[] // Required for NextAuth session management

  // Game-specific fields
  coins                Int       @default(1000)
  wins                 Int       @default(0)
  losses               Int       @default(0)
  lastLoginDate        DateTime?
  consecutiveLoginDays Int       @default(0)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  createdGames Game[]       @relation("GameCreator")
  gamePlayers  GamePlayer[]

  @@map("users") // Standard table name
}

// Required models for NextAuth.js
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Game-related models
model Game {
  id               String     @id @default(cuid())
  gameCode         String     @unique
  status           GameStatus @default(WAITING)
  currentTurnIndex Int        @default(0)
  creatorId        String?
  creator          User?      @relation("GameCreator", fields: [creatorId], references: [id])
  betAmount        Int?
  winnerId         String? 
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  gamePlayers      GamePlayer[]

  @@map("games")
}

model GamePlayer {
  id          String   @id @default(cuid())
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  userId      String? 
  user        User?    @relation(fields: [userId], references: [id])
  guestName   String? 
  joinOrder   Int 
  acceptedBet Boolean  @default(false)
  scores      Json? 
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([gameId, userId], name: "playerGame") 
  @@unique([gameId, guestName], name: "guestGame") 
  @@index([gameId])
  @@index([userId])
  @@map("game_players")
}

enum GameStatus {
  WAITING
  ACTIVE
  FINISHED
}
```

## 7. Game Logic Details

### 7.1. Turn Flow
1. Automatic first roll
2. Player selects dice to hold
3. Second roll
4. Player selects dice to hold
5. Final roll
6. Score selection
7. Next player's turn

### 7.2. Maxi Yatzy Combinations & Scoring
- Standard Yatzy combinations
- Bonus rules
- Special combinations

### 7.3. Game Over & Winner
- Score calculation
- Winner determination
- Game end conditions

### 7.4. Daily Login Reward Logic
- Streak tracking
- Reward calculation
- Bonus multipliers

## 8. API Design

### REST Endpoints
- User management (`/api/user/*`)
- Authentication (`/api/auth/*`)
- Game management:
    - `/api/game/create` (POST): Creates a new game. Handles both authenticated users (uses session) and guests (requires `guestName` in body).
    - `/api/game/join` (POST): Joins an existing game using a `gameCode`. Handles both authenticated users and guests (requires `guestName` if not authenticated).
- Score tracking (To be defined)

### WebSocket Events
- Game state updates
- Player actions
- Real-time scoring
- Turn management

## 9. Deployment

*   **Platform:** Vercel
*   **Database:** Neon Serverless Postgres (via Vercel Integration)
*   **Environment Variables:** Managed via Vercel project settings and `.env` for local development (see Technical Guide).
*   **Testing:** Focus on UI responsiveness, touch interactions, animations, feedback, and real-time updates

## 10. Future Enhancements (Post MVP)

*   **More Sophisticated Animations & SFX**
*   **Themes/Customization**
*   **Player Profiles/Avatars/Friend System**
*   **Public Lobbies/Matchmaking**
*   **AI Opponents**
*   **Game Chat**
*   **Robust Reconnect Handling**
*   **Tournament Mode**
*   **Push Notifications (Mobile)**
*   **PWA Features** 