import { db } from '../database/db.js';
import { classifyIntent, getResponseForIntent } from '../utils/chatbotNLP.js';

// Start a new chatbot conversation
export const startConversation = async (req, res) => {
  try {
    const { course_id } = req.body;
    
    // If course_id is provided, verify it exists and user is enrolled
    if (course_id) {
      const course = await db('courses').where('id', course_id).first();
      
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }
      
      // For students, check if they're enrolled
      if (req.user.role === 'student') {
        const enrollment = await db('enrollments')
          .where({
            user_id: req.user.id,
            course_id
          })
          .first();
        
        if (!enrollment) {
          return res.status(403).json({
            success: false,
            error: 'You are not enrolled in this course'
          });
        }
      }
      
      // For teachers, check if they created the course
      if (req.user.role === 'teacher' && course.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this course'
        });
      }
    }
    
    // Create a new conversation
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const [conversationId] = await db('chatbot_conversations').insert({
      user_id: req.user.id,
      course_id: course_id || null,
      session_id: sessionId,
      started_at: new Date()
    });
    
    // Add welcome message
    await db('chatbot_messages').insert({
      conversation_id: conversationId,
      sender_type: 'bot',
      message: course_id 
        ? `Hello! I'm your course assistant for this course. How can I help you today?` 
        : `Hello! I'm the Smart LMS assistant. How can I help you today?`,
      created_at: new Date()
    });
    
    // Get the conversation with the initial message
    const conversation = await db('chatbot_conversations')
      .where('id', conversationId)
      .first();
      
    const messages = await db('chatbot_messages')
      .where('conversation_id', conversationId)
      .orderBy('created_at', 'asc');
      
    res.status(201).json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Send message to chatbot
export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, message } = req.body;
    
    if (!message || message.trim() === '' || !conversation_id) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID and message are required'
      });
    }
    
    // Verify conversation exists and belongs to user
    const conversation = await db('chatbot_conversations')
      .where({
        id: conversation_id,
        user_id: req.user.id
      })
      .first();
      
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or unauthorized'
      });
    }
    
    // Store user message
    await db('chatbot_messages').insert({
      conversation_id,
      sender_type: 'user',
      message,
      created_at: new Date()
    });
    
    // Classify intent and get response
    const lowerCaseMessage = message.toLowerCase();
    const intent = await classifyIntent(lowerCaseMessage);
    const { staticResponse, dynamicResponse } = await getResponseForIntent(intent, message);
    const resolvedDynamicResponse = await dynamicResponse;
    
    // Prioritize dynamic response if available and not equal to the static response
    const botResponse = resolvedDynamicResponse && resolvedDynamicResponse !== staticResponse 
      ? resolvedDynamicResponse 
      : staticResponse;
    
    // Store single bot response
    await db('chatbot_messages').insert({
      conversation_id,
      sender_type: 'bot',
      message: botResponse,
      message_metadata: intent ? JSON.stringify({ intent }) : null,
      created_at: new Date()
    });
    
    // Get updated messages
    const messages = await db('chatbot_messages')
      .where('conversation_id', conversation_id)
      .orderBy('created_at', 'asc');
      
    res.status(200).json({
      success: true,
      response: botResponse,
      messages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get user's conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await db('chatbot_conversations')
      .leftJoin('courses', 'chatbot_conversations.course_id', 'courses.id')
      .where('chatbot_conversations.user_id', req.user.id)
      .select(
        'chatbot_conversations.*',
        'courses.title as course_title'
      )
      .orderBy('chatbot_conversations.started_at', 'desc');
      
    // For each conversation, get the last message
    for (let i = 0; i < conversations.length; i++) {
      const lastMessage = await db('chatbot_messages')
        .where('conversation_id', conversations[i].id)
        .orderBy('created_at', 'desc')
        .first();
        
      conversations[i].last_message = lastMessage || null;
    }
      
    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get single conversation with messages
export const getConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Verify conversation exists and belongs to user
    const conversation = await db('chatbot_conversations')
      .leftJoin('courses', 'chatbot_conversations.course_id', 'courses.id')
      .where('chatbot_conversations.id', conversationId)
      .where('chatbot_conversations.user_id', req.user.id)
      .select(
        'chatbot_conversations.*',
        'courses.title as course_title'
      )
      .first();
      
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or unauthorized'
      });
    }
    
    // Get messages
    const messages = await db('chatbot_messages')
      .where('conversation_id', conversationId)
      .orderBy('created_at', 'asc');
      
    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Verify conversation exists and belongs to the user
    const conversation = await db('chatbot_conversations')
      .where({
        id: conversationId,
        user_id: req.user.id
      })
      .first();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found or unauthorized'
      });
    }

    // Delete the conversation (messages are automatically deleted due to ON DELETE CASCADE)
    await db('chatbot_conversations')
      .where('id', conversationId)
      .del();

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};