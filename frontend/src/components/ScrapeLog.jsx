export default function ScrapeLog({ logs, successRate }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Scrape Log</h3>
        </div>
        <div className="empty-state">
          <div className="empty-state-title">No scrape logs yet</div>
          <div>Scrape logs will show up here after the scraper runs.</div>
        </div>
      </div>
    );
  }

  const formatTime = (ts) => {
    return new Date(ts).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'retried':
        return '↻';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Scrape Log</h3>
        {successRate !== null && successRate !== undefined && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {successRate}% success rate
          </span>
        )}
      </div>

      <div className="log-table-wrap">
        <table className="log-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Duration</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {formatTime(log.scraped_at)}
                </td>
                <td>
                  <span className={`status-badge status-${log.status}`}>
                    {statusIcon(log.status)} {log.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{log.attempts}</td>
                <td>{formatDuration(log.duration_ms)}</td>
                <td
                  style={{
                    maxWidth: 300,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: log.error_message ? 'var(--danger)' : 'var(--text-muted)',
                  }}
                  title={log.error_message || ''}
                >
                  {log.error_message || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
