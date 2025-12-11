import BookmarkCard from './BookmarkCard';
import '../styles/BookmarkList.css';

function BookmarkList({ bookmarks }) {
  if (bookmarks.length === 0) {
    return (
      <div className="bookmark-list-empty">
        <p>No bookmarks yet. Add your first bookmark!</p>
      </div>
    );
  }

  return (
    <div className="bookmark-list">
      <h2>All Bookmarks ({bookmarks.length})</h2>
      <div className="bookmark-grid">
        {bookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark._id} bookmark={bookmark} />
        ))}
      </div>
    </div>
  );
}

export default BookmarkList;
