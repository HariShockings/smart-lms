import { db } from './src/database/db.js';

async function testConnection() {
  try {
    const result = await db.raw('SELECT 1 + 1 AS result');
    console.log('Database connection successful:', result[0][0].result); // Should print 2
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection();