import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNews, fetchNewsFromAPI } from '../store/slices/newsSlice';

const NewsList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.news);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [fetchParams, setFetchParams] = useState({
    category: '',
    query: '',
    page_size: 100,
  });

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const handleFetchNews = () => {
    dispatch(fetchNewsFromAPI(fetchParams)).then(() => {
      setShowFetchModal(false);
      dispatch(fetchNews());
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>News Articles</h2>
        <button className="btn btn-primary" onClick={() => setShowFetchModal(true)}>
          Fetch Latest News
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {
            error.detail || 
            error.message || 
            (typeof error === 'string' ? error : 'Failed to load news. Please check if the backend server is running.')
          }
          <br />
          <small>error connecting to the news api provider.</small>
        </div>
      )}

      {loading && <div className="loading">Loading news...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>No news articles found. Click "Fetch Latest News" to get started.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="news-grid">
          {items.map((item) => (
            <div key={item.id} className="news-item">
              <h3>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <div className="meta">
                <span className="source">{item.source}</span>
                {item.author && <span> • {item.author}</span>}
                {item.published_at && <span> • {formatDate(item.published_at)}</span>}
              </div>
              {item.description && (
                <div className="description">
                  {item.description.length > 200
                    ? `${item.description.substring(0, 200)}...`
                    : item.description}
                </div>
              )}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{ width: '100%', marginTop: '10px', borderRadius: '4px' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              {item.keywords && item.keywords.length > 0 && (
                <div className="tags">
                  {item.keywords.map((keyword, idx) => (
                    <span key={idx} className="tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showFetchModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Fetch News from API</h2>
              <button className="close-btn" onClick={() => setShowFetchModal(false)}>
                ×
              </button>
            </div>
            <div className="form-group">
              <label>Category (optional):</label>
              <select
                className="select"
                value={fetchParams.category}
                onChange={(e) => setFetchParams({ ...fetchParams, category: e.target.value })}
              >
                <option value="">None</option>
                <option value="business">Business</option>
                <option value="entertainment">Entertainment</option>
                <option value="general">General</option>
                <option value="health">Health</option>
                <option value="science">Science</option>
                <option value="sports">Sports</option>
                <option value="technology">Technology</option>
              </select>
            </div>
            <div className="form-group">
              <label>Search Query (optional):</label>
              <input
                type="text"
                className="input"
                value={fetchParams.query}
                onChange={(e) => setFetchParams({ ...fetchParams, query: e.target.value })}
                placeholder="e.g., technology, climate"
              />
            </div>
            <div className="form-group">
              <label>Page Size:</label>
              <input
                type="number"
                className="input"
                value={fetchParams.page_size}
                onChange={(e) => setFetchParams({ ...fetchParams, page_size: parseInt(e.target.value) || 100 })}
                min="1"
                max="100"
              />
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleFetchNews}>
                Fetch News
              </button>
              <button className="btn btn-secondary" onClick={() => setShowFetchModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsList;

