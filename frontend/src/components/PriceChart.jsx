import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

export default function PriceChart({ history, summary }) {
  const [view, setView] = useState('price');

  if (!history || history.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Price History</h3>
        </div>
        <div className="empty-state">
          <div className="empty-state-title">No price history yet</div>
          <div>Data will show up here after the first scrape.</div>
        </div>
      </div>
    );
  }

  const chartData = history.map((h) => ({
    time: new Date(h.scraped_at).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    price: parseFloat(h.price) || null,
    mrp: parseFloat(h.mrp) || null,
    stock: h.stock ?? null,
    fullTime: new Date(h.scraped_at).toLocaleString('en-IN'),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: '0.8rem',
        }}
      >
        <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
          {payload[0]?.payload?.fullTime}
        </div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.name === 'Stock' ? p.value : `₹${p.value?.toLocaleString('en-IN')}`}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">
          {view === 'price' ? 'Price History' : 'Stock History'}
        </h3>
        <div className="chart-toggle">
          <button
            className={`chart-toggle-btn ${view === 'price' ? 'active' : ''}`}
            onClick={() => setView('price')}
          >
            Price
          </button>
          <button
            className={`chart-toggle-btn ${view === 'stock' ? 'active' : ''}`}
            onClick={() => setView('stock')}
          >
            Stock
          </button>
        </div>
      </div>

      {summary && view === 'price' && (
        <div className="price-stats-row">
          <div className="price-stat">
            <div className="price-stat-value" style={{ color: 'var(--success)' }}>
              ₹{summary.minPrice?.toLocaleString('en-IN')}
            </div>
            <div className="price-stat-label">Lowest</div>
          </div>
          <div className="price-stat">
            <div className="price-stat-value">
              ₹{summary.avgPrice?.toLocaleString('en-IN')}
            </div>
            <div className="price-stat-label">Average</div>
          </div>
          <div className="price-stat">
            <div className="price-stat-value" style={{ color: 'var(--danger)' }}>
              ₹{summary.maxPrice?.toLocaleString('en-IN')}
            </div>
            <div className="price-stat-label">Highest</div>
          </div>
          <div className="price-stat">
            <div className="price-stat-value">
              {summary.totalDataPoints}
            </div>
            <div className="price-stat-label">Data Points</div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        {view === 'price' ? (
          <AreaChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--accent-blue)"
              fill="rgba(59, 130, 246, 0.15)"
              strokeWidth={2}
              name="Price"
              dot={chartData.length < 30}
            />
            {chartData.some((d) => d.mrp) && (
              <Line
                type="monotone"
                dataKey="mrp"
                stroke="var(--text-muted)"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
                name="MRP"
              />
            )}
          </AreaChart>
        ) : (
          <AreaChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-color)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="stepAfter"
              dataKey="stock"
              stroke="var(--success)"
              fill="rgba(16, 185, 129, 0.15)"
              strokeWidth={2}
              name="Stock"
              dot={chartData.length < 30}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
