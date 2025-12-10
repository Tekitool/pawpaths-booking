# Setting up Google Workspace Email (Alias & App Password)

You want to use `bookings@pawpathsae.com` (an alias of `info@pawpathsae.com`) to send emails. Here is how to configure it correctly.

## Important Concept
**You cannot log in with an alias.**
*   **Username**: You must use the **main account** (`info@pawpathsae.com`).
*   **Password**: You must generate the App Password from the **main account**.
*   **"From" Address**: You can tell the code to *say* the email is from `bookings@...`, and Google will allow it because it's a valid alias.

---

## Step 1: Create the Alias (Admin Console)
1.  Go to [admin.google.com](https://admin.google.com).
2.  Go to **Directory** > **Users**.
3.  Click on **`info@pawpathsae.com`**.
4.  Click **"Add Alternate Emails"** (Aliases).
5.  Add `bookings@pawpathsae.com` and save.

---

## Step 2: Enable 2-Step Verification (Required for App Passwords)
1.  Log in to Gmail as `info@pawpathsae.com`.
2.  Go to **Manage your Google Account** > **Security**.
3.  Under "How you sign in to Google", turn **ON** "2-Step Verification".
    *   *Note: If this option is locked, your Workspace Admin (you) needs to "Allow users to turn on 2-Step Verification" in the Admin Console security settings.*

---

## Step 3: Generate App Password
1.  Still in **Security** settings (for `info@pawpathsae.com`).
2.  Search for **"App passwords"** in the search bar at the top (or look under 2-Step Verification).
3.  **App name**: "Pawpaths Booking System".
4.  Click **Create**.
5.  **Copy the 16-character code**. This is your `EMAIL_PASSWORD`.

---

## Step 4: Update Environment Variables (`.env.local`)

Update your `.env.local` file with these exact values:

```env
# The main account credentials (REQUIRED for login)
EMAIL_USER=info@pawpathsae.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# The alias you want to show as the sender
EMAIL_FROM=bookings@pawpathsae.com
```

## Step 5: Update Vercel
Don't forget to update these same variables in your **Vercel Project Settings** -> **Environment Variables** and redeploy!
