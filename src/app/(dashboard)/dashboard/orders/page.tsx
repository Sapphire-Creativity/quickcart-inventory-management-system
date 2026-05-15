// app/admin/orders/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KPICard from "@/components/dashboard/KPICard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

import {
    HiOutlineSearch,
    HiOutlinePlus,
    HiOutlineFilter,
    HiOutlineDownload,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineShoppingBag,
    HiOutlineCurrencyDollar,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineUserAdd,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineRefresh,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineReceiptTax,
    HiOutlineTag,
    HiOutlineDocumentText, // Replaced HiOutlineNote with HiOutlineDocumentText
    HiX,
    HiOutlineCheck,
    HiOutlineExclamation,
    HiOutlinePlusCircle,
} from 'react-icons/hi';
import Image from 'next/image';

// ============ Types ============
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
type PaymentStatus = 'paid' | 'unpaid' | 'failed';
type PaymentMethod = 'card' | 'cash' | 'transfer';
type OrderType = 'delivery' | 'pickup' | 'dine_in';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
}

interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    variant?: string;
    image?: string;
}

interface Order {
    id: string;
    orderNumber: string;
    customerId: string | null;
    customer?: Customer | null;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    transactionId?: string;
    orderType: OrderType;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
    notes?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: 'admin' | 'customer';
}

// ============ Mock Data ============
const MOCK_CUSTOMERS: Customer[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 (555) 123-4567', createdAt: '2024-01-10' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 234-5678', createdAt: '2024-01-15' },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', phone: '+1 (555) 345-6789', createdAt: '2024-01-20' },
    { id: '4', name: 'David Wilson', email: 'david@example.com', phone: '+1 (555) 456-7890', createdAt: '2024-01-25' },
    { id: '5', name: 'Emma Brown', email: 'emma@example.com', phone: '+1 (555) 567-8901', createdAt: '2024-02-01' },
];

