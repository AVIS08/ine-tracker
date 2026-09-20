import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getTrackedProducts, untrackProduct, triggerScrape, getScrapeStatus } from '../api/client';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getTrackedProducts();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch tracked products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getScrapeStatus();
      setScrapeStatus(data);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchStatus();
  }, [fetchProducts, fetchStatus]);

  const handleUntrack = async (id) => {
    try {
      await untrackProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to untrack:', err);
    }
  };

  const handleTriggerScrape = async () => {
    setTriggering(true);
    try {
      await triggerScrape();
      
      const poll = async () => {
        try {
          const status = await getScrapeStatus();
          setScrapeStatus(status);
          if (status.isRunning) {
            setTimeout(poll, 2000);
          } else {
            fetchProducts();
            setTriggering(false);
          }
        } catch {
          setTriggering(false);
        }
      };
      
      setTimeout(poll, 2000);
    } catch (err) {
      console.error('Failed to trigger scrape:', err);
      setTriggering(false);
    }
  };

  const totalProducts = products.length;
  const latestSuccessRate =
    products.length > 0
      ? products.filter((p) => p.latestLog?.status === 'success' || p.latestLog?.status === 'retried').length
      : 0;
  const totalDataPoints = products.reduce((sum, p) => sum + (p.historyCount || 0), 0);

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Search Header */}
      <div className="hero-header">
        <h1 className="hero-title">INE Product Price Tracker</h1>
        <p className="hero-subtitle">
          Search products from INE mock store and track their prices over time
        </p>
        <SearchBar onProductTracked={fetchProducts} />
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value cyan">{totalProducts}</div>
          <div className="stat-label">Tracked Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">
            {totalProducts > 0 ? `${latestSuccessRate}/${totalProducts}` : '—'}
          </div>
          <div className="stat-label">Last Scrape Success</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDataPoints}</div>
          <div className="stat-label">Total Data Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.1rem', lineHeight: '2.2rem' }}>
            {formatTime(scrapeStatus?.lastScrapeTime)}
          </div>
          <div className="stat-label">Last Scraped</div>
        </div>
      </div>

      {/* Actions */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Tracked Products</h2>
          <p className="section-subtitle">
            Products are automatically scraped every 2 hours
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleTriggerScrape}
          disabled={triggering || scrapeStatus?.isRunning}
        >
          {triggering || scrapeStatus?.isRunning ? (
            <>
              <span className="loading-spinner" />
              Scraping...
            </>
          ) : (
            '⟳ Scrape Now'
          )}
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading-container">
          <span className="loading-spinner" />
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state glass-card">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No products tracked yet</div>
          <div style={{ fontSize: '0.85rem' }}>
            Use the search bar above to find and track products.
          </div>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onUntrack={handleUntrack}
            />
          ))}
        </div>
      )}
    </div>
  );
}
