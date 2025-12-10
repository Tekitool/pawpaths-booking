# Scaling Roadmap: From Form to Booking Management System

You have successfully built a robust **Booking Submission Engine**. Now, to transform this into a full **Booking Management System** hosted on `bookings.pawpathsae.com`, here is your roadmap.

## Phase 1: Infrastructure (The Foundation)

Since you want a separate instance for this, you are setting up a "Microservices" style architecture where your main site is on one server and your app is on another.

1.  **Dedicated Lightsail Instance**:
    *   **OS**: Ubuntu 20.04 or 22.04 (cleaner than Bitnami for custom apps).
    *   **Size**: Minimum 1GB RAM (2GB recommended for Next.js + Database).
    *   **Domain**: Point `bookings.pawpathsae.com` A-record to this new IP.

2.  **Database Strategy**:
    *   *Option A (Easiest)*: Continue using MongoDB Atlas (Cloud). Both your local dev and your new Lightsail server connect to the same cloud DB.
    *   *Option B (Self-Hosted)*: Install MongoDB directly on the new Lightsail instance. Faster, cheaper, but you must manage backups yourself.

3.  **CI/CD Pipeline**:
    *   Stop dragging files manually! Set up **GitHub Actions**.
    *   *Workflow*: You push code to GitHub -> GitHub automatically builds and deploys to your Lightsail server.

---

## Phase 2: Authentication (The Gatekeeper)

To "manage" bookings, you need an Admin Panel. You cannot have the public accessing this.

1.  **Install NextAuth.js**:
    *   The standard for Next.js authentication.
    *   Use `CredentialsProvider` for a simple Admin Login (Email/Password).
    *   Or use `GoogleProvider` to login with your company Gmail.

2.  **User Roles**:
    *   Update your Database Schema to have a `User` collection.
    *   Roles: `Admin` (Can edit/delete), `Staff` (Can view/update status), `Customer` (Can only view their own).

---

## Phase 3: The Admin Dashboard (The Control Center)

This is the core "View and Manage" requirement.

1.  **Dashboard UI (`/admin`)**:
    *   **Data Table**: A searchable, filterable table of all bookings.
    *   **Filters**: "Pending", "Confirmed", "Completed".
    *   **Search**: By Booking ID, Customer Name, or Pet Name.

2.  **Booking Management**:
    *   **Status Workflow**: Add a dropdown to change status: `Pending` -> `In Progress` -> `Flight Booked` -> `Completed`.
    *   **Edit Capability**: Fix typos in customer details.
    *   **Notes System**: Add internal notes for your team (e.g., "Waiting for vet records").

---

## Phase 4: Advanced Features (The "Next Level")

1.  **File Uploads (AWS S3)**:
    *   Allow customers to upload Pet Passports and Vaccination Cards directly in the form.
    *   Store these securely in AWS S3, not on the server disk.

2.  **Automated Email Triggers**:
    *   When you change status to "Flight Booked" in the Dashboard -> System automatically emails the customer with flight details.

3.  **Customer Portal**:
    *   Allow customers to login (`bookings.pawpathsae.com/login`) to see the live status of their pet's journey.

---

## Summary Checklist for Next Steps

- [ ] **Buy/Setup** new Lightsail Instance.
- [ ] **Configure** DNS for `bookings.pawpathsae.com`.
- [ ] **Implement** NextAuth.js (Login System).
- [ ] **Build** Admin Dashboard Page (Table View).
- [ ] **Deploy** to new instance.

---

# Detailed Project Estimation

To build the full **Booking Management System** described above, here is the breakdown of requirements, procedure, and time.

## 1. Requirements Checklist

### Technical Stack Additions
-   **Authentication**: `NextAuth.js` (v5) - For secure Admin login.
-   **UI Components**: `shadcn/ui` (Data Table, Dropdowns, Dialogs) - For a professional dashboard look.
-   **Data Management**: `TanStack Table` - For sorting, filtering, and pagination of bookings.
-   **File Storage**: `AWS SDK (S3)` - To store pet passports/docs securely (Database is for text only).
-   **Email Service**: `Resend` or `SendGrid` - Gmail is fine for testing, but for a platform, you need a dedicated provider to avoid blocking.

### Infrastructure
-   **AWS Lightsail**: Ubuntu 22.04 Instance.
    -   **Spec**: 2GB RAM / 1 vCPU (Minimum for Admin Panel + API).
    -   **Cost**: ~$10-20/month.
-   **Domain**: `bookings.pawpathsae.com` (SSL via Let's Encrypt).

## 2. Step-by-Step Procedure

1.  **Setup & Auth (Foundation)**
    -   Initialize new Next.js project (or refactor existing).
    -   Setup MongoDB connection.
    -   Implement Login Page & Protect `/admin` routes.
2.  **Database Migration**
    -   Update Schema to include `status` (Pending, Confirmed, etc.), `notes`, and `assignedTo`.
3.  **Admin Dashboard (The Grid)**
    -   Build the main table view.
    -   Implement server-side pagination (so it stays fast with 1000+ bookings).
    -   Add filters (Date Range, Status).
4.  **Booking Detail View**
    -   Create a page to view one single booking in depth.
    -   Add "Edit" forms for customer/pet details.
    -   Add "Status Change" buttons with email triggers.
5.  **File System**
    -   Integrate AWS S3.
    -   Add upload buttons to the Booking Detail view.

## 3. Time Estimates (Approximate)

| Phase | Task | Estimated Time |
| :--- | :--- | :--- |
| **Phase 1** | **Authentication & Setup** | **2 - 3 Days** |
| | Setup NextAuth, Login UI, Protected Routes | |
| **Phase 2** | **Dashboard & Data Table** | **4 - 5 Days** |
| | Data fetching, Table UI, Filtering, Sorting | |
| **Phase 3** | **Detail View & Actions** | **3 - 4 Days** |
| | View details, Edit functionality, Status updates | |
| **Phase 4** | **Email Automation** | **2 Days** |
| | Triggers for status changes, Templates | |
| **Phase 5** | **File Uploads (S3)** | **2 - 3 Days** |
| | AWS Config, Upload UI, Secure viewing links | |
| **Total** | **Full Development** | **~2 - 3 Weeks** |

*Note: This assumes 1 developer working full-time. Timelines can vary based on complexity of specific business rules.*
