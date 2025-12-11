import '../styles/BookmarkCard.css';

function BookmarkCard({ bookmark }) {
  const { url, title, description, tags, createdAt } = bookmark;

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Extract domain from URL for favicon
  const getDomain = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  };

  const domain = getDomain(url);

  return (
    <div className="bookmark-card">
      <div className="bookmark-card-header">
        <div className="bookmark-favicon">
          {domain && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
              alt={`${domain} favicon`}
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bookmark-title"
        >
          {title}
        </a>
      </div>

      {description && (
        <p className="bookmark-description">{description}</p>
      )}

      <div className="bookmark-meta">
        <span className="bookmark-domain">{domain}</span>
        <span className="bookmark-date">{formatDate(createdAt)}</span>
      </div>

      {tags && tags.length > 0 && (
        <div className="bookmark-tags">
          {tags.map((tag, index) => (
            <span key={index} className="bookmark-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarkCard;
