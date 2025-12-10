# Pawpaths Pets Relocation Booking System

A comprehensive booking system for Pawpaths Pets Relocation Services, built with Next.js 14+, Tailwind CSS, and MongoDB.

## Features

- **Responsive Booking Form**: Multi-step form for customer details, travel info, and dynamic pet details.
- **Validation**: Real-time validation for all fields.
- **Email Notifications**: Automated HTML email confirmation sent to customers.
- **WhatsApp Integration**: Generates a pre-filled WhatsApp message for easy sharing.
- **MongoDB Integration**: Stores all bookings in MongoDB Atlas.
- **Admin Ready**: Structured data model ready for future admin dashboard integration.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS v4, Lucide React
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose)
- **Email**: Nodemailer
- **Validation**: validator.js

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB Database (Atlas or local)
- Email Service (SMTP credentials)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/pawpaths-booking.git
    cd pawpaths-booking
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env.local` file in the root directory with the following:
    ```env
    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawpaths?retryWrites=true&w=majority
    MONGODB_DB=pawpaths
    NEXT_PUBLIC_API_URL=http://localhost:3000
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASSWORD=your-app-password
    EMAIL_FROM=bookings@pawpaths.com
    COMPANY_PHONE=+971586947755
    COMPANY_NAME=Pawpaths Pets Relocation Services
    WHATSAPP_NUMBER=971586947755
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment (AWS Lightsail)

1.  **Provision Instance**: Create a Node.js instance on AWS Lightsail.
2.  **Clone Repo**: SSH into the instance and clone the repository.
3.  **Install Dependencies**: `npm install`
4.  **Build**: `npm run build`
5.  **Environment**: Create `.env.production` with production values.
6.  **PM2**: Start the app using PM2:
    ```bash
    pm2 start npm --name "pawpaths-booking" -- start
    ```
7.  **Nginx**: Configure Nginx as a reverse proxy (see `nginx.conf` example in docs).
8.  **SSL**: Use Certbot to enable HTTPS.

## API Documentation

### POST /api/booking

Submits a new booking.

**Request Body:**
```json
{
  "customerInfo": { "fullName": "...", "email": "...", "phone": "..." },
  "travelDetails": { ... },
  "pets": [ { "type": "Dog", "breed": "...", ... } ]
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "PW-2024-001",
  "message": "Booking confirmed successfully",
  "whatsappLink": "..."
}
```
