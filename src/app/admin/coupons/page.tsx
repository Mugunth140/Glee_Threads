'use client';

import { showToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  expiry_date: string;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percent: '',
    expiry_date: '',
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCoupon)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Coupon created!', { type: 'success' });
        setShowModal(false);
        setNewCoupon({ code: '', discount_percent: '', expiry_date: '' });
        fetchCoupons();
      } else {
        showToast(data.error || 'Failed to create coupon', { type: 'error' });
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      showToast('Error creating coupon', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
        showToast('Coupon deleted', { type: 'info' });
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast('Error deleting coupon', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-black">Coupon Codes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Coupon
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-red-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No coupons found</td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiry_date) < new Date();
                return (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-black">{coupon.code}</td>
                    <td className="px-6 py-4 text-black font-semibold">{coupon.discount_percent}% OFF</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(coupon.expiry_date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {isExpired ? (
                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Expired</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-black mb-6">Create New Coupon</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FIRST50"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-black font-bold focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Discount Percent (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="e.g. 10"
                  value={newCoupon.discount_percent}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newCoupon.expiry_date}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 active:scale-95 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
