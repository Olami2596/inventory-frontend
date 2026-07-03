import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';
import { getSuppliers } from '../api/suppliers';
import type { ProductWithRelations, Category, Supplier } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

function Products() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [supplierId, setSupplierId] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editSku, setEditSku] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);
  const [editCategoryId, setEditCategoryId] = useState<number>(0);
  const [editSupplierId, setEditSupplierId] = useState<number>(0);
  const [editImageUrl, setEditImageUrl] = useState<string>('');

  async function fetchAll() {
    try {
      const [productsResult, categoriesResult, suppliersResult] = await Promise.all([
        getProducts(),
        getCategories(),
        getSuppliers(),
      ]);
      setProducts(productsResult);
      setCategories(categoriesResult);
      setSuppliers(suppliersResult);
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

    if (categoryId === 0 || supplierId === 0) {
      setError('Please select a category and a supplier.');
      return;
    }

    try {
      await createProduct({
        name,
        sku,
        description: description || null,
        price,
        cost,
        category_id: categoryId,
        supplier_id: supplierId,
        image_url: imageUrl || null,
      });
      setName('');
      setSku('');
      setDescription('');
      setPrice(0);
      setCost(0);
      setCategoryId(0);
      setSupplierId(0);
      setImageUrl('');
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  function startEdit(product: ProductWithRelations) {
    setEditingId(product.id);
    setEditName(product.name);
    setEditSku(product.sku);
    setEditDescription(product.description ?? '');
    setEditPrice(parseFloat(product.price));
    setEditCost(product.cost ? parseFloat(product.cost) : 0);
    setEditCategoryId(product.category_id);
    setEditSupplierId(product.supplier_id);
    setEditImageUrl(product.image_url ?? '');
  }

  async function handleUpdate(id: number) {
    setError(null);
    setFieldErrors({});

    if (editCategoryId === 0 || editSupplierId === 0) {
      setError('Please select a category and a supplier.');
      return;
    }

    try {
      await updateProduct(id, {
        name: editName,
        sku: editSku,
        description: editDescription || null,
        price: editPrice,
        cost: editCost,
        category_id: editCategoryId,
        supplier_id: editSupplierId,
        image_url: editImageUrl || null,
      });
      setEditingId(null);
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this product?')) return;

    try {
      await deleteProduct(id);
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <h1>Products</h1>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
        />
        {fieldErrors.name && <span>{fieldErrors.name}</span>}

        <input
          type="text"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU"
        />
        {fieldErrors.sku && <span>{fieldErrors.sku}</span>}

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        {fieldErrors.description && <span>{fieldErrors.description}</span>}

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price"
        />
        {fieldErrors.price && <span>{fieldErrors.price}</span>}

        <input
          type="number"
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          placeholder="Cost (optional)"
        />
        {fieldErrors.cost && <span>{fieldErrors.cost}</span>}

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
        >
          <option value={0}>Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {fieldErrors.category_id && <span>{fieldErrors.category_id}</span>}

        <select
          value={supplierId}
          onChange={(e) => setSupplierId(Number(e.target.value))}
        >
          <option value={0}>Select a supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        {fieldErrors.supplier_id && <span>{fieldErrors.supplier_id}</span>}

        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
        />
        {fieldErrors.image_url && <span>{fieldErrors.image_url}</span>}

        <button type="submit">Add Product</button>
      </form>

      {error && <p>{error}</p>}

      {loading ? (
        <div>
          <p>Loading...</p>
          {showColdStartMessage && (
            <p>The server may be waking up from inactivity — this can take up to a minute on the first request.</p>
          )}
        </div>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {editingId === product.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Product name"
                  />
                  <input
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    placeholder="SKU"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    placeholder="Cost (optional)"
                  />
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(Number(e.target.value))}
                  >
                    <option value={0}>Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editSupplierId}
                    onChange={(e) => setEditSupplierId(Number(e.target.value))}
                  >
                    <option value={0}>Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="Image URL (optional)"
                  />
                  {fieldErrors.name && <span>{fieldErrors.name}</span>}
                  <button onClick={() => handleUpdate(product.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{product.name}</strong> ({product.sku})
                  <span> — {product.category.name}</span>
                  <span> — {product.supplier.name}</span>
                  <span> — ${parseFloat(product.price).toFixed(2)}</span>
                  <span> — Stock: {product.current_stock}</span>
                  {product.description && <span> — {product.description}</span>}
                  <button onClick={() => startEdit(product)}>Edit</button>
                  <button onClick={() => handleDelete(product.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Products;