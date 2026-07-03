import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers';
import type { Supplier } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div>
      <h1>Suppliers</h1>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Supplier name"
        />
        {fieldErrors.name && <span>{fieldErrors.name}</span>}

        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Contact name (optional)"
        />
        {fieldErrors.contact_name && <span>{fieldErrors.contact_name}</span>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
        />
        {fieldErrors.email && <span>{fieldErrors.email}</span>}

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
        />
        {fieldErrors.phone && <span>{fieldErrors.phone}</span>}

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address (optional)"
        />
        {fieldErrors.address && <span>{fieldErrors.address}</span>}

        <button type="submit">Add Supplier</button>
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
          {suppliers.map((supplier) => (
            <li key={supplier.id}>
              {editingId === supplier.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Supplier name"
                  />
                  <input
                    type="text"
                    value={editContactName}
                    onChange={(e) => setEditContactName(e.target.value)}
                    placeholder="Contact name (optional)"
                  />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email (optional)"
                  />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone (optional)"
                  />
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Address (optional)"
                  />
                  <button onClick={() => handleUpdate(supplier.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>{supplier.name}</strong>
                  {supplier.contact_name && <span> — Contact: {supplier.contact_name}</span>}
                  {supplier.email && <span> — {supplier.email}</span>}
                  {supplier.phone && <span> — {supplier.phone}</span>}
                  {supplier.address && <span> — {supplier.address}</span>}
                  <button onClick={() => startEdit(supplier)}>Edit</button>
                  <button onClick={() => handleDelete(supplier.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Suppliers;