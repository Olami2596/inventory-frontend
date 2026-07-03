import { useState, useEffect } from 'react';
import { getTransactions, createTransaction } from '../api/transactions';
import { getProducts } from '../api/products';
import type { TransactionWithRelations, ProductWithRelations } from '../types/api';

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
      setError('Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

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
      setError('Failed to create transaction.');
    }
  }

  return (
    <div>
      <h1>Transactions</h1>

      <form onSubmit={handleCreate}>
        <select
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
        >
          <option value={0}>Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'purchase' | 'sale' | 'adjustment')}
        >
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
          <option value="adjustment">Adjustment</option>
        </select>

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Quantity"
        />

        {type === 'adjustment' && (
          <select
            value={adjustmentDirection}
            onChange={(e) => setAdjustmentDirection(e.target.value as 'increase' | 'decrease')}
          >
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        )}

        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
        />

        <button type="submit">Add Transaction</button>
      </form>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <strong>{transaction.product.name}</strong>
              <span> — {transaction.type}</span>
              <span> — {transaction.quantity}</span>
              {transaction.notes && <span> — {transaction.notes}</span>}
              {transaction.creator?.name && <span> — by {transaction.creator.name}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Transactions;