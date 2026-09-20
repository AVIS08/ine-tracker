# iNE Tracker — System Architecture & Design Reflection

## Scraper Resilience & Reliability Strategies

1. **Throttled Sequential Execution**:
   To prevent target store rate-limiting and browser process memory spikes, scrape jobs run sequentially with an engineered delay between items. This design choice guarantees predictable memory footprints fitting free-tier containers on Render.

2. **Adaptive Exponential Backoff**:
   Network glitches and transient DOM render lags are handled using an exponential backoff retry wrapper (`retryWithBackoff`). Scrape attempts automatically retry up to 2 times before logging a failure state.

3. **Resilient DOM Selectors**:
   Rather than coupling locators to brittle nested class chains, selectors leverage Playwright semantic text locators and resilient structural attributes.

4. **Transparent Audit Trail**:
   Every scrape attempt logs execution status (`success`, `retried`, `failed`), attempt count, execution time in ms, and exact error messages to the `scrape_logs` table.

---

## Architectural Trade-offs

- **Sequential vs. Concurrent Fetching**: Sequential processing increases cycle duration linearly with catalog size, but prevents process crashes and IP blocks on unauthenticated store scraping.
- **Shared Context Lifecycle**: Reusing a single browser context per batch run minimizes CPU startup overhead while preserving memory stability.
