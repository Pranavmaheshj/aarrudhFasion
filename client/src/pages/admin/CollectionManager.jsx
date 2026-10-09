import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Trash2, X, FolderTree, Image, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CollectionManager = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: '',
    isVisible: true,
    sortOrder: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/collections');
      setCollections(res.data.collections || []);
    } catch (err) {
      console.warn('Admin collections request failed, attempting fallback to public collections:', err);
      try {
        const fallbackRes = await api.get('/collections');
        setCollections(fallbackRes.data.collections || []);
      } catch (fallbackErr) {
        toast.error('Failed to load collections');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      images: '',
      isVisible: true,
      sortOrder: collections.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingId(col._id);
    setFormData({
      name: col.name || '',
      description: col.description || '',
      images: Array.isArray(col.images) ? col.images.join('\n') : '',
      isVisible: col.isVisible ?? true,
      sortOrder: col.sortOrder ?? 1,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Collection name is required');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      images: formData.images.split('\n').map((u) => u.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/admin/collections/${editingId}`, payload);
        toast.success('Collection updated!');
      } else {
        await api.post('/admin/collections', payload);
        toast.success('Collection created!');
      }
      setModalOpen(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete collection "${name}"?`)) return;
    try {
      await api.delete(`/admin/collections/${id}`);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-brand-gold-dark" />
            <span>Lookbook Collections</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Group your designs into curated collections displayed on the landing page and filter navigation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading collections..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-sans">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-6">Collection</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Designs Count</th>
                  <th className="py-3 px-6">Visibility</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {collections.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.images?.[0] || 'https://via.placeholder.com/60'}
                          alt={c.name}
                          className="w-12 h-12 object-cover rounded-lg bg-brand-cream border border-gray-200"
                        />
                        <div>
                          <p className="font-serif font-bold text-sm text-brand-dark">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs text-gray-600 line-clamp-2">
                      {c.description}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-dark font-sans">
                      {c.productCount ?? 0}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isVisible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.isVisible ? 'Public' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-gray-600 hover:text-brand-magenta rounded hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c._id, c.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-brand-cream border-b border-brand-gold/20">
                <h3 className="font-serif text-lg font-bold text-brand-dark">
                  {editingId ? 'Edit Collection' : 'Create Lookbook Collection'}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-brand-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Collection Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="e.g. Diwali Collection – New Launch"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Lookbook Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="Festive women's ethnic kurta sets with embroidery, pearl work..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Image URLs (One per line)</label>
                  <textarea
                    rows={3}
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="rounded text-brand-magenta focus:ring-brand-magenta"
                    />
                    <span>Visible on storefront &amp; landing</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update Collection' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionManager;
