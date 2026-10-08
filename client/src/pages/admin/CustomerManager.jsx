import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Search, Phone, Mail, ShoppingBag, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/admin/customers');
        setCustomers(res.data.customers || []);
      } catch (err) {
        toast.error('Failed to load customer directory');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-gold-dark" />
            <span>Customer Directory</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse registered boutique clients, purchase history, and contact coordinates.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
          />
        </div>
        <span className="text-xs text-gray-400">Total: {filtered.length} customers</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving boutique customers..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-sans">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Contact Mobile</th>
                  <th className="py-3 px-6">Orders Placed</th>
                  <th className="py-3 px-6">Total Spent</th>
                  <th className="py-3 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No matching customers found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-6">
                        <p className="font-semibold text-brand-dark">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.email}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-mono text-gray-700 font-medium">+91 {c.mobile}</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-bold text-brand-dark">{c.orderCount || 0}</span>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-brand-magenta font-sans">
                        ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-6 text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManager;
