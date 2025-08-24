import express from 'express';
import { db } from '../database/db.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Temporary debug route - get all events (remove this in production)
router.get('/debug/all', async (req, res) => {
  try {
    const events = await db('calendar_events')
      .select('*')
      .orderBy('event_date', 'asc');
    
    console.log('Debug: All events in database:', events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ error: 'Failed to fetch all events' });
  }
});

// Get all calendar events for a user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching events for user ID:', userId);
    
    const events = await db('calendar_events')
      .select('*')
      .where('user_id', userId)
      .orderBy('event_date', 'asc');
    
    console.log('Found events:', events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get calendar events for a specific date range
router.get('/range', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const events = await db('calendar_events')
      .select('*')
      .where('user_id', userId)
      .whereBetween('event_date', [startDate, endDate])
      .orderBy('event_date', 'asc');
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events by range:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create a new calendar event
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, event_date, event_time, type, course_id, is_all_day } = req.body;
    
    console.log('Creating event for user ID:', userId);
    console.log('Event data:', { title, description, event_date, event_time, type, course_id, is_all_day });
    
    if (!title || !event_date || !type) {
      return res.status(400).json({ error: 'Title, event date, and type are required' });
    }
    
    const eventData = {
      title,
      description,
      event_date,
      event_time,
      type,
      course_id,
      user_id: userId,
      is_all_day: is_all_day || false
    };
    
    const [id] = await db('calendar_events').insert(eventData);
    
    const event = await db('calendar_events')
      .where('id', id)
      .first();
    
    console.log('Created event:', event);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Update a calendar event
router.put('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { title, description, event_date, event_time, type, course_id, is_all_day } = req.body;
    
    const event = await db('calendar_events')
      .where({ id: eventId, user_id: userId })
      .first();
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await db('calendar_events')
      .where({ id: eventId, user_id: userId })
      .update({
        title,
        description,
        event_date,
        event_time,
        type,
        course_id,
        is_all_day: is_all_day || false
      });
    
    const updatedEvent = await db('calendar_events')
      .where({ id: eventId, user_id: userId })
      .first();
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

// Delete a calendar event
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    
    const event = await db('calendar_events')
      .where({ id: eventId, user_id: userId })
      .first();
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await db('calendar_events')
      .where({ id: eventId, user_id: userId })
      .del();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

export default router;