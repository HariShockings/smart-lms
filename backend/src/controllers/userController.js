import { db } from '../database/db.js';
import bcrypt from 'bcrypt';

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'bio', 'is_active', 'created_at');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get single user
export const getUser = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.params.id })
      .select('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'bio', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

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

// Update user
export const updateUser = async (req, res) => {
  try {
    // Check if the user is updating their own profile or is an admin
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user'
      });
    }

    const { first_name, last_name, bio, profile_picture } = req.body;
    
    const updatedUser = await db('users')
      .where({ id: req.params.id })
      .update({
        first_name,
        last_name,
        bio,
        profile_picture
      }, ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'bio']);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    // Check if the user is changing their own password or is an admin
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to change this user\'s password'
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await db('users').where({ id: req.params.id }).first();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If not admin, verify current password
    if (req.user.role !== 'admin') {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db('users')
      .where({ id: req.params.id })
      .update({ password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.params.id })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await db('users')
      .where({ id: req.params.id })
      .del();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};