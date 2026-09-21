const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("SMTP provider error:", {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
    });
    error.statusCode = 503;
    error.message = "Email service is unavailable. Please try again later.";
    throw error;
  }
};

// OTP Verification Email
exports.sendOTPEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: "MediBook Pro - Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Hello, ${name}!</h2>
          <p style="color: #64748b;">Your OTP for email verification is:</p>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #64748b;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

// Welcome Email
exports.sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: "Welcome to MediBook Pro!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Welcome, ${name}! 🎉</h2>
          <p style="color: #64748b;">Your account has been successfully verified. You can now book appointments with our verified doctors.</p>
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Get Started</a>
        </div>
      </div>
    `,
  });
};

// Doctor Verification Approved Email
exports.sendDoctorApprovedEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: "MediBook Pro - Your Profile Has Been Approved! ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Congratulations, Dr. ${name}! 🎉</h2>
          <p style="color: #64748b;">Your profile has been <strong style="color: #16a34a;">approved</strong> by our admin team. Your profile is now visible to patients and you can start accepting appointments.</p>
          <a href="${process.env.CLIENT_URL}/doctor/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Go to Dashboard</a>
        </div>
      </div>
    `,
  });
};

// Doctor Verification Rejected Email
exports.sendDoctorRejectedEmail = async (email, name, reason) => {
  await sendEmail({
    to: email,
    subject: "MediBook Pro - Profile Verification Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Hello, Dr. ${name}</h2>
          <p style="color: #64748b;">Unfortunately, your profile verification was <strong style="color: #dc2626;">rejected</strong>.</p>
          <div style="background: #fef2f2; padding: 16px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 16px 0;">
            <p style="color: #dc2626; margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p style="color: #64748b;">Please update your documents and reapply.</p>
        </div>
      </div>
    `,
  });
};

// Appointment Confirmation Email
exports.sendAppointmentConfirmedEmail = async (patientEmail, patientName, doctorName, date, timeSlot, meetingInfo) => {
  await sendEmail({
    to: patientEmail,
    subject: "MediBook Pro - Appointment Confirmed! ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Appointment Confirmed! 🎉</h2>
          <p style="color: #64748b;">Hello ${patientName}, your appointment has been confirmed.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 16px 0;">
            <p style="margin: 4px 0; color: #1e293b;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Date:</strong> ${new Date(date).toDateString()}</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Time:</strong> ${timeSlot.start} - ${timeSlot.end}</p>
            <p style="margin: 4px 0; color: #1e293b;"><strong>Meeting Info:</strong> ${meetingInfo}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/patient/appointments" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View Appointment</a>
        </div>
      </div>
    `,
  });
};

// Appointment Rejected Email
exports.sendAppointmentRejectedEmail = async (patientEmail, patientName, doctorName, reason) => {
  await sendEmail({
    to: patientEmail,
    subject: "MediBook Pro - Appointment Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Hello, ${patientName}</h2>
          <p style="color: #64748b;">Unfortunately, Dr. ${doctorName} has <strong style="color:#dc2626;">rejected</strong> your appointment request.</p>
          <div style="background: #fef2f2; padding: 16px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 16px 0;">
            <p style="color: #dc2626; margin: 0;"><strong>Reason:</strong> ${reason || "Doctor unavailable"}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/doctors" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">Book Another Doctor</a>
        </div>
      </div>
    `,
  });
};

// Forgot Password OTP
exports.sendForgotPasswordEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: "MediBook Pro - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">MediBook Pro</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b;">Password Reset Request</h2>
          <p style="color: #64748b;">Hello ${name}, use the OTP below to reset your password:</p>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #64748b;">This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #94a3b8; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};
