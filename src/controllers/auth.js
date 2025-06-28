const {
  createUser,
  getUserByUsername,
  verifyPassword,
} = require("../models/user");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.validatedData;

    // Create user (model should hash password before storing)
    const user = await createUser({ username, email, password, full_name });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });
    console.log("Issued JWT Token:", token);
    logger.verbose(`New user registered: ${username}`);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    logger.critical("Registration error:", error);

    // Handle duplicate username/email (PostgreSQL unique_violation)
    if (
      error.code === "23505" &&
      error.detail &&
      error.detail.includes("already exists")
    ) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.validatedData;

    // Find user by username
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    logger.verbose(`User logged in: ${username}`);
    console.log("Issued JWT Token:", token);
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      token,
    });
  } catch (error) {
    logger.critical("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user profile
 * Assumes JWT middleware attaches the full user object to req.user.
 * If only userId is present, fetch user details from the database here.
 */
const getProfile = async (req, res) => {
  try {
    // If your JWT middleware attaches only userId, fetch user from DB here.
    // const user = await getUserById(req.user.userId);
    // Otherwise, if it attaches the full user, use as is:
    const user = req.user;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.critical("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
