import { useState, useEffect } from 'react';
import { getDashboard } from '../api/dashboard';
import type { DashboardSummary } from '../types/api';
import { getErrorMessage } from '../utils/errors';
import { format, parseISO } from 'date-fns';

function getRailColor(quantity: number): string {
  return quantity >= 0 ? 'border-l-accent' : 'border-l-danger';
}

const cardHover =
  'transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5';

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
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading dashboard…</p>
        {showColdStartMessage && (
          <p className="mt-2 text-sm text-warning max-w-xs text-center">
            The server may be waking up from inactivity — this can take up to a minute on the first request.
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return <p>No dashboard data available.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`bg-surface border border-ink/10 rounded-xl p-5 ${cardHover}`}>
          <p className="text-sm text-ink/60 font-medium">Total Products</p>
          <p className="font-mono text-3xl font-semibold mt-2">{data.total_products}</p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-5 ${cardHover}`}>
          <p className="text-sm text-ink/60 font-medium">Total Categories</p>
          <p className="font-mono text-3xl font-semibold mt-2">{data.total_categories}</p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-5 ${cardHover}`}>
          <p className="text-sm text-ink/60 font-medium">Total Suppliers</p>
          <p className="font-mono text-3xl font-semibold mt-2">{data.total_suppliers}</p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-5 ${cardHover}`}>
          <p className="text-sm text-ink/60 font-medium">Total Sale Value</p>
          <p className="font-mono text-3xl font-semibold mt-2">
            ${parseFloat(data.total_sale_value).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <div className={`bg-surface border border-ink/10 rounded-xl p-4 ${cardHover}`}>
          <p className="text-xs text-ink/60 font-medium">Total Cost Value</p>
          <p className="font-mono text-lg font-semibold mt-1">
            ${parseFloat(data.total_cost_value).toFixed(2)}
          </p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-4 ${cardHover}`}>
          <p className="text-xs text-ink/60 font-medium">Units Sold This Week</p>
          <p className="font-mono text-lg font-semibold mt-1">{data.units_sold_this_week}</p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-4 ${cardHover}`}>
          <p className="text-xs text-ink/60 font-medium">Units Sold Last Week</p>
          <p className="font-mono text-lg font-semibold mt-1">{data.units_sold_last_week}</p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-4 ${cardHover}`}>
          <p className="text-xs text-ink/60 font-medium">Units Sold This Month</p>
          <p className="font-mono text-lg font-semibold mt-1">{data.units_sold_this_month}</p>
        </div>

        <div className={`bg-surface border border-ink/10 rounded-xl p-4 ${cardHover}`}>
          <p className="text-xs text-ink/60 font-medium">Units Sold Last Month</p>
          <p className="font-mono text-lg font-semibold mt-1">{data.units_sold_last_month}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Low Stock Products</h2>
        {data.low_stock_products.length === 0 ? (
          <p className="text-sm text-ink/60">No products are currently low on stock.</p>
        ) : (
          <div className="space-y-2">
            {data.low_stock_products.map((product) => (
              <div
                key={product.id}
                className={`flex items-center justify-between bg-surface border-l-[3px] border-l-warning border-y border-r border-ink/10 rounded-lg px-4 py-3 ${cardHover}`}
              >
                <span className="font-medium text-sm">{product.name}</span>
                <span className="font-mono text-sm text-warning font-semibold">
                  {product.current_stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Recent Transactions</h2>
        {data.recent_transactions.length === 0 ? (
          <p className="text-sm text-ink/60">No recent transactions.</p>
        ) : (
          <div className="space-y-2">
            {data.recent_transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between bg-surface border-l-[3px] ${getRailColor(
                  transaction.quantity
                )} border-y border-r border-ink/10 rounded-lg px-4 py-3 ${cardHover}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{transaction.product.name}</p>
                  <p className="text-sm text-ink/60 capitalize">{transaction.type}</p>
                  {transaction.creator?.name && (
                    <p className="text-xs text-ink/50">by {transaction.creator.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{transaction.quantity}</p>
                  <p className="text-xs text-ink/60">
                    {format(parseISO(transaction.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;