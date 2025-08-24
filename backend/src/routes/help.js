import express from 'express';
import { db } from '../database/db.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Get all help articles (public route)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    
    let query = db('help_articles')
      .select('*')
      .where('is_published', true);
    
    // Filter by category
    if (category) {
      query = query.where('category', category);
    }
    
    // Search functionality
    if (search) {
      query = query.where(function() {
        this.where('title', 'ilike', `%${search}%`)
             .orWhere('content', 'ilike', `%${search}%`)
             .orWhere('tags', 'ilike', `%${search}%`);
      });
    }
    
    // Pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));
    
    const articles = await query.orderBy('view_count', 'desc');
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching help articles:', error);
    res.status(500).json({ error: 'Failed to fetch help articles' });
  }
});

// Get help article by ID
router.get('/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    
    const article = await db('help_articles')
      .where({ id: articleId, is_published: true })
      .first();
    
    if (!article) {
      return res.status(404).json({ error: 'Help article not found' });
    }
    
    // Increment view count
    await db('help_articles')
      .where('id', articleId)
      .increment('view_count', 1);
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching help article:', error);
    res.status(500).json({ error: 'Failed to fetch help article' });
  }
});

// Get help categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await db('help_articles')
      .select('category')
      .where('is_published', true)
      .distinct();
    
    const categoryList = categories.map(cat => cat.category);
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get popular help articles
router.get('/popular/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const articles = await db('help_articles')
      .select('id', 'title', 'category', 'view_count')
      .where('is_published', true)
      .orderBy('view_count', 'desc')
      .limit(parseInt(limit));
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    res.status(500).json({ error: 'Failed to fetch popular articles' });
  }
});

// Search help articles
router.get('/search/query', async (req, res) => {
  try {
    const { q, category, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let query = db('help_articles')
      .select('id', 'title', 'category', 'tags', 'view_count')
      .where('is_published', true)
      .where(function() {
        this.where('title', 'ilike', `%${q}%`)
             .orWhere('content', 'ilike', `%${q}%`)
             .orWhere('tags', 'ilike', `%${q}%`);
      });
    
    if (category) {
      query = query.where('category', category);
    }
    
    const articles = await query
      .orderBy('view_count', 'desc')
      .limit(parseInt(limit));
    
    res.json(articles);
  } catch (error) {
    console.error('Error searching help articles:', error);
    res.status(500).json({ error: 'Failed to search help articles' });
  }
});

// Admin routes (protected)
// Create new help article
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create help articles' });
    }
    
    const [article] = await db('help_articles')
      .insert({
        title,
        content,
        category,
        tags,
        created_by: req.user.id,
        is_published: true
      })
      .returning('*');
    
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating help article:', error);
    res.status(500).json({ error: 'Failed to create help article' });
  }
});

// Update help article
router.put('/:id', protect, async (req, res) => {
  try {
    const articleId = req.params.id;
    const { title, content, category, tags, is_published } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update help articles' });
    }
    
    const article = await db('help_articles')
      .where('id', articleId)
      .first();
    
    if (!article) {
      return res.status(404).json({ error: 'Help article not found' });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (is_published !== undefined) updateData.is_published = is_published;
    
    const [updatedArticle] = await db('help_articles')
      .where('id', articleId)
      .update(updateData)
      .returning('*');
    
    res.json(updatedArticle);
  } catch (error) {
    console.error('Error updating help article:', error);
    res.status(500).json({ error: 'Failed to update help article' });
  }
});

// Delete help article
router.delete('/:id', protect, async (req, res) => {
  try {
    const articleId = req.params.id;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete help articles' });
    }
    
    const article = await db('help_articles')
      .where('id', articleId)
      .first();
    
    if (!article) {
      return res.status(404).json({ error: 'Help article not found' });
    }
    
    await db('help_articles')
      .where('id', articleId)
      .del();
    
    res.json({ message: 'Help article deleted successfully' });
  } catch (error) {
    console.error('Error deleting help article:', error);
    res.status(500).json({ error: 'Failed to delete help article' });
  }
});

export default router;
