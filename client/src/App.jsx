import { useState, useEffect } from 'react';
import BookmarkList from './components/BookmarkList';
import './App.css';

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookmarks on component mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bookmarks');

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      setBookmarks(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Site Stash</h1>
      </header>

      <main className="app-main">
        {loading && <div className="loading">Loading bookmarks...</div>}

        {error && (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={fetchBookmarks}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <BookmarkList bookmarks={bookmarks} />
        )}
      </main>
    </div>
  );
}

export default App;
