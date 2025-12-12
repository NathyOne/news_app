import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFilters,
  createFilter,
  updateFilter,
  deleteFilter,
  applyFilter,
  clearFilteredNews,
} from '../store/slices/filtersSlice';

const FilterManagement = () => {
  const dispatch = useDispatch();
  const { items, loading, error, filteredNews, filteredCount } = useSelector((state) => state.filters);
  const [showModal, setShowModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    sources: '',
    categories: '',
    is_active: true,
  });
  const [showFilteredResults, setShowFilteredResults] = useState(false);

  useEffect(() => {
    dispatch(fetchFilters());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filterData = {
      name: formData.name,
      keywords: formData.keywords.split(',').map((k) => k.trim()).filter((k) => k),
      sources: formData.sources.split(',').map((s) => s.trim()).filter((s) => s),
      categories: formData.categories.split(',').map((c) => c.trim()).filter((c) => c),
      is_active: formData.is_active,
    };

    if (editingFilter) {
      dispatch(updateFilter({ id: editingFilter.id, data: filterData })).then(() => {
        setShowModal(false);
        resetForm();
        dispatch(fetchFilters());
      });
    } else {
      dispatch(createFilter(filterData)).then(() => {
        setShowModal(false);
        resetForm();
        dispatch(fetchFilters());
      });
    }
  };

  const handleEdit = (filter) => {
    setEditingFilter(filter);
    setFormData({
      name: filter.name,
      keywords: filter.keywords.join(', '),
      sources: filter.sources.join(', '),
      categories: filter.categories.join(', '),
      is_active: filter.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this filter?')) {
      dispatch(deleteFilter(id));
    }
  };

  const handleApply = (id) => {
    dispatch(applyFilter({ id, data: { days: 7 } })).then(() => {
      setShowFilteredResults(true);
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      keywords: '',
      sources: '',
      categories: '',
      is_active: true,
    });
    setEditingFilter(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (showFilteredResults && filteredNews.length > 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Filtered News Results ({filteredCount})</h2>
          <button className="btn btn-secondary" onClick={() => {
            setShowFilteredResults(false);
            dispatch(clearFilteredNews());
          }}>
            Back to Filters
          </button>
        </div>
        <div className="news-grid">
          {filteredNews.map((item) => (
            <div key={item.id} className="news-item">
              <h3>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <div className="meta">
                <span className="source">{item.source}</span>
                {item.published_at && <span> • {new Date(item.published_at).toLocaleString()}</span>}
              </div>
              {item.description && (
                <div className="description">
                  {item.description.length > 200
                    ? `${item.description.substring(0, 200)}...`
                    : item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Filter Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Filter
        </button>
      </div>

      {error && <div className="error">{error.message || 'An error occurred'}</div>}

      {loading && <div className="loading">Loading filters...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>No filters found. Create one to get started.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Keywords</th>
                <th>Sources</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((filter) => (
                <tr key={filter.id}>
                  <td>{filter.name}</td>
                  <td>
                    <div className="filter-tags">
                      {filter.keywords.map((keyword, idx) => (
                        <span key={idx} className="filter-tag">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {filter.sources.length > 0 ? filter.sources.join(', ') : 'All'}
                  </td>
                  <td>
                    {filter.categories.length > 0 ? filter.categories.join(', ') : 'All'}
                  </td>
                  <td>
                    <span className={filter.is_active ? 'badge badge-active' : 'badge badge-inactive'}>
                      {filter.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleApply(filter.id)}
                      >
                        Apply
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleEdit(filter)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleDelete(filter.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingFilter ? 'Edit Filter' : 'Create Filter'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Filter Name:</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Keywords (comma-separated):</label>
                <input
                  type="text"
                  className="input"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., technology, AI, machine learning"
                />
              </div>
              <div className="form-group">
                <label>Sources (comma-separated, optional):</label>
                <input
                  type="text"
                  className="input"
                  value={formData.sources}
                  onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
                  placeholder="e.g., BBC News, CNN"
                />
              </div>
              <div className="form-group">
                <label>Categories (comma-separated, optional):</label>
                <input
                  type="text"
                  className="input"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  placeholder="e.g., technology, business"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  {' '}Active
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingFilter ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterManagement;

