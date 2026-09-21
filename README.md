# MediBook Pro

MediBook Pro is a healthcare appointment platform for patients, doctors, and administrators. Patients find verified doctors and book appointments, doctors manage availability and consultations, administrators verify doctor profiles, and patients can use the AI health assistant for general health information.

## Features

- **Patients:** register with email OTP, find approved doctors, view profiles, book/cancel appointments, chat with doctors after confirmation, and ask the Health Assistant.
- **Doctors:** register with professional details, upload verification documents, set available days and time slots, accept or reject requests, chat with patients, and complete appointments.
- **Admins:** review and approve or reject doctors, manage users, inspect appointments, and view dashboard analytics.

## AI Health Assistant

The assistant has three layers:

1. Fixed emergency guidance runs before any AI call for urgent patterns such as breathing trouble, chest pain, stroke, serious bleeding, poisoning, unconsciousness, and self-harm. It provides Indian emergency numbers including 112, 108, and Tele-MANAS 14416.
2. Guarded AI answers explain health topics and MediBook workflows without diagnosing, prescribing, or giving personal doses. Every response includes a server-owned disclaimer, and provider calls have timeouts, rate limits, and bounded input.
3. When useful, the assistant suggests approved doctors from the database by specialization.

The assistant is not medical advice, AI can be wrong, and assistant chats are not stored. Call emergency services for immediate danger.

## Tech Stack

React 18 and Tailwind CSS; Node.js and Express; MongoDB and Mongoose; Socket.io; JWT and bcrypt; Cloudinary; Nodemailer; and Groq through an OpenAI-compatible API.

## Request Flow

The React frontend calls Express routes. Authentication middleware and route-specific rate limits run before requests reach MongoDB or the AI provider. Results return through Express to the frontend.

## Security Decisions

- Passwords are hashed once in model save hooks.
- Account role is taken from the verified registration record, not from OTP verification input.
- OTPs use cryptographically secure codes and attempt limits.
- Public doctor endpoints use an allow-listed field projection.
- Booking validates doctor status, dates, availability, slots, and a unique database index prevents double booking.
- The assistant uses a per-user rate limit and emergency requests bypass that limit.
- AI keys and application secrets stay in ignored `.env` files, never in frontend code.

## Local Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB database
- SMTP account for OTP and appointment emails
- Cloudinary account for uploaded images/documents
- Groq API key for normal assistant answers

Copy the environment templates:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Set the backend values for `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `EMAIL_*`, and `CLOUDINARY_*`. Set `OPENAI_API_KEY` to your Groq key. The compatible provider settings are `OPENAI_BASE_URL`, `OPENAI_MODEL`, and optional `AI_TIMEOUT_MS`.

Set frontend `REACT_APP_API_URL` to the backend URL ending in `/api`, `REACT_APP_SOCKET_URL` to the backend origin, and `REACT_APP_GOOGLE_CLIENT_ID` if Google login is enabled.

Install and run both applications:

```powershell
cd backend
npm install
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm start
```

Create the first administrator:

```powershell
cd backend
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="choose-a-strong-password"
node scripts/createAdmin.js
```

## Deployment

Deploy the frontend to Vercel and the backend to Render. Set `REACT_APP_API_URL` to the deployed backend URL ending in `/api`, and set the backend `CLIENT_URL` to the deployed frontend URL. Add all production secrets in the hosting provider's environment settings.

## Known Limitations and Next Steps

- The assistant depends on the configured AI provider and can be unavailable or rate limited.
- Email, Cloudinary, MongoDB, and Google OAuth require valid production credentials.
- Document URLs should be moved behind authenticated access or signed URLs for stricter privacy.
- Live chat and notification authorization can be strengthened with appointment-level checks and message retention policies.
- Add automated integration tests for signup, approval, booking, uploads, and provider failures before production launch.