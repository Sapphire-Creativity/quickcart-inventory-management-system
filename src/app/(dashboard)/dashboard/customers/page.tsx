// app/admin/customers/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineStatusOnline,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineTrash,
} from 'react-icons/hi';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import KPICard from "@/components/dashboard/KPICard";
import DashboardHeader from '@/components/dashboard/DashboardHeader';

// ============ Types ============
type CustomerStatus = 'active' | 'inactive' | 'vip';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: Address;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Derived metrics
  totalOrders?: number;
  totalSpend?: number;
  lastOrderDate?: string;
  averageOrderValue?: number;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
}

// ============ Mock Data ============
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    status: 'vip',
    notes: 'Prefers express shipping',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T14:30:00Z',
    totalOrders: 12,
    totalSpend: 1245.50,
    lastOrderDate: '2024-03-15T08:30:00Z',
    averageOrderValue: 103.79,
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+1 (555) 234-5678',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    status: 'active',
    createdAt: '2024-01-20T11:15:00Z',
    updatedAt: '2024-03-12T09:45:00Z',
    totalOrders: 5,
    totalSpend: 342.75,
    lastOrderDate: '2024-03-10T15:20:00Z',
    averageOrderValue: 68.55,
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    createdAt: '2024-01-25T13:45:00Z',
    updatedAt: '2024-03-14T11:00:00Z',
    totalOrders: 8,
    totalSpend: 987.30,
    lastOrderDate: '2024-03-14T10:15:00Z',
    averageOrderValue: 123.41,
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1 (555) 456-7890',
    status: 'inactive',
    createdAt: '2024-02-01T09:30:00Z',
    updatedAt: '2024-02-28T16:20:00Z',
    totalOrders: 2,
    totalSpend: 89.98,
    lastOrderDate: '2024-02-15T11:45:00Z',
    averageOrderValue: 44.99,
  },
  {
    id: '5',
    name: 'Emma Brown',
    email: 'emma.brown@example.com',
    phone: '+1 (555) 567-8901',
    address: {
      street: '789 Pine Rd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    status: 'vip',
    notes: 'Birthday: March 15',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-03-16T13:15:00Z',
    totalOrders: 15,
    totalSpend: 2100.00,
    lastOrderDate: '2024-03-16T12:00:00Z',
    averageOrderValue: 140.00,
  },
  {
    id: '6',
    name: 'Frank Miller',
    email: 'frank.miller@example.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-03-11T09:00:00Z',
    totalOrders: 3,
    totalSpend: 156.97,
    lastOrderDate: '2024-03-08T14:10:00Z',
    averageOrderValue: 52.32,
  },
];

// Mock order history for customer drawer
const getMockOrderHistory = (customerId: string): OrderSummary[] => {
  const orderMap: Record<string, OrderSummary[]> = {
    '1': [
      { id: 'o1', orderNumber: 'ORD-001', date: '2024-03-15T08:30:00Z', status: 'completed', total: 303.18 },
      { id: 'o2', orderNumber: 'ORD-005', date: '2024-03-01T10:15:00Z', status: 'completed', total: 81.37 },
      { id: 'o3', orderNumber: 'ORD-009', date: '2024-02-15T13:45:00Z', status: 'completed', total: 245.99 },
    ],
    '2': [
      { id: 'o4', orderNumber: 'ORD-003', date: '2024-03-16T09:15:00Z', status: 'processing', total: 303.99 },
      { id: 'o5', orderNumber: 'ORD-008', date: '2024-02-28T11:20:00Z', status: 'completed', total: 38.76 },
    ],
    '3': [
      { id: 'o6', orderNumber: 'ORD-002', date: '2024-03-14T14:20:00Z', status: 'pending', total: 53.98 },
      { id: 'o7', orderNumber: 'ORD-006', date: '2024-03-10T09:45:00Z', status: 'completed', total: 64.79 },
    ],
    '5': [
      { id: 'o8', orderNumber: 'ORD-004', date: '2024-03-16T12:00:00Z', status: 'completed', total: 53.99 },
      { id: 'o9', orderNumber: 'ORD-010', date: '2024-03-05T15:30:00Z', status: 'completed', total: 129.99 },
    ],
  };
  return orderMap[customerId] || [];
};

