import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';

// Register user
export const register = async (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db('users')
      .where({ email })
      .orWhere({ username })
      .first();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with that email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [userId] = await db('users').insert({
      username,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: role || 'student'
    });

    const user = await db('users').where({ id: userId }).first();

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    delete user.password;

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await db('users').where({ email }).first();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'bio')
      .first();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};