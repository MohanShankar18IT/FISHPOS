import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Category } from '../../types';

interface CategoryMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryMasterModal: React.FC<CategoryMasterModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategoryItem, updateCategoryItem, deleteCategoryItem, products } = usePOS();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    icon: string;
    display_order: number;
    is_active: boolean;
  }>({
    name: '',
    code: '',
    description: '',
    icon: '🐟',
    display_order: 1,
    is_active: true
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingCategory(null);
    setIsAdding(true);
    setFormData({
      name: '',
      code: `CAT-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      icon: '🐟',
      display_order: categories.length + 1,
      is_active: true
    });
    setStatusMessage(null);
  };

  const handleStartEdit = (cat: Category) => {
    setIsAdding(false);
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      code: cat.code,
      description: cat.description || '',
      icon: cat.icon || '🐟',
      display_order: cat.display_order,
      is_active: cat.is_active
    });
    setStatusMessage(null);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingCategory(null);
    setStatusMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      if (editingCategory) {
        await updateCategoryItem(editingCategory.id, formData);
        setStatusMessage(`Category "${formData.name}" updated successfully!`);
      } else {
        await addCategoryItem(formData);
        setStatusMessage(`Category "${formData.name}" added successfully!`);
      }
      setIsAdding(false);
      setEditingCategory(null);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Failed to save category'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const count = products.filter(p => p.category_id === cat.id).length;
    if (count > 0) {
      if (!window.confirm(`Warning: ${count} product(s) are assigned to "${cat.name}". Are you sure you want to deactivate this category?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to remove/deactivate "${cat.name}"?`)) {
        return;
      }
    }

    try {
      await deleteCategoryItem(cat.id);
      setStatusMessage(`Category "${cat.name}" deactivated.`);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Failed to delete'}`);
    }
  };

  const iconOptions = ['🐟', '🌊', '🦐', '🦀', '🥩', '☀️', '🦑', '🐠', '🦈', '🧊'];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📁</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Seafood Category Master
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Manage catalog classifications, POS tab sorting & display icons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div style={{
            padding: '10px 24px',
            background: statusMessage.includes('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: statusMessage.includes('Error') ? '#ef4444' : '#10b981',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Add / Edit Form Drawer */}
          {(isAdding || editingCategory) ? (
            <form onSubmit={handleSave} style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {editingCategory ? `✏️ Edit Category: ${editingCategory.name}` : '➕ Add New Seafood Category'}
                </span>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Cancel
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Deep Sea Catch / Seer Fish"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. CAT-SEA"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Icon Symbol
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        style={{
                          background: formData.icon === icon ? 'var(--accent-cyan)' : 'var(--bg-input)',
                          border: `1px solid ${formData.icon === icon ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Fresh ocean catches delivered daily from harbor"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--accent-cyan)',
                    color: '#000000',
                    fontWeight: 700,
                    cursor: isSaving ? 'wait' : 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={handleStartAdd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-cyan)',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
                }}
              >
                <span>➕</span>
                <span>Add Seafood Category</span>
              </button>
            </div>
          )}

          {/* Category List Table */}
          <div style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Order</th>
                  <th style={{ padding: '10px 14px' }}>Icon</th>
                  <th style={{ padding: '10px 14px' }}>Category Name</th>
                  <th style={{ padding: '10px 14px' }}>Code</th>
                  <th style={{ padding: '10px 14px' }}>Products</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => {
                  const productCount = products.filter(p => p.category_id === cat.id).length;
                  return (
                    <tr
                      key={cat.id}
                      style={{
                        borderBottom: idx < categories.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        #{cat.display_order}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '1.2rem' }}>
                        {cat.icon || '🐟'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cat.name}
                        {cat.description && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {cat.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                        {cat.code}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)'
                        }}>
                          {productCount} items
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: cat.is_active ? '#10b981' : '#ef4444'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: cat.is_active ? '#10b981' : '#ef4444'
                          }} />
                          {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleStartEdit(cat)}
                            title="Edit Category"
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {cat.id !== 'cat-all' && (
                            <button
                              onClick={() => handleDelete(cat)}
                              title="Archive/Deactivate"
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 22px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
