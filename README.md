# 🚀 Brand Reputation & Mention Tracker

A real-time platform to track brand mentions, analyze sentiment, detect conversation spikes, and generate AI-based insights.

🌐 Live Demo

URL: https://brand-reputation-tracker-two.vercel.app/

📦 GitHub Repository

Repo Link: https://github.com/rajat7014/brand-reputation-tracker

🧠 Overview

Marketers and brand managers often struggle to track online conversations happening across social media, news, forums, YouTube, GitHub, etc.

This project provides a centralized real-time dashboard to monitor brand mentions, sentiment trends, topic clusters, and spike alerts.
It also uses AI (Gemini 2.5 Flash) to generate an intelligent brand summary and PDF reports for quick decision-making.

🎯 Features
🔍 Brand Mention Tracking

Fetch mentions from multiple sources (Reddit, News, HackerNews, GitHub, YouTube).

Sentiment detection for each mention.

Source-wise filtering.

📊 Real-Time Dashboard

Sentiment charts

Topic clusters using KMeans

Word cloud visualization

Spike alert detection

Mentions feed with filters

🤖 AI Sentiment Summary

Powered by Google Gemini API

Analyzes 80+ mentions

Provides:

Sentiment direction

Key themes

Risks

Opportunities

Actionable summary

👤 Multi-User Authentication

NextAuth credentials provider

Login & Signup pages with modern UI

Auth-protected dashboard

Logout functionality

🔥 Real-Time Polling Updates

Automatic topic refresh in every 10 sec

Live clusters & updated sentiment

🛠️ Tech Stack
Frontend

Next.js 14 (App Router)

React

TailwindCSS

Chart.js / Recharts

WordCloud.js

Backend

Next.js API Routes

MongoDB + Mongoose

Gemini API (2.5 Flash)

Pollling

Sentiment analysis models

Tools

bcrypt.js

NextAuth

Node.js runtime APIs

📁 Project Structure
/app
  /login
  /register
  /dashboard
  /api
    /mentions
    /topics
    /spikes
    /ai-summary
    /auth
/components
  /Charts
  /Mentions
  /AI
/lib
  db.js
  models/

⚙️ Setup Instructions
1. Clone the project
git clone https://github.com/your-username/brand-reputation-tracker
cd brand-reputation-tracker

2. Install dependencies
npm install

3. Add environment variables

Create a .env.local file:

MONGODB_URI=
GEMINI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

4. Run locally
npm run dev

5. Build
npm run build

📡 API Endpoints
POST /api/mentions

Fetches brand mentions.

POST /api/topics

Generates topic clusters & wordcloud data.

POST /api/spikes

Checks if a spike is happening.

POST /api/ai-summary

AI summary using Gemini 2.5 Flash.

POST /api/auth/signup

Register a user.

POST /api/auth/login

Login with credentials.
