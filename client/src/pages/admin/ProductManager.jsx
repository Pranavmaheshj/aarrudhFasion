import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Image,
  Tag,
  IndianRupee,
  Sparkles,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  shortDescription: '',
  description: '',
  collectionId: '',
  price: '',
  mrp: '',
  fabric: 'Silk Blend / Tissue',
  neckStyle: 'V-Neck with Embroidery',
  colors: '',
  images: '',
  tags: 'Festive, Kurta Set',
  isNewProduct: true,
  isFeatured: false,
  sizes: [
    { size: 'S', stock: 10 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 10 },
    { size: 'XL', stock: 10 },
    { size: 'XXL', stock: 10 },
  ],
};

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCollections = async () => {
    try {
      const res = await api.get('/admin/collections');
      setCollections(res.data.collections || []);
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          search,
          collection: selectedCollection,
          limit: 100,
        },
      });
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error('Failed to fetch product catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCollection]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      collectionId: collections[0]?._id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      collectionId: product.collectionId?._id || product.collectionId || '',
      price: product.price || '',
      mrp: product.mrp || '',
      fabric: product.fabric || '',
      neckStyle: product.neckStyle || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      images: Array.isArray(product.images) ? product.images.join('\n') : '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      isNewProduct: product.isNewProduct ?? true,
      isFeatured: product.isFeatured ?? false,
      sizes: product.sizes?.length
        ? product.sizes
        : initialForm.sizes,
    });
    setModalOpen(true);
  };

  const handleSizeStockChange = (sizeName, stockVal) => {
    const updated = formData.sizes.map((s) =>
      s.size === sizeName ? { ...s, stock: Math.max(0, parseInt(stockVal, 10) || 0) } : s
    );
    setFormData({ ...formData, sizes: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.collectionId || !formData.price || !formData.mrp) {
      toast.error('Please fill required fields (Name, Collection, Price, MRP)');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      mrp: Number(formData.mrp),
      colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: formData.images.split('\n').map((u) => u.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        toast.success('Design updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('New kurta set added to boutique catalog!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark">Product Catalog</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage designs, inventory stock across sizes (S–XXL), pricing, and lookbook assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Design</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by design or colour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">Collection:</span>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-magenta"
          >
            <option value="">All Collections</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading products..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-sans">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Design</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">Price / MRP</th>
                  <th className="py-3 px-4">Available Sizes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const totalStock = p.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
                    return (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://via.placeholder.com/60'}
                              alt={p.name}
                              className="w-12 h-14 object-cover rounded bg-brand-cream border border-gray-200"
                            />
                            <div>
                              <p className="font-serif font-bold text-sm text-brand-dark line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-gray-400 line-clamp-1">{p.shortDescription}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.collectionId?.name || 'Diwali Collection'}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-brand-dark font-sans">₹{p.price?.toLocaleString('en-IN')}</p>
                          <p className="text-[11px] text-gray-400 line-through">₹{p.mrp?.toLocaleString('en-IN')}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {p.sizes?.map((s) => (
                              <span
                                key={s.size}
                                className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  s.stock > 0
                                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                                    : 'bg-rose-50 text-rose-400 border border-rose-200 line-through'
                                }`}
                              >
                                {s.size}:{s.stock}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">Total: {totalStock} in stock</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-gray-600 hover:text-brand-magenta hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p._id, p.name)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-brand-cream border-b border-brand-gold/20">
                <h3 className="font-serif text-lg font-bold text-brand-dark">
                  {editingId ? 'Edit Boutique Design' : 'Add New Kurta Set Design'}
                </h3>
                <button type="button" onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-brand-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Design Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="e.g. Teal Blue pearl-embroidered round neck kurta set"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Collection *</label>
                    <select
                      required
                      value={formData.collectionId}
                      onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    >
                      <option value="">Select Collection</option>
                      {collections.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Fabric</label>
                    <input
                      type="text"
                      value={formData.fabric}
                      onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                      placeholder="e.g. Pure Chanderi Silk & Organza"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Short Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                    placeholder="1-line summary for product cards"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  />
                </div>

                {/* Sizes Stock Inventory */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Inventory Stock by Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {formData.sizes.map((s) => (
                      <div key={s.size} className="text-center p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <span className="block text-xs font-bold text-brand-dark mb-1">{s.size}</span>
                        <input
                          type="number"
                          min="0"
                          value={s.stock}
                          onChange={(e) => handleSizeStockChange(s.size, e.target.value)}
                          className="w-full text-center text-xs py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Image URLs (One per line)</label>
                  <textarea
                    rows={3}
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta font-mono text-[11px]"
                    placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  />
                </div>

                {/* Colors & Neck style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Colors (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                      placeholder="Teal Blue, Gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Neck Style</label>
                    <input
                      type="text"
                      value={formData.neckStyle}
                      onChange={(e) => setFormData({ ...formData, neckStyle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                      placeholder="Embroidered V-Neck"
                    />
                  </div>
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
                    {submitting ? 'Saving...' : editingId ? 'Update Design' : 'Create Design'}
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

export default ProductManager;
