import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers';
import type { Supplier } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { usePermission } from '../hooks/usePermission';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

const cardHover =
  'transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5';

function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editContactName, setEditContactName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');

  const { canManageStructure } = usePermission();

  async function fetchSuppliers() {
    try {
      const result = await getSuppliers();
      setSuppliers(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartMessage(true), 5000);
    fetchSuppliers().finally(() => clearTimeout(timer));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      await createSupplier({
        name,
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      });
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setAddress('');
      await fetchSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  function startEdit(supplier: Supplier) {
    setEditingId(supplier.id);
    setEditName(supplier.name);
    setEditContactName(supplier.contact_name ?? '');
    setEditEmail(supplier.email ?? '');
    setEditPhone(supplier.phone ?? '');
    setEditAddress(supplier.address ?? '');
  }

  async function handleUpdate(id: number) {
    setError(null);
    setFieldErrors({});
    try {
      await updateSupplier(id, {
        name: editName,
        contact_name: editContactName || null,
        email: editEmail || null,
        phone: editPhone || null,
        address: editAddress || null,
      });
      setEditingId(null);
      await fetchSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this supplier?')) return;

    try {
      await deleteSupplier(id);
      await fetchSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading suppliers…</p>
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
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Suppliers</h1>

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
                placeholder="Supplier name"
                className={inputClass}
              />
              {fieldErrors.name && <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact name (optional)"
                className={inputClass}
              />
              {fieldErrors.contact_name && (
                <p className="text-xs text-danger mt-1">{fieldErrors.contact_name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className={inputClass}
              />
              {fieldErrors.email && <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className={inputClass}
              />
              {fieldErrors.phone && <p className="text-xs text-danger mt-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address (optional)"
                className={inputClass}
              />
              {fieldErrors.address && (
                <p className="text-xs text-danger mt-1">{fieldErrors.address}</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Add Supplier
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className={`bg-surface border border-ink/10 rounded-lg px-4 py-3 flex items-start justify-between gap-4 ${cardHover}`}
          >
            {editingId === supplier.id ? (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Supplier name"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  placeholder="Contact name (optional)"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Address (optional)"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(supplier.id)}
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
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{supplier.name}</p>
                  {supplier.contact_name && (
                    <p className="text-sm text-ink/60">Contact: {supplier.contact_name}</p>
                  )}
                  {supplier.email && <p className="text-sm text-ink/60">{supplier.email}</p>}
                  {supplier.phone && <p className="text-sm text-ink/60">{supplier.phone}</p>}
                  {supplier.address && <p className="text-sm text-ink/60">{supplier.address}</p>}
                </div>
                {canManageStructure && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(supplier)}
                      aria-label="Edit supplier"
                      title="Edit"
                      className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-accent/10 hover:text-accent active:scale-[0.95] transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      aria-label="Delete supplier"
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

export default Suppliers;