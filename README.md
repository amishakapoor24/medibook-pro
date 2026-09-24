# MediBook Pro

MediBook Pro is a healthcare appointment platform for patients, doctors, and administrators. Patients find verified doctors and book appointments, doctors manage availability and consultations, administrators verify doctor profiles, and patients can use the AI health assistant for general health information.

## Features

- **Patients:** register with email OTP, find approved doctors, view profiles, book/cancel appointments, chat with doctors after confirmation, and ask the Health Assistant.
- **Doctors:** register with professional details, upload verification documents, set available days and time slots, accept or reject requests, chat with patients, and complete appointments.
- **Admins:** view dashboard analytics and approve or reject doctor profiles.

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

Set the backend values for `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, and `CLOUDINARY_*`. Locally, `EMAIL_*` can use SMTP. On Render's free plan, SMTP ports are blocked, so set `BREVO_API_KEY` and `EMAIL_SENDER` to a sender address verified in Brevo; emails then use Brevo's HTTPS API. Set `OPENAI_API_KEY` to your Groq API key (starts with `gsk_`). The default model is `openai/gpt-oss-120b` (Groq). Groq retires model names from time to time; if the assistant says the AI is not set up correctly, set `OPENAI_MODEL` to a current model from the Groq console. Optional: `OPENAI_BASE_URL` to change the provider endpoint, `AI_TIMEOUT_MS` to change the request timeout.

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

Deploy the frontend to Vercel and the backend to Render. Set `REACT_APP_API_URL` to the deployed backend URL ending in `/api`, and set `REACT_APP_SOCKET_URL` to the backend origin. Set the backend `CLIENT_URL` to the deployed frontend URL. On Render's free plan, configure `BREVO_API_KEY` and `EMAIL_SENDER` because SMTP ports are blocked; locally, SMTP `EMAIL_*` remains supported. Add all production secrets in the hosting provider's environment settings.

## Manual Test Path

1. Register a patient and verify the email OTP.
2. Register a doctor and verify the email OTP.
3. Create or sign in as an admin and approve the doctor.
4. Set the doctor's available days and time slots.
5. Book the doctor as the patient and accept the appointment as the doctor.
6. Open the appointment chat from both accounts and send messages.
7. Ask the Health Assistant a normal question and an emergency question such as "I am struggling to breathe".

## Known Limitations and Next Steps

- The assistant depends on the configured AI provider and can be unavailable or rate limited.
- Email, Cloudinary, MongoDB, and Google OAuth require valid production credentials.
- Document URLs should be moved behind authenticated access or signed URLs for stricter privacy.
- Socket chat now requires a valid JWT and an active appointment participant check; message retention policies can be added later.
- Add automated integration tests for signup, approval, booking, uploads, and provider failures before production launch.