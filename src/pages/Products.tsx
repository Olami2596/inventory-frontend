import { useState, useEffect } from 'react';
import { Pencil, Trash2, Package, X } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products';
import { getCategories } from '../api/categories';
import { getSuppliers } from '../api/suppliers';
import type { ProductWithRelations, Category, Supplier } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { usePermission } from '../hooks/usePermission';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

const selectClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors appearance-none cursor-pointer';

const cardHover =
  'transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5';

function getStockRailColor(stock: number): string {
  if (stock === 0) return 'border-l-danger';
  if (stock < 10) return 'border-l-warning';
  return 'border-l-accent';
}

interface ProductThumbnailProps {
  imageUrl: string | null;
  name: string;
  onClick: () => void;
}

function ProductThumbnail({ imageUrl, name, onClick }: ProductThumbnailProps) {
  const [failed, setFailed] = useState<boolean>(false);

  if (!imageUrl || failed) {
    return (
      <div className="w-20 h-20 rounded-lg bg-ink/5 flex items-center justify-center shrink-0">
        <Package size={28} className="text-ink/30" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-20 h-20 rounded-lg shrink-0 overflow-hidden bg-ink/5 focus:outline-none focus:ring-2 focus:ring-accent/40"
      aria-label={`View larger image of ${name}`}
    >
      <img
        src={imageUrl}
        alt={name}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
      />
    </button>
  );
}

interface ImageLightboxProps {
  imageUrl: string;
  name: string;
  onClose: () => void;
}

function ImageLightbox({ imageUrl, name, onClose }: ImageLightboxProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full bg-surface/10 text-white hover:bg-surface/20 transition-colors"
      >
        <X size={22} />
      </button>
      <img
        src={imageUrl}
        alt={name}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full rounded-xl object-contain"
      />
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

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

  const { canManageStructure } = usePermission();

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading products…</p>
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
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Products</h1>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      {canManageStructure && (
        <div className="bg-surface border border-ink/10 rounded-xl p-5 mb-6">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                className={inputClass}
              />
              {fieldErrors.name && <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                className={inputClass}
              />
              {fieldErrors.sku && <p className="text-xs text-danger mt-1">{fieldErrors.sku}</p>}
            </div>

            <div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className={inputClass}
              />
              {fieldErrors.description && (
                <p className="text-xs text-danger mt-1">{fieldErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Price"
                  className={inputClass}
                />
                {fieldErrors.price && <p className="text-xs text-danger mt-1">{fieldErrors.price}</p>}
              </div>

              <div>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  placeholder="Cost (optional)"
                  className={inputClass}
                />
                {fieldErrors.cost && <p className="text-xs text-danger mt-1">{fieldErrors.cost}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.category_id && (
                  <p className="text-xs text-danger mt-1">{fieldErrors.category_id}</p>
                )}
              </div>

              <div>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value={0}>Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.supplier_id && (
                  <p className="text-xs text-danger mt-1">{fieldErrors.supplier_id}</p>
                )}
              </div>
            </div>

            <div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                className={inputClass}
              />
              {fieldErrors.image_url && (
                <p className="text-xs text-danger mt-1">{fieldErrors.image_url}</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Add Product
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-surface border-l-[3px] ${getStockRailColor(
              product.current_stock
            )} border-y border-r border-ink/10 rounded-lg px-4 py-3 flex items-start justify-between gap-4 ${cardHover}`}
          >
            {editingId === product.id ? (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Product name"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                  placeholder="SKU"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    placeholder="Price"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={editCost}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    placeholder="Cost (optional)"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(Number(e.target.value))}
                    className={selectClass}
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
                    className={selectClass}
                  >
                    <option value={0}>Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  className={inputClass}
                />
                {fieldErrors.name && <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(product.id)}
                    className="bg-accent text-white text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-ink/5 text-ink/70 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-ink/10 active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
                  <ProductThumbnail
                    imageUrl={product.image_url}
                    name={product.name}
                    onClick={() =>
                      product.image_url && setLightboxImage({ url: product.image_url, name: product.name })
                    }
                  />

                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-ink/50 font-mono">{product.sku}</p>
                    <p className="text-sm text-ink/60">
                      {product.category.name} · {product.supplier.name}
                    </p>
                    {product.description && (
                      <p className="text-sm text-ink/60">{product.description}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-semibold">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                  <p className="font-mono text-xs text-ink/60 mt-0.5">
                    {product.current_stock} in stock
                  </p>
                </div>

                {canManageStructure && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(product)}
                      aria-label="Edit product"
                      title="Edit"
                      className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-accent/10 hover:text-accent active:scale-[0.95] transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      aria-label="Delete product"
                      title="Delete"
                      className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-danger/10 hover:text-danger active:scale-[0.95] transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage.url}
          name={lightboxImage.name}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}

export default Products;