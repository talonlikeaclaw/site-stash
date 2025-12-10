import express from 'express';
import compression from 'compression';
import bookmarkRoutes from './routes/bookmarks.js';
import collectionRoutes from './routes/collections.js';

const app = express();

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/collections', collectionRoutes)

// Health check
app.use('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static Files
app.use(express.static('../client/dist'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
