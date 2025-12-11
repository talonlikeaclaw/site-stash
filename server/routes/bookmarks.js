import express from 'express';
import { db } from '../models/db.js';

const router = express.Router();

/**
 * POST /api/bookmarks
 * Create a new bookmark
 */
router.post('/', async (req, res) => {
  try {
    db.setCollection('bookmarks');
    const { url, title, description, tags, collectionId } = req.body;

    // Validation
    if (!url || !title) {
      return res.status(400).json({ error: 'URL and title are required' });
    }

    // URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const bookmark = {
      url,
      title,
      description: description || '',
      tags: tags || [],
      collectionId: collectionId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.create(bookmark);
    const newBookmark = await db.findOne({ _id: result.insertedId });

    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    next(error);
  }
});

export default router;
