import express from 'express';
import { db } from '../database/db.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Get user settings
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let settings = await db('user_settings')
      .where('user_id', userId)
      .first();
    
    // If no settings exist, create default settings
    if (!settings) {
      const [newSettings] = await db('user_settings')
        .insert({
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          timezone: 'UTC',
          language: 'en',
          dark_mode: false,
          preferences: JSON.stringify({})
        })
        .returning('*');
      
      settings = newSettings;
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// Update user settings
router.put('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email_notifications,
      push_notifications,
      sms_notifications,
      timezone,
      language,
      dark_mode,
      preferences
    } = req.body;
    
    const updateData = {};
    
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (sms_notifications !== undefined) updateData.sms_notifications = sms_notifications;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (dark_mode !== undefined) updateData.dark_mode = dark_mode;
    if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences);
    
    const [updatedSettings] = await db('user_settings')
      .where('user_id', userId)
      .update(updateData)
      .returning('*');
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

// Update specific setting
router.patch('/:setting', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const setting = req.params.setting;
    const value = req.body.value;
    
    // Validate setting name
    const allowedSettings = [
      'email_notifications',
      'push_notifications',
      'sms_notifications',
      'timezone',
      'language',
      'dark_mode'
    ];
    
    if (!allowedSettings.includes(setting)) {
      return res.status(400).json({ error: 'Invalid setting name' });
    }
    
    const updateData = {};
    updateData[setting] = value;
    
    const [updatedSettings] = await db('user_settings')
      .where('user_id', userId)
      .update(updateData)
      .returning('*');
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Update user preferences
router.patch('/preferences/:key', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const key = req.params.key;
    const value = req.body.value;
    
    const settings = await db('user_settings')
      .where('user_id', userId)
      .first();
    
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    
    let preferences = {};
    try {
      preferences = JSON.parse(settings.preferences || '{}');
    } catch (e) {
      preferences = {};
    }
    
    preferences[key] = value;
    
    const [updatedSettings] = await db('user_settings')
      .where('user_id', userId)
      .update({
        preferences: JSON.stringify(preferences)
      })
      .returning('*');
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Reset user settings to defaults
router.post('/reset', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [resetSettings] = await db('user_settings')
      .where('user_id', userId)
      .update({
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        timezone: 'UTC',
        language: 'en',
        dark_mode: false,
        preferences: JSON.stringify({})
      })
      .returning('*');
    
    res.json(resetSettings);
  } catch (error) {
    console.error('Error resetting user settings:', error);
    res.status(500).json({ error: 'Failed to reset user settings' });
  }
});

// Get available timezones
router.get('/timezones', (req, res) => {
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];
  
  res.json(timezones);
});

// Get available languages
router.get('/languages', (req, res) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' }
  ];
  
  res.json(languages);
});

export default router;
