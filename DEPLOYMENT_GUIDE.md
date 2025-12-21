# Professional Deployment Pipeline Guide

This guide explains how to configure your Pawpaths Booking System for a professional workflow with Development, Staging, and Production environments.

## 1. Database Setup (MongoDB Atlas)

You need to separate your data so that testing doesn't delete or corrupt real bookings.

1.  **Log in** to your MongoDB Atlas dashboard.
2.  **Navigate** to your Cluster.
3.  **Create a Staging Database**:
    *   You don't strictly need to "create" it manually; MongoDB creates it when you write to it.
    *   However, for your connection string, you will just change the database name.
    *   **Production DB Name**: `pawpaths` (Existing)
    *   **Staging DB Name**: `pawpaths-staging` (New)

## 2. Vercel Environment Configuration

Vercel allows you to set different environment variables for **Production** (Live site) and **Preview** (Staging/Pull Requests).

1.  Go to your **Vercel Project Settings** -> **Environment Variables**.
2.  You likely already have variables set. We need to edit them to be environment-specific.

### Configure `MONGODB_DB`
This is the most critical change.

1.  Find `MONGODB_DB`.
2.  **Edit** it.
3.  Uncheck "Preview" and "Development". Keep only **Production** checked.
    *   Value: `pawpaths`
4.  **Add a New Variable**:
    *   Key: `MONGODB_DB`
    *   Value: `pawpaths-staging`
    *   Select **only** "Preview" (and optionally "Development" if you want to use the cloud staging DB locally, though usually local uses a local DB or a specific dev DB).

### Configure `NEXT_PUBLIC_API_URL` (Optional)
If you use this variable, ensure it matches the environment.

*   **Production**: `https://booking.pawpathsae.com`
*   **Preview**: System automatically handles relative paths usually, but if you need the full URL, Vercel provides `NEXT_PUBLIC_VERCEL_URL` automatically. You might not need to hardcode this for Preview.

## 3. Workflow

### Development (Local)
*   **Branch**: `development` (or feature branches like `feature/new-form`)
*   **Database**: Uses your local `.env.local`.
    *   Ensure your local `.env.local` has `MONGODB_DB=pawpaths-staging` (or a specific `pawpaths-dev`) so you don't touch prod data while coding.

### Staging (Preview)
*   **Action**: Push to `development` branch (or any non-main branch).
*   **Vercel**: Automatically builds a **Preview Deployment**.
*   **URL**: Vercel gives you a unique URL (e.g., `pawpaths-booking-git-development-user.vercel.app`).
*   **Database**: Connects to `pawpaths-staging` (because of the Preview env var we set above).
*   **Test**: Verify your changes here.

### Production (Live)
*   **Action**: Create a Pull Request (PR) from `development` to `main`, and merge it.
*   **Vercel**: Automatically builds a **Production Deployment**.
*   **URL**: `https://booking.pawpathsae.com`
*   **Database**: Connects to `pawpaths` (Live data).

## 4. Immediate Action Items

1.  [ ] **Update Local Config**: Check your `c:\NEXT\Pawpath-Form\.env.local`. Change `MONGODB_DB` to `pawpaths-staging` (or `pawpaths-dev`) to protect production data.
2.  [ ] **Vercel Dashboard**: Go to Vercel and split the `MONGODB_DB` variable as described in Section 2.
3.  [ ] **Push**: Push your `development` branch to GitHub to trigger your first Staging deployment.
    ```bash
    git push origin development
    ```
