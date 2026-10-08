import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Send,
  X,
  Phone,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  'ALL',
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Shipment modal state
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shipmentData, setShipmentData] = useState({
    courier: 'Blue Dart Express',
    trackingId: '',
    trackingUrl: '',
    agentName: '',
    agentPhone: '',
    expectedDelivery: '',
  });
  const [submittingShipment, setSubmittingShipment] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: {
          status: statusFilter,
          search,
        },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleOpenShipmentModal = (order) => {
    setSelectedOrder(order);
    setShipmentData({
      courier: order.shipment?.courier || 'Blue Dart Express',
      trackingId: order.shipment?.trackingId || `BLU${Date.now().toString().slice(-8)}IN`,
      trackingUrl: order.shipment?.trackingUrl || '',
      agentName: order.shipment?.agentName || 'Ramesh Kumar',
      agentPhone: order.shipment?.agentPhone || '9876500112',
      expectedDelivery: order.shipment?.expectedDelivery
        ? new Date(order.shipment.expectedDelivery).toISOString().split('T')[0]
        : new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    });
    setShipmentModalOpen(true);
  };

  const handleAssignShipment = async (e) => {
    e.preventDefault();
    if (!shipmentData.courier || !shipmentData.trackingId) {
      toast.error('Courier name and tracking ID are required');
      return;
    }

    setSubmittingShipment(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder._id}/shipment`, shipmentData);
      toast.success(
        res.data?.smsDispatched
          ? 'Shipment assigned & SMS successfully dispatched to customer!'
          : 'Shipment details assigned to order!'
      );
      setShipmentModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign shipment');
    } finally {
      setSubmittingShipment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-gold-dark" />
            <span>Orders &amp; Shipments Dispatch</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Fulfill boutique orders, assign courier partners, and send tracking SMS to customer mobile phones.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order #, customer, tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-brand-magenta text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Retrieving orders..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-sans">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Order Details</th>
                  <th className="py-3 px-4">Customer &amp; Phone</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Courier &amp; SMS</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-brand-dark">#{o.orderNumber || o._id?.slice(-8).toUpperCase()}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-brand-dark">{o.address?.name || o.user?.name || 'Customer'}</p>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-brand-magenta" />
                          <span>+91 {o.address?.mobile || o.user?.mobile}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-dark font-sans">
                        ₹{o.amounts?.total?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.payment?.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.payment?.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                        >
                          {ORDER_STATUSES.filter((s) => s !== 'ALL').map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        {o.shipment?.trackingId ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-semibold text-brand-dark">
                              {o.shipment.courier}
                            </span>
                            <p className="text-[10px] text-gray-400 font-mono">
                              Track: {o.shipment.trackingId}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Not dispatched</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenShipmentModal(o)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold-dark hover:bg-brand-gold text-white text-[11px] font-semibold shadow-sm transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{o.shipment?.trackingId ? 'Update Courier' : 'Dispatch & SMS'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shipment Assignment Modal */}
      {shipmentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShipmentModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-brand-cream border-b border-brand-gold/20">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-gold-dark" />
                  <h3 className="font-serif text-lg font-bold text-brand-dark">
                    Assign Shipment &amp; Dispatch SMS
                  </h3>
                </div>
                <button type="button" onClick={() => setShipmentModalOpen(false)} className="p-1 text-gray-400 hover:text-brand-dark">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignShipment} className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-semibold">
                    Order #{selectedOrder.orderNumber || selectedOrder._id}
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Customer: {selectedOrder.address?.name} (+91 {selectedOrder.address?.mobile})
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1 italic">
                    Saving this will send an automated shipment SMS to +91 {selectedOrder.address?.mobile}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Courier Partner *</label>
                  <select
                    required
                    value={shipmentData.courier}
                    onChange={(e) => setShipmentData({ ...shipmentData, courier: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  >
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="DTDC India">DTDC India</option>
                    <option value="Ekart Express">Ekart Express</option>
                    <option value="Shadowfax Courier">Shadowfax Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">AWB / Tracking Number *</label>
                  <input
                    type="text"
                    required
                    value={shipmentData.trackingId}
                    onChange={(e) => setShipmentData({ ...shipmentData, trackingId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta font-mono"
                    placeholder="e.g. BLU77890123IN"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Agent Name</label>
                    <input
                      type="text"
                      value={shipmentData.agentName}
                      onChange={(e) => setShipmentData({ ...shipmentData, agentName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Agent Phone</label>
                    <input
                      type="text"
                      value={shipmentData.agentPhone}
                      onChange={(e) => setShipmentData({ ...shipmentData, agentPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                      placeholder="e.g. 9876500112"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={shipmentData.expectedDelivery}
                    onChange={(e) => setShipmentData({ ...shipmentData, expectedDelivery: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShipmentModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingShipment}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-brand-magenta hover:bg-brand-magenta-dark text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingShipment ? 'Dispatching...' : 'Dispatch Order & Trigger SMS'}</span>
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

export default OrderManager;
