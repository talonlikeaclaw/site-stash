# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Site Stash is a bookmark management application with collections support. The project uses a monorepo structure with separate client and server directories.

**Tech Stack:**
- **Server**: Node.js (ES modules), Express 5, MongoDB
- **Client**: React 19, Vite
- **Testing**: Mocha + Chai + Sinon (server)

## Commands

### Development

```bash
# Start server in development mode (with file watching)
cd server && npm run dev

# Start client development server
cd client && npm run dev

# Build the full application
npm run build  # Builds client and installs dependencies
```

### Testing

```bash
# Run all server tests
cd server && npm test

# Run tests with custom timeout (default is 10s)
cd server && npm run test -- --timeout 5000
```

### Linting

```bash
# Lint server code
cd server && npm run lint

# Lint client code
cd client && npm run lint
```

### Production

```bash
# Start server in production mode
npm start  # or: cd server && npm start
```

## Architecture

### Server Architecture

The server follows an Express-based REST API pattern with a singleton database manager.

**Key Components:**

1. **Entry Point** (`server/bin/www`):
   - Connects to MongoDB on startup
   - Requires `DB_NAME` environment variable
   - Implements graceful shutdown handlers for SIGTERM/SIGINT

2. **Database Layer** (`server/models/db.js`):
   - **Singleton pattern**: Single `DB` class instance manages all database operations
   - **Collection switching**: Use `db.setCollection(name)` before operations
   - Common methods: `find()`, `findOne()`, `create()`, `createMany()`, `aggregate()`, `dropAndSeed()`
   - Default projection removes `_id` field unless specified otherwise

3. **Routes** (`server/routes/`):
   - Each route file exports an Express router
   - Routes must call `db.setCollection()` before database operations
   - Current routes:
     - `bookmarks.js`: GET /api/bookmarks (list bookmarks), POST /api/bookmarks (create bookmark)
     - `collections.js`: Empty router (placeholder)

4. **Application** (`server/app.js`):
   - Configures middleware: compression, JSON parsing, URL encoding
   - Mounts routes at `/api/*` paths
   - Serves client static files from `../client/dist`
   - Includes health check endpoint at `/api/health`

### Client Architecture

React 19 + Vite application with component-based architecture and CSS modules. Built as static files and served by Express in production.

**File Structure:**

```
client/src/
├── App.jsx              # Main app component with bookmark fetching logic
├── App.css              # App layout, header, loading, and error states
├── index.css            # Global styles, typography, dark/light mode
├── components/
│   ├── BookmarkList.jsx # Bookmark list container and grid
│   ├── BookmarkCard.jsx # Individual bookmark card component
│   └── BookmarkForm.jsx # Bookmark creation form
└── styles/
    ├── BookmarkList.css # List and grid styles
    ├── BookmarkCard.css # Card styles with hover effects
    └── BookmarkForm.css # Form styles
```

**Component Architecture:**

1. **App.jsx**: Root component that fetches bookmarks from `/api/bookmarks`, manages loading/error states, and includes the bookmark form. Exposes `fetchBookmarks()` helper function for refreshing the list.
2. **BookmarkForm.jsx**: Form for creating new bookmarks with URL, title, and description inputs
3. **BookmarkList.jsx**: Displays bookmarks in a responsive grid, handles empty state
4. **BookmarkCard.jsx**: Displays individual bookmark with favicon, title, description, domain, date, and tags

**Styling Conventions:**

- **Dark mode by default**: Primary color scheme is dark (`#242424` background)
- **Light mode support**: Uses `@media (prefers-color-scheme: light)` for automatic theme switching
- **Contrast requirements**: All text meets WCAG AA standards (4.5:1 minimum)
- **Mobile-first responsive**: Breakpoint at `768px` for mobile/tablet
- **Layout stability**: Fixed heights prevent layout shift during loading
- **Box model**: Global `box-sizing: border-box` for consistent sizing

**Key Design Patterns:**

- **White cards on dark background**: Bookmark cards maintain white backgrounds in both themes for content focus
- **Reserved space**: Loading, error, and content states have matching `min-height` to prevent title shift
- **Text overflow handling**: Long URLs/domains truncate with ellipsis, descriptions wrap properly
- **Mobile optimization**: Single-column layout, reduced padding, stacked meta info on mobile

**Color Palette:**

- Dark mode background: `#242424`
- Dark mode text: `#f9fafb` (headings), `#4b5563` (body on white)
- Light mode background: `#f5f5f5`
- Light mode text: `#1f2937` (headings), `#4b5563` (body)
- Accent: `#2563eb` (links, tags)
- Error: `#fca5a5` (dark mode), `#dc2626` (light mode)

### Testing Pattern

Tests use Sinon to stub database operations rather than connecting to a real database:

```javascript
// Standard test setup pattern
before(() => {
  setCollectionStub = sinon.stub(db, 'setCollection');
  createStub = sinon.stub(db, 'create');
});

afterEach(() => {
  // Restore stubs after each test
  setCollectionStub.restore();
});
```

## Environment Variables

Required environment variables (see `server/.env.example`):

- `ATLAS_URI`: MongoDB connection string
- `DB_NAME`: Database name to connect to
- `PORT`: Server port (defaults to 3000)
- `NODE_ENV`: Environment mode (defaults to 'development')

## Important Patterns

### Adding a New Route

1. Create router file in `server/routes/`
2. Import and use `db` from `../models/db.js`
3. Always call `db.setCollection('collection_name')` at the start of each route handler
4. Import router in `server/app.js` and mount with `app.use()`

### Database Operations

```javascript
import { db } from '../models/db.js';

// Switch to the target collection
db.setCollection('bookmarks');

// Perform operations
const result = await db.create(item);
const items = await db.find({ key: 'value' });
```

### Adding Client Styles

When adding new components or modifying styles:

1. **Maintain theme consistency**: Always provide both dark and light mode colors
2. **Use the established color palette**: Reference existing colors from `index.css` and component CSS files
3. **Check contrast ratios**: Use WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
4. **Add mobile breakpoints**: Include `@media (max-width: 768px)` for responsive behavior
5. **Prevent layout shift**: Use `min-height` and `box-sizing: border-box` for stable layouts
6. **Handle text overflow**: Use `text-overflow: ellipsis`, `word-wrap: break-word`, or `overflow-wrap: break-word` as appropriate

Example pattern for dark/light mode:

```css
.my-component {
  color: #f9fafb;  /* Light text for dark mode */
  background-color: #1f2937;  /* Dark background */
}

@media (prefers-color-scheme: light) {
  .my-component {
    color: #1f2937;  /* Dark text for light mode */
    background-color: #f9fafb;  /* Light background */
  }
}
```

