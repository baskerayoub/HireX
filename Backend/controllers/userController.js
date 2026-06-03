const { users, project, meeting, contract, linkedin_token } = require("../models");
const bcrypt = require("bcrypt");

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Admin only." });
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await users.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: project,
          as: "Projects",
          attributes: ["id"]
        },
        {
          model: meeting,
          as: "Meetings",
          attributes: ["id"]
        },
        {
          model: contract,
          as: "Contracts",
          attributes: ["id"]
        },
        {
          model: linkedin_token,
          as: "LinkedInToken",
          attributes: ["id"]
        }
      ]
    });
    return res.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, password } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ error: "First name, email, and password are required" });
    }

    const existingUser = await users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await users.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "Recruiter",
      status: "Active",
      joinDate: new Date(),
      must_change_password: true,
    });

    const userObj = newUser.toJSON();
    delete userObj.password;

    return res.status(201).json({ message: "User created successfully", user: userObj });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, status, password } = req.body;

    const user = await users.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email.toLowerCase();
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
      updates.must_change_password = true;
    }

    await user.update(updates);
    
    const userObj = user.toJSON();
    delete userObj.password;

    return res.json({ message: "User updated successfully", user: userObj });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (String(id) === String(req.user.id)) {
        return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const user = await users.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
