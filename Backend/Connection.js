const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./models");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const profileRoutes = require("./routes/profileRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const aiRoutes = require("./routes/aiRoutes");
const linkedinRoutes = require("./routes/linkedinRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (CVs)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ═══════════════════════════════════════════════════
// API Routes
// ═══════════════════════════════════════════════════
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/linkedin", linkedinRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal server error" });
});

// Start server
if (require.main === module) {
  db.sequelize.authenticate()
    .then(() => {
      console.log("✅ Sequelize connected to MySQL");
      return db.sequelize.sync({ alter: true });
    })
    .then(() => {
      console.log("✅ Database synced");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MySQL connection error:", err.message);
    });
}

module.exports = app;
