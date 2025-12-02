import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  testAlert,
  processAllAlerts,
  clearTestResult,
  clearProcessResult,
} from '../store/slices/alertsSlice';
import { fetchFilters } from '../store/slices/filtersSlice';

const AlertManagement = () => {
  const dispatch = useDispatch();
  const { items, loading, error, testResult, processResult } = useSelector((state) => state.alerts);
  const { items: filters } = useSelector((state) => state.filters);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    filter_criteria_id: '',
    frequency: 'daily',
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchAlerts());
    dispatch(fetchFilters());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const alertData = {
      email: formData.email,
      filter_criteria_id: parseInt(formData.filter_criteria_id),
      frequency: formData.frequency,
      is_active: formData.is_active,
    };

    if (editingAlert) {
      dispatch(updateAlert({ id: editingAlert.id, data: alertData })).then(() => {
        setShowModal(false);
        resetForm();
        dispatch(fetchAlerts());
      });
    } else {
      dispatch(createAlert(alertData)).then(() => {
        setShowModal(false);
        resetForm();
        dispatch(fetchAlerts());
      });
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      email: alert.email,
      filter_criteria_id: alert.filter_criteria.id.toString(),
      frequency: alert.frequency,
      is_active: alert.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      dispatch(deleteAlert(id));
    }
  };

  const handleTest = (id) => {
    dispatch(testAlert({ id, data: { days: 7 } }));
  };

  const handleProcessAll = () => {
    if (window.confirm('This will process all active alerts and send emails. Continue?')) {
      dispatch(processAllAlerts({ days: 1 }));
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      filter_criteria_id: '',
      frequency: 'daily',
      is_active: true,
    });
    setEditingAlert(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Alert Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleProcessAll}>
            Process All Alerts
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Alert
          </button>
        </div>
      </div>

      {error && <div className="error">{error.message || 'An error occurred'}</div>}
      {testResult && (
        <div className={testResult.message.includes('success') ? 'success' : 'error'}>
          {testResult.message} {testResult.count && `(${testResult.count} items)`}
          <button
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => dispatch(clearTestResult())}
          >
            ×
          </button>
        </div>
      )}
      {processResult && (
        <div className="success">
          Processed {processResult.processed} alerts
          <button
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => dispatch(clearProcessResult())}
          >
            ×
          </button>
        </div>
      )}

      {loading && <div className="loading">Loading alerts...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>No alerts found. Create one to get started.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Filter</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Last Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.email}</td>
                  <td>{alert.filter_criteria?.name || 'N/A'}</td>
                  <td>{alert.frequency}</td>
                  <td>
                    <span className={alert.is_active ? 'badge badge-active' : 'badge badge-inactive'}>
                      {alert.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(alert.last_sent)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleTest(alert.id)}
                      >
                        Test
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleEdit(alert)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleDelete(alert.id)}
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
              <h2>{editingAlert ? 'Edit Alert' : 'Create Alert'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address:</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Filter:</label>
                <select
                  className="select"
                  value={formData.filter_criteria_id}
                  onChange={(e) => setFormData({ ...formData, filter_criteria_id: e.target.value })}
                  required
                >
                  <option value="">Select a filter</option>
                  {filters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Frequency:</label>
                <select
                  className="select"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="immediate">Immediate</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
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
                  {editingAlert ? 'Update' : 'Create'}
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

export default AlertManagement;

