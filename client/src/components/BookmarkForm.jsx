import { useState } from 'react';
import '../styles/BookmarkForm.css';

function BookmarkForm({ onBookmarkAdded }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Convert tags from comma-separated string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const bookmarkData = {
        url: formData.url,
        title: formData.title,
        description: formData.description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        collectionId: null
      };

      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmarkData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save bookmark');
      }

      const newBookmark = await response.json();

      // Reset form
      setFormData({
        url: '',
        title: '',
        description: '',
        tags: '',
      });

      // Collapse form after successful submission
      setIsExpanded(false);

      // Notify parent component
      if (onBookmarkAdded) {
        onBookmarkAdded(newBookmark);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving bookmark:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bookmark-form-container">
      <button
        className="bookmark-form-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? '− Hide Form' : '+ Add Bookmark'}
      </button>

      {isExpanded && (
        <form className="bookmark-form" onSubmit={handleSubmit}>
          {error && (
            <div className="bookmark-form-error">
              <p>{error}</p>
            </div>
          )}

          <div className="bookmark-form-group">
            <label htmlFor="url">URL *</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="bookmark-form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Page title"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="bookmark-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the bookmark"
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div className="bookmark-form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="javascript, react, tutorial (comma-separated)"
              disabled={isSubmitting}
            />
          </div>

          <div className="bookmark-form-actions">
            <button
              type="submit"
              className="bookmark-form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Bookmark'}
            </button>
            <button
              type="button"
              className="bookmark-form-cancel"
              onClick={() => setIsExpanded(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default BookmarkForm;
