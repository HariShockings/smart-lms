import { db } from '../database/db.js';

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
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
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
    
    // Generate bot response based on the course context
    let botResponse;
    
    // In a real implementation, this would use an AI/NLP service
    // For demo, we'll use some hardcoded responses based on keywords
    
    const lowerCaseMessage = message.toLowerCase();
    let responseText;
    
    // Check for course-specific context
    if (conversation.course_id) {
      const course = await db('courses').where('id', conversation.course_id).first();
      
      if (lowerCaseMessage.includes('quiz') || lowerCaseMessage.includes('test')) {
        responseText = `The next quiz for ${course.title} will be available soon. Make sure you've completed all the required readings and practice exercises.`;
      } else if (lowerCaseMessage.includes('assignment') || lowerCaseMessage.includes('homework')) {
        responseText = `For the current assignment in ${course.title}, focus on applying the concepts we've covered in the recent lessons. Remember to check the rubric for grading criteria.`;
      } else if (lowerCaseMessage.includes('deadline') || lowerCaseMessage.includes('due date')) {
        responseText = `The next deadline for ${course.title} is this Friday at 11:59 PM. You can find all deadlines in the course calendar.`;
      } else {
        responseText = `I'm here to help with any questions about ${course.title}. You can ask about assignments, quizzes, deadlines, or specific topics covered in the course.`;
      }
    } else {
      // General responses
      if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        responseText = `Hello! How can I assist you with your studies today?`;
      } else if (lowerCaseMessage.includes('course') && lowerCaseMessage.includes('enroll')) {
        responseText = `To enroll in a course, go to the Courses page, find the course you're interested in, and click the Enroll button. Let me know if you need help finding a specific course.`;
      } else if (lowerCaseMessage.includes('password')) {
        responseText = `You can change your password in the Profile settings. Go to your profile page and click on the Change Password option.`;
      } else if (lowerCaseMessage.includes('mentor') || lowerCaseMessage.includes('mentoring')) {
        responseText = `Our peer mentoring program matches high-performing students with those who might need additional support. Check your Dashboard or the Mentoring section to see your current mentoring relationships.`;
      } else {
        responseText = `I'm your Smart LMS assistant. I can help with questions about courses, assignments, quizzes, and using the platform. What would you like to know more about?`;
      }
    }
    
    // Store bot response
    const [botMessageId] = await db('chatbot_messages').insert({
      conversation_id,
      sender_type: 'bot',
      message: responseText,
      created_at: new Date()
    });
    
    // Get updated messages
    const messages = await db('chatbot_messages')
      .where('conversation_id', conversation_id)
      .orderBy('created_at', 'asc');
      
    res.status(200).json({
      success: true,
      data: {
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