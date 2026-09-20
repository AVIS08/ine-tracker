import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PriceChart from '../components/PriceChart';
import ScrapeLog from '../components/ScrapeLog';
import { getProduct, getPriceHistory, getScrapeLogs, scrapeProduct } from '../api/client';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState(null);
  const [histSummary, setHistSummary] = useState(null);
  const [logs, setLogs] = useState(null);
  const [logsSuccessRate, setLogsSuccessRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [prodData, histData, logData] = await Promise.all([
          getProduct(id),
          getPriceHistory(id, 200),
          getScrapeLogs(id, 50),
        ]);

        setProduct(prodData.product);
        setHistory(histData.history || []);
        setHistSummary(histData.summary);
        setLogs(logData.logs || []);
        setLogsSuccessRate(logData.successRate);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [id]);

  const handleScrapeNow = async () => {
    setScraping(true);
    try {
      await scrapeProduct(id);
      // Refresh data
      const [prodData, histData, logData] = await Promise.all([
        getProduct(id),
        getPriceHistory(id, 200),
        getScrapeLogs(id, 50),
      ]);
      setProduct(prodData.product);
      setHistory(histData.history || []);
      setHistSummary(histData.summary);
      setLogs(logData.logs || []);
      setLogsSuccessRate(logData.successRate);
    } catch (err) {
      console.error('Scrape failed:', err);
      try {
        const logData = await getScrapeLogs(id, 50);
        setLogs(logData.logs || []);
        setLogsSuccessRate(logData.successRate);
      } catch {}
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-spinner" />
        Fetching intelligence metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail">
        <Link to="/" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="empty-state glass-card">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Unable to load product metrics</div>
          <div className="empty-state-text">{error}</div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail fade-in">
      <Link to="/" className="back-link">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-meta">
              {product.category && (
                <span className="product-card-category">{product.category}</span>
              )}
              {product.brand && <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.brand}</span>}
              {product.sku && <span>SKU: {product.sku}</span>}
              <span>Store ID: {product.store_product_id}</span>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleScrapeNow}
            disabled={scraping}
          >
            {scraping ? (
              <>
                <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                Scraping Product...
              </>
            ) : (
              '⟳ Scrape Now'
            )}
          </button>
        </div>
        {product.description && (
          <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            {product.description}
          </p>
        )}
      </div>

      {/* Store Target Link */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <a
          href={`https://demo.inelabteamdev.com/product/${product.store_product_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          View Target Product Page ↗
        </a>
      </div>

      {/* Analytics Sections */}
      <div className="detail-sections">
        {/* Price & Stock Analytics Chart */}
        <PriceChart history={history} summary={histSummary} />

        {/* Audit Log */}
        <ScrapeLog logs={logs} successRate={logsSuccessRate} />
      </div>
    </div>
  );
}
