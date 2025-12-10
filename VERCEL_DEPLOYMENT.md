# Deploying to Vercel (Demo)

This guide will help you push your code to GitHub and deploy it on Vercel for a quick demo.

## Phase 1: Push Code to GitHub

Since your project is not yet a Git repository, we need to initialize it.

1.  **Initialize Git**:
    Open your terminal (in `c:\NEXT\Pawpath-Form`) and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for Vercel demo"
    ```

2.  **Create a GitHub Repository**:
    *   Go to [GitHub.com/new](https://github.com/new).
    *   Name it `pawpaths-booking`.
    *   Make it **Private** (since it has business logic) or Public.
    *   Click **Create repository**.

3.  **Link and Push**:
    Copy the commands shown on GitHub under "…or push an existing repository from the command line" and run them. They will look like this:
    ```bash
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/pawpaths-booking.git
    git push -u origin main
    ```

---

## Phase 2: Deploy on Vercel

1.  **Log in to Vercel**:
    *   Go to [vercel.com](https://vercel.com) and log in (usually with your GitHub account).

2.  **Import Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Find `pawpaths-booking` in the list and click **Import**.

3.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (default).

4.  **Environment Variables (Crucial)**:
    Expand the **Environment Variables** section and add the following from your `.env.local` file:

    | Key | Value |
    | :--- | :--- |
    | `MONGODB_URI` | `mongodb+srv://...` (Your full connection string) |
    | `MONGODB_DB` | `pawpaths` |
    | `EMAIL_HOST` | `smtp.gmail.com` |
    | `EMAIL_PORT` | `587` |
    | `EMAIL_USER` | `pawpathsae@gmail.com` |
    | `EMAIL_PASSWORD` | `gbwgwhtyhvvmovqs` (Your App Password) |
    | `EMAIL_FROM` | `pawpathsae@gmail.com` |
    | `NEXT_PUBLIC_API_URL` | Leave empty or set to your Vercel URL after deploy (e.g. `https://pawpaths-booking.vercel.app`) |
    | `COMPANY_NAME` | `Pawpaths Pets Relocation Services` |
    | `COMPANY_PHONE` | `+971586947755` |
    | `WHATSAPP_NUMBER` | `971586947755` |

5.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to complete (usually 1-2 minutes).

6.  **Test**:
    *   Once deployed, click the screenshot to visit your live site.
    *   Try submitting a booking to ensure the database and email are working.

---

## Note on "Server Actions"
If you see an error about `allowedOrigins` in the Vercel logs, you might need to update your `next.config.mjs` to include your Vercel domain (e.g., `pawpaths-booking.vercel.app`), but usually Vercel handles this automatically for deployments on their platform.
