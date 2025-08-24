# Backend Setup Guide

This guide explains how to set up the backend database and run the API server for the Smart LMS application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

## Database Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Configuration

Create a `.env` file in the `backend` directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=smart_lms
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Run Database Migrations

```bash
# Run all migrations
npm run migrate

# Or run specific migration
npm run migrate:up
```

### 4. Seed the Database

```bash
# Run all seed files
npm run seed

# Or run specific seed file
npm run seed:run 19_calendar_events.js
```

## New Database Tables Created

The following new tables have been added to support the frontend pages:

### Calendar Events (`calendar_events`)
- Stores user calendar events, assignments, quizzes, and deadlines
- Links to courses and users
- Supports different event types

### Grades (`grades`)
- Stores student grades for assignments, quizzes, and projects
- Links to courses, assignments, and users
- Includes feedback and scoring information

### Messages (`messages`)
- Stores user-to-user messages
- Tracks read status and timestamps
- Supports conversation threading

### User Settings (`user_settings`)
- Stores user preferences and notification settings
- Includes timezone, language, and display preferences
- JSON field for custom preferences

### Help Articles (`help_articles`)
- Stores help content and FAQs
- Categorized and searchable
- Tracks view counts and publication status

## API Endpoints

### Calendar API (`/api/calendar`)
- `GET /` - Get user's calendar events
- `GET /range` - Get events by date range
- `POST /` - Create new event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event

### Grades API (`/api/grades`)
- `GET /` - Get user's grades
- `GET /course/:courseId` - Get grades by course
- `GET /summary` - Get grade summary
- `GET /type/:type` - Get grades by type
- `GET /stats` - Get grade statistics

### Messages API (`/api/messages`)
- `GET /conversations` - Get user conversations
- `GET /conversation/:otherUserId` - Get conversation with user
- `POST /` - Send message
- `PUT /:id/read` - Mark message as read
- `GET /unread/count` - Get unread count
- `DELETE /:id` - Delete message

### Settings API (`/api/settings`)
- `GET /` - Get user settings
- `PUT /` - Update settings
- `PATCH /:setting` - Update specific setting
- `PATCH /preferences/:key` - Update preference
- `POST /reset` - Reset to defaults
- `GET /timezones` - Get available timezones
- `GET /languages` - Get available languages

### Help API (`/api/help`)
- `GET /` - Get help articles
- `GET /:id` - Get specific article
- `GET /categories/list` - Get categories
- `GET /popular/list` - Get popular articles
- `GET /search/query` - Search articles
- `POST /` - Create article (admin only)
- `PUT /:id` - Update article (admin only)
- `DELETE /:id` - Delete article (admin only)

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on port 5000 (or the port specified in your .env file).

## Testing the API

You can test the API endpoints using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Example API Call

```bash
# Get calendar events (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/calendar

# Get help articles (public endpoint)
curl http://localhost:5000/api/help
```

## Database Schema

The database schema includes relationships between:
- Users (students, teachers, admins)
- Courses
- Assignments and Quizzes
- Grades and Calendar Events
- Messages and User Settings
- Help Articles

All tables include proper foreign key constraints and timestamps for data integrity.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `.env` file configuration
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **Migration Errors**
   - Ensure all previous migrations have run successfully
   - Check database permissions
   - Verify table names don't conflict

3. **Seed Data Issues**
   - Ensure migrations have run first
   - Check foreign key relationships
   - Verify data format matches schema

### Reset Database

If you need to start fresh:

```bash
# Drop all tables and recreate
npm run migrate:down
npm run migrate:up
npm run seed
```

## Next Steps

After setting up the backend:

1. Update the frontend API service URLs if needed
2. Test all API endpoints
3. Verify data is being fetched correctly in the frontend
4. Implement error handling and loading states
5. Add real-time features (WebSocket) if needed
