const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor");

dotenv.config({ path: __dirname + "/../.env" });

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding doctors...");

    const count = await Doctor.countDocuments({ verificationStatus: "approved" });
    if (count >= 5) {
      console.log(`Already have ${count} approved doctors in DB. Skipping seed.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("Password@123", salt);

    const doctorsData = [
      {
        name: "Aarav Sharma",
        email: "dr.aarav@medibook.pro",
        password,
        phone: "9876543210",
        role: "doctor",
        profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
        specialization: "Cardiologist",
        experience: 14,
        fees: 800,
        bio: "Senior Consultant Interventional Cardiologist specializing in cardiovascular wellness, heart failure management, and preventive clinical cardiology.",
        address: { clinic: "Apollo Heart Center, 4th Floor", city: "Mumbai", state: "Maharashtra" },
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { start: "09:00", end: "09:30", isBooked: false },
          { start: "10:00", end: "10:30", isBooked: false },
          { start: "11:30", end: "12:00", isBooked: false },
          { start: "14:00", end: "14:30", isBooked: false },
          { start: "16:00", end: "16:30", isBooked: false },
        ],
        qualifications: [
          { degree: "MBBS", institute: "AIIMS New Delhi", year: 2008 },
          { degree: "MD - Medicine", institute: "KEM Hospital Mumbai", year: 2012 },
          { degree: "DM - Cardiology", institute: "SCTIMST", year: 2016 },
        ],
        verificationStatus: "approved",
        isActive: true,
        isVerified: true,
        rating: { average: 4.9, count: 124 },
      },
      {
        name: "Priya Nair",
        email: "dr.priya@medibook.pro",
        password,
        phone: "9876543211",
        role: "doctor",
        profilePhoto: "https://images.unsplash.com/photo-1594824813626-d62f3f4c6e94?w=400&auto=format&fit=crop&q=80",
        specialization: "Dermatologist",
        experience: 9,
        fees: 600,
        bio: "Board-certified clinical and cosmetic dermatologist with expertise in acne therapies, laser treatments, eczema, and skin rejuvenation.",
        address: { clinic: "Glow Skin & Laser Clinic", city: "Bengaluru", state: "Karnataka" },
        availableDays: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
        timeSlots: [
          { start: "10:00", end: "10:30", isBooked: false },
          { start: "11:00", end: "11:30", isBooked: false },
          { start: "15:00", end: "15:30", isBooked: false },
          { start: "17:00", end: "17:30", isBooked: false },
        ],
        qualifications: [
          { degree: "MBBS", institute: "Bangalore Medical College", year: 2013 },
          { degree: "MD - Dermatology, Venereology & Leprosy", institute: "JIPMER Puducherry", year: 2017 },
        ],
        verificationStatus: "approved",
        isActive: true,
        isVerified: true,
        rating: { average: 4.8, count: 98 },
      },
      {
        name: "Rajesh Kulkarni",
        email: "dr.rajesh@medibook.pro",
        password,
        phone: "9876543212",
        role: "doctor",
        profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
        specialization: "General Physician",
        experience: 18,
        fees: 500,
        bio: "Senior physician dedicated to holistic family medicine, lifestyle disorder prevention, hypertension, and diabetes management.",
        address: { clinic: "Kulkarni Care Polyclinic", city: "Pune", state: "Maharashtra" },
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        timeSlots: [
          { start: "08:30", end: "09:00", isBooked: false },
          { start: "09:30", end: "10:00", isBooked: false },
          { start: "16:00", end: "16:30", isBooked: false },
          { start: "18:00", end: "18:30", isBooked: false },
        ],
        qualifications: [
          { degree: "MBBS", institute: "BJ Government Medical College", year: 2004 },
          { degree: "MD - General Medicine", institute: "Grant Medical College Mumbai", year: 2008 },
        ],
        verificationStatus: "approved",
        isActive: true,
        isVerified: true,
        rating: { average: 4.9, count: 215 },
      },
      {
        name: "Ananya Mukherjee",
        email: "dr.ananya@medibook.pro",
        password,
        phone: "9876543213",
        role: "doctor",
        profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
        specialization: "Pediatrician",
        experience: 11,
        fees: 550,
        bio: "Compassionate child specialist focusing on newborn care, developmental milestones, pediatric allergies, and child immunization.",
        address: { clinic: "Little Stars Child Clinic", city: "Kolkata", state: "West Bengal" },
        availableDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        timeSlots: [
          { start: "10:00", end: "10:30", isBooked: false },
          { start: "11:30", end: "12:00", isBooked: false },
          { start: "16:00", end: "16:30", isBooked: false },
        ],
        qualifications: [
          { degree: "MBBS", institute: "Medical College Kolkata", year: 2011 },
          { degree: "DCH & DNB - Pediatrics", institute: "Child Health Trust", year: 2015 },
        ],
        verificationStatus: "approved",
        isActive: true,
        isVerified: true,
        rating: { average: 4.9, count: 142 },
      },
      {
        name: "Vikram Singhania",
        email: "dr.vikram@medibook.pro",
        password,
        phone: "9876543214",
        role: "doctor",
        profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
        specialization: "Orthopedic",
        experience: 15,
        fees: 750,
        bio: "Orthopedic surgeon specializing in arthroscopy, joint replacement, sports injury rehab, and spine disorders.",
        address: { clinic: "Singhania Bone & Joint Hospital", city: "Delhi", state: "Delhi" },
        availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
        timeSlots: [
          { start: "09:30", end: "10:00", isBooked: false },
          { start: "11:00", end: "11:30", isBooked: false },
          { start: "14:30", end: "15:00", isBooked: false },
          { start: "17:00", end: "17:30", isBooked: false },
        ],
        qualifications: [
          { degree: "MBBS", institute: "Maulana Azad Medical College", year: 2007 },
          { degree: "MS - Orthopedics", institute: "Safdarjung Hospital", year: 2011 },
        ],
        verificationStatus: "approved",
        isActive: true,
        isVerified: true,
        rating: { average: 4.7, count: 87 },
      },
      {
        name: "Sneha Reddy",
        email: "dr.sneha@medibook.pro",
        password,
        phone: "9876543215",
        role: "doctor",
        profilePhoto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&auto=format&fit=crop&q=80",
        specialization: "Neurologist",
        experience: 12,
        fees: 900,
        bio: "Specialist in headaches, epilepsy, neuromuscular conditions, and stroke management with advanced neuro-diagnostic protocols.",
        address: { clinic: "NeuroWellness Center", city: "Hyderabad", state: "Telangana" },
        availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
        timeSlots: [
          { start: "10:30", end: "11:00", isBooked: false },
          { start: "12:00", end: "12:30", isBooked: false },
          { start: "15:30", end: "16:00", isBooked: false },
        ],
        qualifications: [
          { degree: "MBBS", institute: "Osmania Medical College", year: 2010 },
          { degree: "MD - General Medicine", institute: "NIMS Hyderabad", year: 2014 },
          { degree: "DM - Neurology", institute: "NIMHANS Bengaluru", year: 2018 },
        ],
        verificationStatus: "approved",
        isActive: true,
        isVerified: true,
        rating: { average: 4.9, count: 76 },
      },
    ];

    await Doctor.insertMany(doctorsData);
    console.log(`Successfully seeded ${doctorsData.length} doctors into database!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding doctors:", error);
    process.exit(1);
  }
};

seedDoctors();
