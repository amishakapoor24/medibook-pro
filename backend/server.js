const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { logger, errorHandler } = require("./middleware/errorHandler");

dotenv.config();
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "CLIENT_URL"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}
connectDB();

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(logger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/assistant", require("./routes/assistantRoutes"));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediBook Pro API is running 🏥",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

// Socket.io - Real-time chat & notifications
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // User joins with their userId
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`✅ User ${userId} joined`);
  });

  // Join appointment chat room
  socket.on("join_chat", (appointmentId) => {
    socket.join(`chat_${appointmentId}`);
    console.log(`💬 Joined chat room: ${appointmentId}`);
  });

  // Send message in real-time
  socket.on("send_message", (data) => {
    io.to(`chat_${data.appointmentId}`).emit("receive_message", data);
  });

  // Send real-time notification
  socket.on("send_notification", ({ userId, notification }) => {
    io.to(userId).emit("receive_notification", notification);
  });

  socket.on("disconnect", () => {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
