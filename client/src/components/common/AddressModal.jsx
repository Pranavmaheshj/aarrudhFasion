import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AddressModal = ({ isOpen, onClose, onAddressSaved, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    pincode: '',
    house: '',
    area: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'Home',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        mobile: '',
        pincode: '',
        house: '',
        area: '',
        city: '',
        state: '',
        landmark: '',
        addressType: 'Home',
        isDefault: false,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) return toast.error('Recipient name is required');
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      return toast.error('Enter a valid 10-digit Indian mobile number');
    }
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      return toast.error('Enter a valid 6-digit postal pincode');
    }
    if (!formData.house.trim()) return toast.error('House/Flat number is required');
    if (!formData.area.trim()) return toast.error('Area/Street details are required');
    if (!formData.city.trim()) return toast.error('City is required');
    if (!formData.state.trim()) return toast.error('State is required');

    setLoading(true);
    try {
      let res;
      if (initialData?._id) {
        res = await api.put(`/addresses/${initialData._id}`, formData);
        toast.success('Delivery address updated');
      } else {
        res = await api.post('/addresses', formData);
        toast.success('New delivery address added');
      }
      onAddressSaved(res.data.addresses);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-borderWarm max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-borderWarm bg-brand-cream shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-magenta" />
            <h3 className="font-serif font-bold text-base text-brand-dark">
              {initialData?._id ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                required
                className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                10-Digit Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. 9845012345"
                maxLength={10}
                required
                className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pincode (6-digit) *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="560001"
                maxLength={6}
                required
                className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Bengaluru"
                required
                className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Karnataka"
                required
                className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Flat, House No., Building Name *
            </label>
            <input
              type="text"
              name="house"
              value={formData.house}
              onChange={handleChange}
              placeholder="e.g. Flat 402, Royal Palms Residency"
              required
              className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Area, Street, Sector, Village *
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. 4th Block, Koramangala"
              required
              className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="e.g. Opposite Sony World Signal"
              className="w-full px-3 py-2 border border-brand-borderWarm rounded-lg text-xs focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <span className="text-xs font-semibold text-gray-700">Address Type:</span>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="radio"
                name="addressType"
                value="Home"
                checked={formData.addressType === 'Home'}
                onChange={handleChange}
                className="text-brand-magenta focus:ring-brand-magenta"
              />
              <span>Home (All day delivery)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="radio"
                name="addressType"
                value="Work"
                checked={formData.addressType === 'Work'}
                onChange={handleChange}
                className="text-brand-magenta focus:ring-brand-magenta"
              />
              <span>Work (10 AM - 6 PM)</span>
            </label>
          </div>

          <label className="flex items-center gap-2 pt-1 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="rounded border-gray-300 text-brand-magenta focus:ring-brand-magenta"
            />
            <span>Make this my default shipping address</span>
          </label>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-magenta text-white rounded-lg text-xs font-semibold hover:bg-brand-magentaDark transition-colors shadow"
            >
              {loading ? 'Saving...' : initialData?._id ? 'Update Address' : 'Save &amp; Deliver Here'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