// ============ Helper Components ============

// Status Badge
const StatusBadge = ({ status }: { status: CustomerStatus }) => {
  const config = {
    active: { label: 'Active', className: 'badge-success' },
    inactive: { label: 'Inactive', className: 'badge-danger' },
    vip: { label: 'VIP', className: 'bg-amber-100 text-amber-700' },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 badge ${className}`}>
      {status === 'vip' && <HiOutlineStar className="w-3 h-3" />}
      {label}
    </span>
  );
};


// Add/Edit Customer Modal
const CustomerModal = ({
  isOpen,
  onClose,
  customer,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: (customerData: Partial<Customer>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    status: 'active' as CustomerStatus,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || { street: '', city: '', state: '', zipCode: '', country: '' },
        status: customer.status,
        notes: customer.notes || '',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        status: 'active',
        notes: '',
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[\+\d\s\-\(\)]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface border-b border-default px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{customer ? 'Edit Customer' : 'Add New Customer'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <FaPlus className="w-5 h-5 text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`input ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="customer@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              className="input mb-2"
              placeholder="Street address"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                className="input"
                placeholder="City"
              />
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                className="input"
                placeholder="State"
              />
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                className="input"
                placeholder="ZIP code"
              />
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                className="input"
                placeholder="Country"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Additional notes about this customer..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-default px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Saving...' : (customer ? 'Save Changes' : 'Create Customer')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Customer Details Drawer
const CustomerDetailsDrawer = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}) => {
  const [orderHistory, setOrderHistory] = useState<OrderSummary[]>([]);

  useEffect(() => {
    if (customer) {
      setOrderHistory(getMockOrderHistory(customer.id));
    }
  }, [customer]);

  if (!customer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-surface shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-default p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <p className="text-sm text-muted">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(customer)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <HiOutlinePencilAlt className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(customer)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition">
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Customer Info */}
              <div className="border border-default rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HiOutlineUser className="w-4 h-4" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm flex items-center gap-2">
                    <HiOutlinePhone className="w-4 h-4 text-muted" />
                    {customer.phone}
                  </p>
                  {customer.email && (
                    <p className="text-sm flex items-center gap-2">
                      <HiOutlineMail className="w-4 h-4 text-muted" />
                      {customer.email}
                    </p>
                  )}
                  {customer.address && (
                    <p className="text-sm flex items-start gap-2">
                      <HiOutlineLocationMarker className="w-4 h-4 text-muted mt-0.5" />
                      <span>
                        {customer.address.street}<br />
                        {customer.address.city}, {customer.address.state} {customer.address.zipCode}<br />
                        {customer.address.country}
                      </span>
                    </p>
                  )}
                  <div className="pt-2">
                    <StatusBadge status={customer.status} />
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold">{customer.totalOrders || 0}</p>
                  <p className="text-xs text-muted">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold">${(customer.totalSpend || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted">Total Spend</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold">${(customer.averageOrderValue || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted">Avg. Order</p>
                </div>
              </div>

              {/* Order History */}
              <div className="border border-default rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HiOutlineShoppingBag className="w-4 h-4" />
                  Recent Orders
                </h3>
                {orderHistory.length > 0 ? (
                  <div className="space-y-2">
                    {orderHistory.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className="text-xs capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm text-center py-4">No orders yet</p>
                )}
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="border border-default rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HiOutlineDocumentText className="w-4 h-4" />
                    Notes
                  </h3>
                  <p className="text-sm text-muted">{customer.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ customer, onConfirm, onClose }: { customer: Customer | null; onConfirm: () => void; onClose: () => void }) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Delete Customer</h3>
        </div>
        <p className="text-muted mb-2">
          Are you sure you want to delete <span className="font-medium text-text">{customer.name}</span>?
        </p>
        <p className="text-sm text-muted mb-6">This action cannot be undone. All order history will be affected.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============ Main Component ============
export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateJoined, setDateJoined] = useState<string>('all');
  const [orderActivity, setOrderActivity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<'name' | 'totalSpend' | 'lastOrderDate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Check if coming from order assignment
  useEffect(() => {
    if (returnTo === 'order-assignment') {
      // Show a toast or notification
      console.log('Coming from order assignment - customer selection mode');
    }
  }, [returnTo]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }

    if (dateJoined === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(c => c.createdAt.split('T')[0] === today);
    } else if (dateJoined === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(c => new Date(c.createdAt) >= weekAgo);
    }

    if (orderActivity === 'has-orders') {
      filtered = filtered.filter(c => (c.totalOrders || 0) > 0);
    } else if (orderActivity === 'no-orders') {
      filtered = filtered.filter(c => (c.totalOrders || 0) === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [customers, searchQuery, selectedStatus, dateJoined, orderActivity, sortField, sortDirection]);

  // KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    const newCustomers = customers.filter(c => new Date(c.createdAt) >= weekAgo).length;
    const returningCustomers = customers.filter(c => (c.totalOrders || 0) > 1).length;
    const topCustomer = [...customers].sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0))[0];

    return {
      total: customers.length,
      new: newCustomers,
      returning: returningCustomers,
      topCustomerName: topCustomer?.name || 'N/A',
      topCustomerSpend: topCustomer?.totalSpend || 0,
    };
  }, [customers]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      // Update existing customer
      setCustomers(prev => prev.map(c =>
        c.id === editingCustomer.id
          ? { ...c, ...customerData, updatedAt: new Date().toISOString() }
          : c
      ));
    } else {
      // Create new customer
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: customerData.name!,
        phone: customerData.phone!,
        email: customerData.email,
        address: customerData.address,
        status: customerData.status as CustomerStatus || 'active',
        notes: customerData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
      };
      setCustomers(prev => [newCustomer, ...prev]);

      // If coming from order assignment, redirect back
      if (returnTo === 'order-assignment') {
        // In a real app, you'd store the selected customer in localStorage/sessionStorage
        sessionStorage.setItem('assignedCustomer', JSON.stringify(newCustomer));
        router.push('/dashboard/orders');
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteCustomer = () => {
    if (customerToDelete) {
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      setCustomerToDelete(null);
      if (selectedCustomer?.id === customerToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedCustomer(null);
      }
    }
  };

  const handleSort = (field: 'name' | 'totalSpend' | 'lastOrderDate') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'export') {
      const selectedCustomers = customers.filter(c => selectedRows.has(c.id));
      console.log('Exporting:', selectedCustomers);
      alert(`Exporting ${selectedCustomers.length} customers to CSV`);
    } else if (action === 'delete') {
      setCustomers(prev => prev.filter(c => !selectedRows.has(c.id)));
      setSelectedRows(new Set());
    }
  };

  const toggleRowSelection = (customerId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === paginatedCustomers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedCustomers.map(c => c.id)));
    }
  };

  const formatPhone = (phone: string) => phone;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}

        <DashboardHeader title="Orders" subTitle="Manage your customer base and view purchasing history"
          button={{
            text: "Add Customer",
            onClick: () => handleAddCustomer(),
          }}
        />


        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Customers"
            value={kpis.total}
            icon={HiOutlineUserGroup}
            color="bg-blue-500"
          />
          <KPICard
            title="New Customers (7d)"
            value={kpis.new}
            icon={HiOutlineUser}
            color="bg-green-500"
            trend="+12% vs last week"
          />
          <KPICard
            title="Returning Customers"
            value={kpis.returning}
            icon={HiOutlineRefresh}
            color="bg-purple-500"
          />
          <KPICard
            title="Top Customer"
            value={`$${kpis.topCustomerSpend.toFixed(2)}`}
            icon={HiOutlineTrash}
            color="bg-amber-500"
            subtitle={kpis.topCustomerName}
          />
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary lg:hidden"
            >
              <HiOutlineFilter className="w-4 h-4" />
              Filters
            </button>
            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex gap-3 flex-wrap`}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="vip">VIP</option>
              </select>
              <select
                value={dateJoined}
                onChange={(e) => setDateJoined(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Time</option>
                <option value="today">Joined Today</option>
                <option value="week">Last 7 Days</option>
              </select>
              <select
                value={orderActivity}
                onChange={(e) => setOrderActivity(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Orders</option>
                <option value="has-orders">Has Orders</option>
                <option value="no-orders">No Orders</option>
              </select>
              <button className="btn btn-secondary">
                <HiOutlineDownload className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-50 border border-brand-200 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-sm font-medium">{selectedRows.size} customers selected</span>
            <div className="flex gap-2">
              <button onClick={() => handleBulkAction('export')} className="btn btn-secondary btn-sm">
                Export Selected
              </button>
              <button onClick={() => handleBulkAction('delete')} className="btn btn-danger btn-sm">
                Delete Selected
              </button>
              <button onClick={() => setSelectedRows(new Set())} className="btn btn-ghost btn-sm">
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Customers Table - Desktop */}
        <div className="hidden lg:block bg-surface rounded-xl border border-default overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-default sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedCustomers.length && paginatedCustomers.length > 0}
                      onChange={toggleAllRows}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Contact</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted uppercase cursor-pointer hover:text-text"
                    onClick={() => handleSort('totalSpend')}
                  >
                    Total Spend {sortField === 'totalSpend' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Orders</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted uppercase cursor-pointer hover:text-text"
                    onClick={() => handleSort('lastOrderDate')}
                  >
                    Last Order {sortField === 'lastOrderDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginatedCustomers.map((customer) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-default hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleViewCustomer(customer)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(customer.id)}
                          onChange={() => toggleRowSelection(customer.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.status === 'vip' && (
                            <span className="text-xs text-amber-600">VIP Customer</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm">{customer.phone}</p>
                          {customer.email && <p className="text-xs text-muted">{customer.email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ${(customer.totalSpend || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {customer.totalOrders || 0}
                      </td>
                      <td className="px-4 py-3 text-muted text-sm">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition"
                            title="View Details"
                          >
                            <HiOutlineEye className="w-4 h-4 text-muted" />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition"
                            title="Edit Customer"
                          >
                            <HiOutlinePencilAlt className="w-4 h-4 text-muted" />
                          </button>
                          <button
                            onClick={() => setCustomerToDelete(customer)}
                            className="p-1.5 rounded-md hover:bg-red-50 transition"
                            title="Delete Customer"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Customers Cards - Mobile */}
        <div className="lg:hidden space-y-3">
          <AnimatePresence mode="wait">
            {paginatedCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-surface rounded-xl border border-default p-4 shadow-sm"
                onClick={() => handleViewCustomer(customer)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted">{customer.phone}</p>
                  </div>
                  <StatusBadge status={customer.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">${(customer.totalSpend || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted">Total Spend</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">{customer.totalOrders || 0}</p>
                    <p className="text-xs text-muted">Orders</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-default">
                  <p className="text-xs text-muted">
                    Last order: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                  </p>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-1.5 rounded-md hover:bg-gray-100"
                    >
                      <HiOutlinePencilAlt className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCustomerToDelete(customer)}
                      className="p-1.5 rounded-md hover:bg-red-50"
                    >
                      <HiOutlineTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {paginatedCustomers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-default"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiOutlineUserGroup className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium">No customers found</h3>
            <p className="text-muted mt-1">Try adjusting your search or filters</p>
            <button onClick={handleAddCustomer} className="btn btn-primary mt-4">
              <HiOutlinePlus className="w-4 h-4" />
              Add your first customer
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <p className="text-sm text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-default disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm transition ${currentPage === pageNum
                      ? 'bg-brand-500 text-white'
                      : 'border border-default hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-default disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals and Drawers */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      <CustomerDetailsDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEditCustomer}
        onDelete={(c) => setCustomerToDelete(c)}
      />

      <DeleteModal
        customer={customerToDelete}
        onConfirm={handleDeleteCustomer}
        onClose={() => setCustomerToDelete(null)}
      />
    </>
  );
}