# Authentication Setup for INCOIS ARGO Platform

## Overview
This document describes the authentication flow implemented for the INCOIS ARGO platform.

## Changes Made

### 1. Landing Page (src/app/page.tsx)
- **Before**: Full landing page with all components (Hero, Features, etc.)
- **After**: Simple authentication-focused landing page with:
  - Government branding header
  - INCOIS ARGO logo and description
  - Sign In/Sign Up buttons for unauthenticated users
  - "Go to Dashboard" button for authenticated users
  - Feature preview cards

### 2. Dashboard Page (src/app/dashboard/page.tsx)
- **Added**: Authentication protection using Clerk's `SignedIn`/`SignedOut` components
- **Behavior**: Only accessible to authenticated users
- **Redirect**: Unauthenticated users are redirected to sign-in

### 3. Explorer Page (src/app/explorer/page.tsx)
- **Added**: Authentication protection using Clerk's `SignedIn`/`SignedOut` components
- **Behavior**: Only accessible to authenticated users
- **Redirect**: Unauthenticated users are redirected to sign-in

### 4. Chatbot Page (src/app/chatbot/page.tsx)
- **Added**: Authentication protection using Clerk's `SignedIn`/`SignedOut` components
- **Behavior**: Only accessible to authenticated users
- **Redirect**: Unauthenticated users are redirected to sign-in

### 5. Header Component (src/components/Header.tsx)
- **Updated**: Sign In/Sign Up button styling to match the design
- **Added**: "Sign in" text for unauthenticated users
- **Updated**: Sign Up button with purple gradient styling

### 6. Middleware (src/middleware.ts)
- **Added**: Route protection for dashboard, explorer, and chatbot pages
- **Added**: Automatic redirect from home page to dashboard for authenticated users
- **Behavior**: 
  - Unauthenticated users can only access the landing page
  - Authenticated users are automatically redirected to dashboard when visiting home page

## Authentication Flow

1. **Unauthenticated User**:
   - Visits home page → sees landing page with Sign In/Sign Up options
   - Tries to access protected routes → redirected to sign-in

2. **Authenticated User**:
   - Visits home page → automatically redirected to dashboard
   - Can access all protected routes (dashboard, explorer, chatbot)
   - Sees user button in header instead of sign-in options

## Protected Routes
- `/dashboard` - Main dashboard with ARGO data overview
- `/explorer` - Interactive map and data exploration
- `/chatbot` - AI chat interface for data queries

## Public Routes
- `/` - Landing page with authentication options

## Dependencies
- Clerk for authentication
- Next.js middleware for route protection
- React components for conditional rendering

## Usage
1. Run `npm run dev` in the frontend directory
2. Visit `http://localhost:3000`
3. Sign up or sign in to access the full platform
4. Authenticated users will be redirected to the dashboard automatically
