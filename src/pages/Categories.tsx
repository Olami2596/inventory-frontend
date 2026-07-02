import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import type { Category } from '../types/api';

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  async function fetchCategories() {
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (err) {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await createCategory({ name, description: description || null });
      setName('');
      setDescription('');
      await fetchCategories();
    } catch (err) {
      setError('Failed to create category.');
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description ?? '');
  }

  async function handleUpdate(id: number) {
    try {
      await updateCategory(id, { name: editName, description: editDescription || null });
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      setError('Failed to update category.');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this category?')) return;

    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      setError('Failed to delete category.');
    }
  }

  return (
    <div>
      <h1>Categories</h1>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <button type="submit">Add Category</button>
      </form>
      {error && <p>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Category name"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                  <button onClick={() => handleUpdate(category.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{category.name}</strong>
                  {category.description && <span> — {category.description}</span>}
                  <button onClick={() => startEdit(category)}>Edit</button>
                  <button onClick={() => handleDelete(category.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Categories;