import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlertHistory } from '../store/slices/alertHistorySlice';
import { fetchAlerts } from '../store/slices/alertsSlice';

const AlertHistory = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.alertHistory);
  const { items: alerts } = useSelector((state) => state.alerts);
  const [selectedAlert, setSelectedAlert] = useState('');

  useEffect(() => {
    dispatch(fetchAlerts());
    dispatch(fetchAlertHistory(selectedAlert ? { alert: selectedAlert } : {}));
  }, [dispatch, selectedAlert]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Alert History</h2>
        <div>
          <select
            className="select"
            value={selectedAlert}
            onChange={(e) => setSelectedAlert(e.target.value)}
            style={{ width: 'auto', marginBottom: 0 }}
          >
            <option value="">All Alerts</option>
            {alerts.map((alert) => (
              <option key={alert.id} value={alert.id}>
                {alert.email} - {alert.filter_criteria?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error">{error.message || 'An error occurred'}</div>}

      {loading && <div className="loading">Loading history...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>No alert history found.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Filter</th>
                <th>News Items</th>
                <th>Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {items.map((history) => (
                <tr key={history.id}>
                  <td>{history.alert?.email || 'N/A'}</td>
                  <td>{history.alert?.filter_criteria?.name || 'N/A'}</td>
                  <td>{history.news_items?.length || 0}</td>
                  <td>
                    <span className={history.email_status === 'sent' ? 'badge badge-active' : 'badge badge-inactive'}>
                      {history.email_status}
                    </span>
                  </td>
                  <td>{formatDate(history.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AlertHistory;

