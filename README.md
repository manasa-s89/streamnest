# StreamNest - Premium OTT Streaming Platform

StreamNest is a modern, premium OTT streaming platform built with React, Vite, Express, and Tailwind CSS. It features trending movies, original series, personalized watchlists, subscription plans, and unified customer telemetry integration.

## ✨ Features

- **Hero Spotlight & Carousels**: Featured movies, top-rated shows, and trending releases with smooth transitions.
- **Rich Media Details**: Modal views with genre tags, age ratings, runtimes, cast information, and trailers.
- **Personalized Watchlist**: Save and manage your favorite titles effortlessly.
- **Subscription Tiers**: Flexible subscription options with plan comparisons and benefits breakdown.
- **Smart Recommendations**: Dynamic content suggestions powered by integrated services.
- **Responsive & Dark-Themed UI**: Glassmorphic aesthetic optimized for desktop, tablet, and mobile viewing.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide React
- **Backend**: Express, WebSocket (`ws`), tsx, Node.js
- **AI & Integrations**: Google Gen AI SDK

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manasa-s89/streamnest.git
   cd streamnest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` and other required keys to `.env`.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Deploy to Vercel

### 1-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmanasa-s89%2Fstreamnest)

### Manual Setup on Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the **`manasa-s89/streamnest`** repository from GitHub.
3. Configure the Project Settings (automatically detected via `vercel.json`):
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will build and assign an instant production URL with automatic SSL and CDN caching.

## 📄 License

This project is licensed under the MIT License.

