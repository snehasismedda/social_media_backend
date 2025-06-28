const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// TODO: Implement findUsersByName function for search functionality
/**
 * Search users by username or full name (case-insensitive, paginated)
 * @param {string} name - Search term
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of user objects
 */
const findUsersByName = async (name, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, email, full_name, created_at
      FROM users
      WHERE username ILIKE '%' || $1 || '%' OR full_name ILIKE '%' || $1 || '%'
      ORDER BY username
      LIMIT $2 OFFSET $3`,
    [name, limit, offset]
  );
  return result.rows;
};


// TODO: Implement getUserProfile function that includes follower/following counts

/**
 * Get user profile with follower and following counts
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile object or null
 */
const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.full_name, u.created_at,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
      FROM users u
      WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};


// TODO: Implement updateUserProfile function for profile updates


/**
 * Update user profile fields (username, email, full_name, password)
 * @param {number} userId - User ID
 * @param {Object} updateFields - Fields to update
 * @returns {Promise<Object|null>} Updated user object or null
 */
const updateUserProfile = async (userId, updateFields) => {
  const { username, email, full_name, password } = updateFields;
  const fields = [];
  const values = [];
  let idx = 1;

  if (username !== undefined) {
    fields.push(`username = $${idx++}`);
    values.push(username);
  }
  if (email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(email);
  }
  if (full_name !== undefined) {
    fields.push(`full_name = $${idx++}`);
    values.push(full_name);
  }
  if (password !== undefined) {
    fields.push(`password_hash = $${idx++}`);
    values.push(password);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(userId);
  const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, username, email, full_name, created_at`;

  const result = await query(sql, values);
  return result.rows[0] || null;
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
};

