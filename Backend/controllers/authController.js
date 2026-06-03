const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users } = require("../models");

// Default secret if not in env
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_hirex";

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await users.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ error: "Your account is inactive. Please contact an administrator." });
    }

    // Compare password (assuming old db might not have hashed passwords, we check both)
    // For migration, if it matches plain text, we should probably hash it later, but here we just check bcrypt or plain.
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    const isPlainMatch = password === user.password;

    if (!isMatch && !isPlainMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        must_change_password: user.must_change_password,
        avatar: user.avatar,
        country: user.country,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.signup = async (req, res) => {
  try {
    // In SmartHire they use firstName and lastName instead of just name. We'll map "name" to "firstName" if passed.
    const firstName = String(req.body.firstName || req.body.name || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();
    const role = "Recruiter"; // Default role

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const existingUser = await users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      status: "Active",
      joinDate: new Date(),
      must_change_password: false,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        country: newUser.country,
        bio: newUser.bio,
        location: newUser.location,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, country, bio, location } = req.body;

    const user = await users.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (country !== undefined) updates.country = country;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;

    // Handle avatar file upload
    if (req.file) {
      updates.avatar = req.file.filename;
    }

    await user.update(updates);

    return res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        country: user.country,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};
