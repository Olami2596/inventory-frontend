import { useState, useEffect } from 'react';
import { getTransactions, createTransaction } from '../api/transactions';
import { getProducts } from '../api/products';
import type { TransactionWithRelations, ProductWithRelations } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { format, parseISO } from 'date-fns';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

const selectClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors appearance-none cursor-pointer';

const cardHover =
  'transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5';

function getRailColor(quantity: number): string {
  return quantity >= 0 ? 'border-l-accent' : 'border-l-danger';
}

function getQuantityTextColor(quantity: number): string {
  return quantity >= 0 ? 'text-accent' : 'text-danger';
}

function getSignedQuantity(
  type: 'purchase' | 'sale' | 'adjustment',
  quantity: number,
  adjustmentDirection: 'increase' | 'decrease'
): number {
  if (type === 'purchase') {
    return Math.abs(quantity);
  }

  if (type === 'sale') {
    return -Math.abs(quantity);
  }

  return adjustmentDirection === 'increase' ? Math.abs(quantity) : -Math.abs(quantity);
}

function Transactions() {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  const [productId, setProductId] = useState<number>(0);
  const [type, setType] = useState<'purchase' | 'sale' | 'adjustment'>('purchase');
  const [quantity, setQuantity] = useState<number>(0);
  const [adjustmentDirection, setAdjustmentDirection] = useState<'increase' | 'decrease'>('increase');
  const [notes, setNotes] = useState<string>('');

  async function fetchAll() {
    try {
      const [transactionsResult, productsResult] = await Promise.all([
        getTransactions(),
        getProducts(),
      ]);
      setTransactions(transactionsResult);
      setProducts(productsResult);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartMessage(true), 5000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll().finally(() => clearTimeout(timer));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (productId === 0) {
      setError('Please select a product.');
      return;
    }

    try {
      const signedQuantity = getSignedQuantity(type, quantity, adjustmentDirection);

      await createTransaction({
        product_id: productId,
        type,
        quantity: signedQuantity,
        notes: notes || null,
      });

      setProductId(0);
      setType('purchase');
      setQuantity(0);
      setAdjustmentDirection('increase');
      setNotes('');
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading transactions…</p>
        {showColdStartMessage && (
          <p className="mt-2 text-sm text-warning max-w-xs text-center">
            The server may be waking up from inactivity — this can take up to a minute on the first request.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Transactions</h1>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface border border-ink/10 rounded-xl p-5 mb-6">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className={selectClass}
            >
              <option value={0}>Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {fieldErrors.product_id && (
              <p className="text-xs text-danger mt-1">{fieldErrors.product_id}</p>
            )}
          </div>

          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'purchase' | 'sale' | 'adjustment')}
              className={selectClass}
            >
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="adjustment">Adjustment</option>
            </select>
            {fieldErrors.type && <p className="text-xs text-danger mt-1">{fieldErrors.type}</p>}
          </div>

          <div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Quantity"
              className={inputClass}
            />
            {fieldErrors.quantity && (
              <p className="text-xs text-danger mt-1">{fieldErrors.quantity}</p>
            )}
          </div>

          {type === 'adjustment' && (
            <select
              value={adjustmentDirection}
              onChange={(e) => setAdjustmentDirection(e.target.value as 'increase' | 'decrease')}
              className={selectClass}
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          )}

          <div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className={inputClass}
            />
            {fieldErrors.notes && <p className="text-xs text-danger mt-1">{fieldErrors.notes}</p>}
          </div>

          <button
            type="submit"
            className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Add Transaction
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`bg-surface border-l-[3px] ${getRailColor(
              transaction.quantity
            )} border-y border-r border-ink/10 rounded-lg px-4 py-3 flex items-start justify-between gap-4 ${cardHover}`}
          >
            <div className="space-y-0.5 flex-1 min-w-0">
              <p className="font-medium text-sm">{transaction.product.name}</p>
              <p className="text-sm text-ink/60 capitalize">{transaction.type}</p>
              {transaction.creator?.name && (
                <p className="text-xs text-ink/50">by {transaction.creator.name}</p>
              )}
              {transaction.notes && (
                <p className="text-sm text-ink/60">{transaction.notes}</p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className={`font-mono text-sm font-semibold ${getQuantityTextColor(transaction.quantity)}`}>
                {transaction.quantity > 0 ? '+' : ''}
                {transaction.quantity}
              </p>
              <p className="text-xs text-ink/50 mt-0.5">
                {format(parseISO(transaction.created_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transactions;