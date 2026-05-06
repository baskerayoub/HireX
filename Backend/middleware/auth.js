const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_hirex";

/**
 * JWT Authentication Middleware
 * Extracts Bearer token from Authorization header and verifies it.
 * Attaches decoded user payload to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g. 'Admin', 'Recruiter')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions." });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
