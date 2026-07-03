import { useState, useEffect } from 'react';
import { getDashboard } from '../api/dashboard';
import type { DashboardSummary } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { format, parseISO } from 'date-fns';

function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await getDashboard();
        setData(result);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => setShowColdStartMessage(true), 5000);
    fetchDashboard().finally(() => clearTimeout(timer));
  }, []);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
        {showColdStartMessage && (
          <p>The server may be waking up from inactivity — this can take up to a minute on the first request.</p>
        )}
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!data) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Total Products: {data.total_products}</p>
      <p>Total Categories: {data.total_categories}</p>
      <p>Total Suppliers: {data.total_suppliers}</p>

      <p>Total Sale Value: {parseFloat(data.total_sale_value).toFixed(2)}</p>
      <p>Total Cost Value: {parseFloat(data.total_cost_value).toFixed(2)}</p>

      <p>Units Sold This Week: {data.units_sold_this_week}</p>
      <p>Units Sold Last Week: {data.units_sold_last_week}</p>
      <p>Units Sold This Month: {data.units_sold_this_month}</p>
      <p>Units Sold Last Month: {data.units_sold_last_month}</p>

      <p>
        Avg Purchase Quantity:{' '}
        {data.avg_purchase_quantity !== null
          ? parseFloat(data.avg_purchase_quantity).toFixed(2)
          : 'N/A'}
      </p>
      <p>Avg Sale Quantity: {data.avg_sale_quantity}</p>

      <h2>Low Stock Products</h2>
      {data.low_stock_products.length === 0 ? (
        <p>No products are currently low on stock.</p>
      ) : (
        <ul>
          {data.low_stock_products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong>
              <span> — Stock: {product.current_stock}</span>
            </li>
          ))}
        </ul>
      )}

      <h2>Recent Transactions</h2>
      {data.recent_transactions.length === 0 ? (
        <p>No recent transactions.</p>
      ) : (
        <ul>
          {data.recent_transactions.map((transaction) => (
            <li key={transaction.id}>
              <strong>{transaction.product.name}</strong>
              <span> — {transaction.type}</span>
              <span> — {transaction.quantity}</span>
              {transaction.creator?.name && <span> — by {transaction.creator.name}</span>}
              <span> — {format(parseISO(transaction.created_at), 'MMM d, yyyy h:mm a')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;