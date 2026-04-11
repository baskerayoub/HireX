const express = require("express");
const db = require("./Connection");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function handleDatabaseError(err, res) {
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      error: "Email already exists",
    });
  }

  return res.status(500).json({
    error: err.message,
  });
}

router.post("/api/login", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  db.query(
    "SELECT id, name, email FROM users WHERE email = ? AND password = ? LIMIT 1",
    [email, password],
    (err, result) => {
      if (err) {
        return handleDatabaseError(err, res);
      }

      if (result.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      return res.json({
        message: "Login successful",
        user: result[0],
      });
    }
  );
});

router.post("/api/signup", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "").trim();

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Name, email and password are required",
    });
  }

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (err, result) => {
      if (err) {
        return handleDatabaseError(err, res);
      }

      return res.status(201).json({
        message: "Account created successfully",
        user: {
          id: result.insertId,
          name,
          email,
        },
      });
    }
  );
});

module.exports = router;
