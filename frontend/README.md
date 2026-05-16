# HERMAN Project - Frontend

A modern React application for requirements management and analysis.

## About

This is the frontend application for the HERMAN Project, built with React and Vite. The application connects to a Node.js/Express backend for data management.

## Prerequisites

1. Node.js (v16 or higher)
2. npm (comes with Node.js)

## Getting Started

1. Clone the repository using the project's Git URL
2. Navigate to the frontend directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
```

5. Run the development server: `npm run dev`

The app will be available at `http://localhost:5173/`

## Backend Setup

Make sure the backend server is running on `http://localhost:3001`. See the backend README for setup instructions.

## Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + Radix UI
- **State Management**: React Query (TanStack)
- **API Client**: Fetch-based HTTP client
- **Database**: SQLite (via Node.js backend)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
