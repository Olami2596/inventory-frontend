import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import type { Category } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { usePermission } from '../hooks/usePermission';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  const { canManageStructure } = usePermission();

  async function fetchCategories() {
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartMessage(true), 5000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories().finally(() => clearTimeout(timer));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      await createCategory({ name, description: description || null });
      setName('');
      setDescription('');
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? '');
  }

  async function handleUpdate(id: number) {
    setError(null);
    setFieldErrors({});
    try {
      await updateCategory(id, { name: editName, description: editDescription || null });
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this category?')) return;

    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading categories…</p>
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
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Categories</h1>

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
                placeholder="Category name"
                className={inputClass}
              />
              {fieldErrors.name && <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>}
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

            <button
              type="submit"
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Add Category
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group bg-surface border border-ink/10 rounded-lg px-4 py-3 flex items-center justify-between transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5"
          >
            {editingId === category.id ? (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(category.id)}
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
                <div>
                  <span className="font-medium text-sm">{category.name}</span>
                  {category.description && (
                    <span className="text-sm text-ink/60"> — {category.description}</span>
                  )}
                </div>
                {canManageStructure && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      aria-label="Edit category"
                      title="Edit"
                      className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-accent/10 hover:text-accent active:scale-[0.95] transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      aria-label="Delete category"
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
    </div>
  );
}

export default Categories;