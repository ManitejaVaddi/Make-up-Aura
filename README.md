# Luxury Bridal Makeup Artist Platform

A premium full-stack bridal makeup artist business platform built with React, Vite, Tailwind CSS, Express, MongoDB, and Razorpay.

## Features

- Multi-role authentication with JWT and Google OAuth
- Customer portal with booking history, invoices, and profile management
- Admin dashboard for services, bookings, gallery, reviews, users, and revenue analytics
- Secure booking system with availability checks, payment creation, and status tracking
- Cloudinary-backed gallery uploads and portfolio management
- Email notifications and webhook-ready architecture
- Mobile-first luxury UI with glassmorphism, cinematic animations, and responsive layouts

## Architecture

- `client/` - React frontend with Vite, Tailwind CSS, Framer Motion, React Hook Form, Zod
- `server/` - Express backend with MongoDB, Mongoose, Passport Google OAuth, Razorpay, Nodemailer

## Setup

### Backend

1. `cd server`
2. Copy `.env.example` to `.env`
3. Fill in MongoDB Atlas, Cloudinary, Razorpay, Google OAuth, and email credentials
4. Install dependencies: `npm install`
5. Start server in development: `npm run dev`

### Frontend

1. `cd client`
2. Copy `.env.example` to `.env`
3. Set `VITE_API_BASE_URL` to your backend API URL
4. Install dependencies: `npm install`
5. Start development: `npm run dev`

### Build

- Frontend production: `cd client && npm run build`
- Backend production: `cd server && npm run start`

## Deployment

- Frontend: Vercel or any static hosting using Vite output
- Backend: Render, Railway, or a similar Node server host
- Database: MongoDB Atlas
- Images: Cloudinary for uploads and CDN delivery
- Payments: Razorpay with secure order creation and verification

## Environment variables

See `server/.env.example` and `client/.env.example` for required values.

## Project Structure

- `client/` — React frontend with Tailwind, Framer Motion, React Router, Axios
- `server/` — Express backend with MongoDB, JWT auth, Google OAuth, Cloudinary, Razorpay

## Notes

- The admin panel is available at `/admin` after logging in as an admin user.
- Customer portal is available at `/dashboard` after authentication.
- The booking flow supports payment verification and email notifications.