const MOCK_ORDERS: Order[] = [
    {
        id: '1',
        orderNumber: 'ORD-001',
        customerId: '1',
        customer: MOCK_CUSTOMERS[0],
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        transactionId: 'txn_001',
        orderType: 'delivery',
        items: [
            { id: 'i1', productId: 'p1', productName: 'Minimalist Backpack', quantity: 1, price: 89.99, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop' },
            { id: 'i2', productId: 'p2', productName: 'Wireless Headphones', quantity: 1, price: 199.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' },
        ],
        subtotal: 289.98,
        tax: 23.20,
        discount: 10,
        total: 303.18,
        currency: 'USD',
        notes: 'Leave at front door',
        adminNotes: '',
        createdAt: '2024-03-15T10:30:00Z',
        updatedAt: '2024-03-15T10:30:00Z',
        createdBy: 'customer',
    },
    {
        id: '2',
        orderNumber: 'ORD-002',
        customerId: null,
        customer: null,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: undefined,
        orderType: 'pickup',
        items: [
            { id: 'i3', productId: 'p3', productName: 'Ceramic Coffee Mug', quantity: 2, price: 24.99, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=80&h=80&fit=crop' },
        ],
        subtotal: 49.98,
        tax: 4.00,
        discount: 0,
        total: 53.98,
        currency: 'USD',
        notes: '',
        adminNotes: '',
        createdAt: '2024-03-16T14:20:00Z',
        updatedAt: '2024-03-16T14:20:00Z',
        createdBy: 'admin',
    },
    {
        id: '3',
        orderNumber: 'ORD-003',
        customerId: '2',
        customer: MOCK_CUSTOMERS[1],
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'paypal',
        transactionId: 'txn_002',
        orderType: 'delivery',
        items: [
            { id: 'i4', productId: 'p4', productName: 'Smart Watch', quantity: 1, price: 299.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop' },
        ],
        subtotal: 299.99,
        tax: 24.00,
        discount: 20,
        total: 303.99,
        currency: 'USD',
        notes: 'Ring doorbell',
        adminNotes: '',
        createdAt: '2024-03-16T09:15:00Z',
        updatedAt: '2024-03-16T11:00:00Z',
        createdBy: 'customer',
    },
    {
        id: '4',
        orderNumber: 'ORD-004',
        customerId: null,
        customer: null,
        status: 'cancelled',
        paymentStatus: 'failed',
        orderType: 'dine_in',
        items: [
            { id: 'i5', productId: 'p5', productName: 'Leather Wallet', quantity: 1, price: 49.99, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&h=80&fit=crop' },
        ],
        subtotal: 49.99,
        tax: 4.00,
        discount: 0,
        total: 53.99,
        currency: 'USD',
        notes: '',
        adminNotes: 'Customer requested cancellation',
        createdAt: '2024-03-14T16:45:00Z',
        updatedAt: '2024-03-14T17:30:00Z',
        createdBy: 'customer',
    },
    {
        id: '5',
        orderNumber: 'ORD-005',
        customerId: '3',
        customer: MOCK_CUSTOMERS[2],
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        orderType: 'pickup',
        items: [
            { id: 'i6', productId: 'p6', productName: 'Yoga Mat', quantity: 1, price: 39.99, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=80&h=80&fit=crop' },
            { id: 'i7', productId: 'p7', productName: 'Water Bottle', quantity: 2, price: 19.99, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=80&h=80&fit=crop' },
        ],
        subtotal: 79.97,
        tax: 6.40,
        discount: 5,
        total: 81.37,
        currency: 'USD',
        notes: '',
        adminNotes: '',
        createdAt: '2024-03-13T11:00:00Z',
        updatedAt: '2024-03-13T13:20:00Z',
        createdBy: 'customer',
    },
    {
        id: '6',
        orderNumber: 'ORD-006',
        customerId: '4',
        customer: MOCK_CUSTOMERS[3],
        status: 'pending',
        paymentStatus: 'unpaid',
        orderType: 'delivery',
        items: [
            { id: 'i8', productId: 'p8', productName: 'Desk Lamp', quantity: 1, price: 59.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&h=80&fit=crop' },
        ],
        subtotal: 59.99,
        tax: 4.80,
        discount: 0,
        total: 64.79,
        currency: 'USD',
        notes: 'Call before delivery',
        adminNotes: '',
        createdAt: '2024-03-17T08:30:00Z',
        updatedAt: '2024-03-17T08:30:00Z',
        createdBy: 'customer',
    },
];

// ============ Helper Components ============

const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const config = {
        pending: { label: 'Pending', className: 'badge-warning' },
        processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
        completed: { label: 'Completed', className: 'badge-success' },
        cancelled: { label: 'Cancelled', className: 'badge-danger' },
        refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-700' },
    };
    const { label, className } = config[status];
    return <span className={`badge ${className}`}>{label}</span>;
};

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
    const config = {
        paid: { label: 'Paid', className: 'badge-success' },
        unpaid: { label: 'Unpaid', className: 'badge-warning' },
        failed: { label: 'Failed', className: 'badge-danger' },
    };
    const { label, className } = config[status];
    return <span className={`badge ${className}`}>{label}</span>;
};



// Assign Customer Modal
const AssignCustomerModal = ({
    isOpen,
    onClose,
    onAssign,
    onCreateCustomer
}: {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (customer: Customer) => void;
    onCreateCustomer: () => void;
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (searchQuery.length > 1) {
            setIsSearching(true);
            const timer = setTimeout(() => {
                const results = MOCK_CUSTOMERS.filter(c =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.phone.includes(searchQuery) ||
                    c.email.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSearchResults(results);
                setIsSearching(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface rounded-xl shadow-xl max-w-md w-full"
            >
                <div className="flex items-center justify-between p-5 border-b border-default">
                    <h3 className="text-lg font-semibold">Assign Customer</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        <HiX className="w-5 h-5 text-muted" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name, phone or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-9"
                            autoFocus
                        />
                    </div>

                    <div className="mt-4 max-h-80 overflow-y-auto">
                        {isSearching ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.map(customer => (
                                    <button
                                        key={customer.id}
                                        onClick={() => onAssign(customer)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition border border-default"
                                    >
                                        <p className="font-medium">{customer.name}</p>
                                        <p className="text-sm text-muted">{customer.phone} • {customer.email}</p>
                                    </button>
                                ))}
                            </div>
                        ) : searchQuery.length > 1 ? (
                            <div className="text-center py-8">
                                <p className="text-muted">No customers found</p>
                                <button
                                    onClick={onCreateCustomer}
                                    className="mt-3 btn btn-primary btn-sm"
                                >
                                    <HiOutlinePlusCircle className="w-4 h-4" />
                                    Create New Customer
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted">
                                Type to search for customers
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Order Details Drawer
const OrderDetailsDrawer = ({
    order,
    isOpen,
    onClose,
    onAssign,
    onUpdateStatus,
    onCreateCustomer,
}: {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (orderId: string, customer: Customer) => void;
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
    onCreateCustomer: () => void;
}) => {
    const [isUpdating, setIsUpdating] = useState(false);

    if (!order) return null;

    const handleStatusChange = async (newStatus: OrderStatus) => {
        setIsUpdating(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onUpdateStatus(order.id, newStatus);
        setIsUpdating(false);
    };

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
                                <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
                                <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-6">
                            {/* Order Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted">Order Status</p>
                                    <StatusBadge status={order.status} />
                                </div>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                                    disabled={isUpdating}
                                    className="input w-auto text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Customer Info */}
                            <div className="border border-default rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <HiOutlineUser className="w-4 h-4" />
                                    Customer Information
                                </h3>
                                {order.customer ? (
                                    <div className="space-y-2">
                                        <p className="font-medium">{order.customer.name}</p>
                                        <p className="text-sm text-muted flex items-center gap-2">
                                            <HiOutlineMail className="w-4 h-4" />
                                            {order.customer.email}
                                        </p>
                                        <p className="text-sm text-muted flex items-center gap-2">
                                            <HiOutlinePhone className="w-4 h-4" />
                                            {order.customer.phone}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted mb-3">No customer assigned</p>
                                        <button
                                            onClick={() => onAssign(order.id, {} as Customer)}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <HiOutlineUserAdd className="w-4 h-4" />
                                            Assign Customer
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Items */}
                            <div className="border border-default rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <HiOutlineShoppingBag className="w-4 h-4" />
                                    Items ({order.items.length})
                                </h3>
                                <div className="space-y-3">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-3 pb-3 border-b border-default last:border-0">
                                            {item.image && (
                                                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <Image src={item.image} alt={item.productName} width={48} height={48} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-muted">Qty: {item.quantity}</p>
                                                {item.variant && <p className="text-xs text-muted">{item.variant}</p>}
                                            </div>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="border border-default rounded-lg p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <HiOutlineCreditCard className="w-4 h-4" />
                                    Payment Information
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Payment Status</span>
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                    {order.paymentMethod && (
                                        <div className="flex justify-between">
                                            <span className="text-muted">Payment Method</span>
                                            <span className="capitalize">{order.paymentMethod}</span>
                                        </div>
                                    )}
                                    {order.transactionId && (
                                        <div className="flex justify-between">
                                            <span className="text-muted">Transaction ID</span>
                                            <span className="text-sm">{order.transactionId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="border border-default rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Price Breakdown</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Subtotal</span>
                                        <span>${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Tax</span>
                                        <span>${order.tax.toFixed(2)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-${order.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-default font-semibold">
                                        <span>Total</span>
                                        <span>${order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {(order.notes || order.adminNotes) && (
                                <div className="border border-default rounded-lg p-4">
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <HiOutlineNote className="w-4 h-4" />
                                        Notes
                                    </h3>
                                    {order.notes && <p className="text-sm text-muted"><strong>Customer:</strong> {order.notes}</p>}
                                    {order.adminNotes && <p className="text-sm text-muted mt-2"><strong>Admin:</strong> {order.adminNotes}</p>}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Create Order Modal (Simplified)
const CreateOrderModal = ({ isOpen, onClose, onCreate }: any) => {
    const [step, setStep] = useState(1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-surface border-b border-default p-5 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Create New Order</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex mb-6">
                        {['Products', 'Customer', 'Review'].map((label, idx) => (
                            <div key={idx} className="flex-1 text-center relative">
                                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-medium ${step > idx ? 'bg-green-500 text-white' : step === idx + 1 ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > idx ? <HiOutlineCheck className="w-4 h-4" /> : idx + 1}
                                </div>
                                <p className="text-xs mt-1 text-muted">{label}</p>
                                {idx < 2 && <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step > idx ? 'bg-brand-500' : 'bg-gray-200'}`} style={{ transform: 'translateX(-50%)' }} />}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-muted text-center py-8">Product selection UI would go here with search, filters, and quantity controls.</p>
                            <button onClick={() => setStep(2)} className="btn btn-primary w-full">Continue to Customer</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-muted text-center py-8">Customer assignment UI - search existing or create new.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">Back</button>
                                <button onClick={() => setStep(3)} className="btn btn-primary flex-1">Review Order</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <p className="text-muted text-center py-8">Order summary and final creation.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">Back</button>
                                <button onClick={onCreate} className="btn btn-primary flex-1">Create Order</button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ============ Main Component ============
export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
    const [selectedOrderType, setSelectedOrderType] = useState<string>('all');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Filter orders
    const filteredOrders = useMemo(() => {
        let filtered = orders;

        if (searchQuery) {
            filtered = filtered.filter(o =>
                o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.customer?.phone?.includes(searchQuery)) ||
                (o.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(o => o.status === selectedStatus);
        }

        if (selectedPaymentStatus !== 'all') {
            filtered = filtered.filter(o => o.paymentStatus === selectedPaymentStatus);
        }

        if (selectedOrderType !== 'all') {
            filtered = filtered.filter(o => o.orderType === selectedOrderType);
        }

        // Date filtering
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRange === 'today') {
            filtered = filtered.filter(o => new Date(o.createdAt) >= today);
        } else if (dateRange === 'week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(o => new Date(o.createdAt) >= weekAgo);
        } else if (dateRange === 'month') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(o => new Date(o.createdAt) >= monthAgo);
        }

        return filtered;
    }, [orders, searchQuery, selectedStatus, selectedPaymentStatus, selectedOrderType, dateRange]);

    // KPIs
    const kpis = useMemo(() => ({
        totalOrders: filteredOrders.length,
        totalRevenue: filteredOrders.reduce((sum, o) => sum + o.total, 0),
        pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
        completedOrders: filteredOrders.filter(o => o.status === 'completed').length,
        cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
    }), [filteredOrders]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsDrawerOpen(true);
    };

    const handleAssignCustomer = (orderId: string) => {
        setAssigningOrderId(orderId);
        setIsAssignModalOpen(true);
    };

    const handleAssign = (customer: Customer) => {
        if (assigningOrderId) {
            setOrders(prev => prev.map(order =>
                order.id === assigningOrderId
                    ? { ...order, customerId: customer.id, customer }
                    : order
            ));
        }
        setIsAssignModalOpen(false);
        setAssigningOrderId(null);

        // Close drawer if open and update selected order
        if (selectedOrder && selectedOrder.id === assigningOrderId) {
            const updatedOrder = orders.find(o => o.id === assigningOrderId);
            if (updatedOrder) setSelectedOrder({ ...updatedOrder, customerId: customer.id, customer });
        }
    };

    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
        ));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const handleCreateCustomer = () => {
        setIsAssignModalOpen(false);
        // In a real app, you'd navigate to customers page with a return callback
        // window.location.href = '/admin/customers?returnTo=/admin/orders';
        alert('Navigate to Customers page to create a new customer');
    };

    const handleCreateOrder = () => {
        const newOrder: Order = {
            id: Date.now().toString(),
            orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
            customerId: null,
            customer: null,
            status: 'pending',
            paymentStatus: 'unpaid',
            orderType: 'delivery',
            items: [],
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,
            currency: 'USD',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'admin',
        };
        setOrders(prev => [newOrder, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleBulkAction = (action: string) => {
        if (action === 'completed') {
            setOrders(prev => prev.map(order =>
                selectedRows.has(order.id) ? { ...order, status: 'completed' as OrderStatus } : order
            ));
        } else if (action === 'export') {
            const selectedOrders = orders.filter(o => selectedRows.has(o.id));
            console.log('Exporting:', selectedOrders);
            alert(`Exporting ${selectedOrders.length} orders to CSV`);
        }
        setSelectedRows(new Set());
    };

    const toggleRowSelection = (orderId: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllRows = () => {
        if (selectedRows.size === paginatedOrders.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedOrders.map(o => o.id)));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Page Header */}
                <DashboardHeader title="Orders" subTitle="Manage and track all customer orders"
                    button={{
                        text: "Create Order",
                        onClick: () => setIsCreateModalOpen(true),
                    }}
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <KPICard title="Total Orders" value={kpis.totalOrders} icon={HiOutlineShoppingBag} color="bg-blue-500" />
                    <KPICard title="Total Revenue" value={`$${kpis.totalRevenue.toFixed(2)}`} icon={HiOutlineCurrencyDollar} color="bg-green-500" trend="+12% vs last week" />
                    <KPICard title="Pending" value={kpis.pendingOrders} icon={HiOutlineClock} color="bg-yellow-500" />
                    <KPICard title="Completed" value={kpis.completedOrders} icon={HiOutlineCheckCircle} color="bg-green-500" />
                    <KPICard title="Cancelled" value={kpis.cancelledOrders} icon={HiOutlineXCircle} color="bg-red-500" />
                </div>

                {/* Search and Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by order number, customer name, phone or email..."
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
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value as any)}
                                className="input w-auto"
                            >
                                <option value="today">Today</option>
                                <option value="week">Last 7 days</option>
                                <option value="month">Last 30 days</option>
                                <option value="custom">Custom range</option>
                            </select>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="input w-auto"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                className="input w-auto"
                            >
                                <option value="all">All Payment</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="failed">Failed</option>
                            </select>
                            <select
                                value={selectedOrderType}
                                onChange={(e) => setSelectedOrderType(e.target.value)}
                                className="input w-auto"
                            >
                                <option value="all">All Types</option>
                                <option value="delivery">Delivery</option>
                                <option value="pickup">Pickup</option>
                                <option value="dine_in">Dine-in</option>
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
                        <span className="text-sm font-medium">{selectedRows.size} orders selected</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleBulkAction('completed')} className="btn btn-primary btn-sm">
                                Mark Completed
                            </button>
                            <button onClick={() => handleBulkAction('export')} className="btn btn-secondary btn-sm">
                                Export Selected
                            </button>
                            <button onClick={() => setSelectedRows(new Set())} className="btn btn-ghost btn-sm">
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Orders Table - Desktop */}
                <div className="hidden lg:block bg-surface rounded-xl border border-default overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50 border-b border-default sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.size === paginatedOrders.length && paginatedOrders.length > 0}
                                            onChange={toggleAllRows}
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Order</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Items</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="wait">
                                    {paginatedOrders.map((order) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-default hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => handleViewOrder(order)}
                                        >
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(order.id)}
                                                    onChange={() => toggleRowSelection(order.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono font-medium">{order.orderNumber}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.customer ? (
                                                    <div>
                                                        <p className="font-medium">{order.customer.name}</p>
                                                        <p className="text-xs text-muted">{order.customer.phone}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted italic">Unassigned</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAssignCustomer(order.id);
                                                            }}
                                                            className="p-1 text-brand-500 hover:bg-green-50 rounded"
                                                        >
                                                            <HiOutlineUserAdd className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{order.items.length} item(s)</td>
                                            <td className="px-4 py-3 font-medium">${order.total.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <PaymentStatusBadge status={order.paymentStatus} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-4 py-3 text-muted text-sm">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleViewOrder(order)}
                                                        className="p-1.5 rounded-md hover:bg-gray-100 transition"
                                                        title="View Details"
                                                    >
                                                        <HiOutlineEye className="w-4 h-4 text-muted" />
                                                    </button>
                                                    {!order.customer && (
                                                        <button
                                                            onClick={() => handleAssignCustomer(order.id)}
                                                            className="p-1.5 rounded-md hover:bg-gray-100 transition"
                                                            title="Assign Customer"
                                                        >
                                                            <HiOutlineUserAdd className="w-4 h-4 text-brand-500" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Orders Cards - Mobile */}
                <div className="lg:hidden space-y-3">
                    <AnimatePresence mode="wait">
                        {paginatedOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-surface rounded-xl border border-default p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-mono font-semibold">{order.orderNumber}</p>
                                        <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                <div className="mb-3">
                                    {order.customer ? (
                                        <div>
                                            <p className="font-medium">{order.customer.name}</p>
                                            <p className="text-sm text-muted">{order.customer.phone}</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted italic">Unassigned</span>
                                            <button
                                                onClick={() => handleAssignCustomer(order.id)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <HiOutlineUserAdd className="w-4 h-4" />
                                                Assign
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-default">
                                    <div>
                                        <p className="text-sm text-muted">{order.items.length} items</p>
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="text-brand-500 text-sm mt-1"
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Empty State */}
                {paginatedOrders.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-default"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <HiOutlineShoppingBag className="w-8 h-8 text-muted" />
                        </div>
                        <h3 className="text-lg font-medium">No orders found</h3>
                        <p className="text-muted mt-1">Try adjusting your search or filters</p>
                        <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary mt-4">
                            <HiOutlinePlus className="w-4 h-4" />
                            Create your first order
                        </button>
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                        <p className="text-sm text-muted">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
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
            <AssignCustomerModal
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false);
                    setAssigningOrderId(null);
                }}
                onAssign={handleAssign}
                onCreateCustomer={handleCreateCustomer}
            />

            <OrderDetailsDrawer
                order={selectedOrder}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onAssign={handleAssignCustomer}
                onUpdateStatus={handleUpdateStatus}
                onCreateCustomer={handleCreateCustomer}
            />

            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateOrder}
            />
        </>
    );
}