'use client'

import { useState, useMemo, useEffect, useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KPICard from '@/components/dashboard/KPICard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineFilter,
  HiOutlineUser, HiOutlineShoppingBag, HiOutlineCurrencyDollar,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineEye,
  HiOutlineUserAdd, HiOutlineTrash, HiOutlineChevronLeft, HiOutlineChevronRight,
  HiOutlineMail, HiOutlinePhone, HiOutlineCreditCard, HiOutlineDocumentText,
  HiX, HiOutlineCheck, HiOutlinePlusCircle, HiOutlineMinusCircle,
  HiOutlineExclamationCircle, HiOutlinePhotograph, HiOutlineRefresh,
} from 'react-icons/hi'
import Image from 'next/image'

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  assignCustomerToOrder,  // ✅ FIX 3: imported
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
  type OrderType,
  type CreateOrderInput,
} from '@/actions/orders'
import { searchCustomers, createCustomer, type Customer } from '@/actions/customers'
import { getProducts, type Product } from '@/actions/products'

// ── Types ──────────────────────────────────────────────────

type AnyOrder = Awaited<ReturnType<typeof getOrders>>['data'] extends (infer T)[] | null ? T : never

interface CartItem {
  product_id: string
  product_name: string
  image_url?: string
  unit_price: number
  quantity: number
  stock: number
}

// ── Helpers ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
}

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' },
  unpaid: { label: 'Unpaid', className: 'bg-amber-100 text-amber-700' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-600' },
}

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

const PaymentBadge = ({ status }: { status: string }) => {
  const cfg = PAYMENT_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

const Spinner = ({ sm }: { sm?: boolean }) => (
  <div className={`${sm ? 'w-4 h-4 border-2' : 'w-8 h-8 border-[3px]'} border-brand-500 border-t-transparent rounded-full animate-spin`} />
)

const Toast = ({
  message, type, onDismiss,
}: {
  message: string
  type: 'success' | 'error'
  onDismiss: () => void
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
  >
    {type === 'success'
      ? <HiOutlineCheck className="w-4 h-4 flex-shrink-0" />
      : <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />}
    <span>{message}</span>
    <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
      <HiX className="w-4 h-4" />
    </button>
  </motion.div>
)

// ── Assign Customer Modal ──────────────────────────────────

const AssignCustomerModal = ({
  isOpen, onClose, onAssign,
}: {
  isOpen: boolean
  onClose: () => void
  onAssign: (customer: Customer) => void
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' })

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setShowCreate(false)
      setCreateError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    setIsSearching(true)
    const t = setTimeout(async () => {
      const { data } = await searchCustomers(query)
      setResults(data ?? [])
      setIsSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleCreate = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      setCreateError('Name and phone are required')
      return
    }
    setCreating(true)
    const { data, error } = await createCustomer({
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
    })
    setCreating(false)
    if (error || !data) { setCreateError(error ?? 'Failed to create customer'); return }
    onAssign(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-5 border-b border-default">
          <h3 className="text-lg font-semibold">Assign Customer</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <HiX className="w-5 h-5 text-muted" />
          </button>
        </div>
        <div className="p-5">
          {!showCreate ? (
            <>
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="input pl-9"
                />
              </div>
              <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="flex justify-center py-8"><Spinner sm /></div>
                ) : results.length > 0 ? (
                  results.map(c => (
                    <button key={c.id} onClick={() => onAssign(c)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition border border-default">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                    </button>
                  ))
                ) : query.length >= 2 ? (
                  <div className="text-center py-6">
                    <p className="text-muted mb-3">No customers found for "{query}"</p>
                    <button
                      onClick={() => { setShowCreate(true); setNewCustomer(p => ({ ...p, name: query })) }}
                      className="btn btn-primary btn-sm"
                    >
                      <HiOutlinePlusCircle className="w-4 h-4" /> Create New Customer
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-muted py-6">Type at least 2 characters to search</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-default">
                <button onClick={() => setShowCreate(true)} className="btn btn-secondary w-full">
                  <HiOutlinePlusCircle className="w-4 h-4" /> Create New Customer
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => { setShowCreate(false); setCreateError('') }}
                className="flex items-center gap-1 text-sm text-muted hover:text-default transition"
              >
                ← Back to search
              </button>
              <h4 className="font-medium">New Customer</h4>
              {createError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{createError}</p>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                  <input value={newCustomer.name}
                    onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                    className="input" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
                  <input value={newCustomer.phone}
                    onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                    className="input" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input value={newCustomer.email}
                    onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                    className="input" placeholder="optional@email.com" type="email" />
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="btn btn-primary w-full">
                {creating ? <><Spinner sm /><span className="ml-2">Creating...</span></> : 'Create & Assign Customer'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Create Order Modal ─────────────────────────────────────

const CreateOrderModal = ({
  isOpen, onClose, onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}) => {
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()

  const [productSearch, setProductSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [showAssignInModal, setShowAssignInModal] = useState(false)

  const [orderType, setOrderType] = useState<OrderType>('in_store')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [tax, setTax] = useState('')
  const [discount, setDiscount] = useState('')
  const [notes, setNotes] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setStep(1); setCart([]); setCustomer(null); setProductSearch('')
      setProducts([]); setOrderType('in_store'); setPaymentMethod('cash')
      setTax(''); setDiscount(''); setNotes(''); setAdminNotes(''); setSubmitError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setLoadingProducts(true)
    const t = setTimeout(async () => {
      const { data } = await getProducts({ search: productSearch || undefined, status: 'active', pageSize: 30 })
      setProducts((data as Product[]) ?? [])
      setLoadingProducts(false)
    }, 300)
    return () => clearTimeout(t)
  }, [productSearch, isOpen])

  const getFeaturedImage = (p: Product) =>
    p.product_images?.find(i => i.is_featured)?.url ?? p.product_images?.[0]?.url

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === p.id)
      if (existing) return prev.map(i =>
        i.product_id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i
      )
      return [...prev, {
        product_id: p.id,
        product_name: p.name,
        image_url: getFeaturedImage(p),
        unit_price: p.price,
        quantity: 1,
        stock: p.stock,
      }]
    })
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.product_id !== productId)); return }
    setCart(prev => prev.map(i =>
      i.product_id === productId ? { ...i, quantity: Math.min(qty, i.stock) } : i
    ))
  }

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const taxAmt = parseFloat(tax) || 0
  const discountAmt = parseFloat(discount) || 0
  const total = Math.max(0, subtotal + taxAmt - discountAmt)

  const handleSubmit = () => {
    setSubmitError('')
    if (cart.length === 0) { setSubmitError('Add at least one product'); return }

    startTransition(async () => {
      const input: CreateOrderInput = {
        customer_id: customer?.id ?? undefined,  // ✅ FIX 1: optional
        items: cart.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          image_url: i.image_url,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        order_type: orderType,
        payment_method: paymentMethod,
        tax: taxAmt,
        discount: discountAmt,
        notes: notes || undefined,
        admin_notes: adminNotes || undefined,
      }
      const { error } = await createOrder(input)
      if (error) { setSubmitError(error); return }
      onCreated()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-default flex-shrink-0">
          <h3 className="text-lg font-semibold">Create New Order</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <HiX className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-5 pt-5 gap-2 flex-shrink-0">
          {[{ n: 1, label: 'Products' }, { n: 2, label: 'Customer' }, { n: 3, label: 'Review' }].map(({ n, label }, idx) => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div className={`flex items-center gap-2 ${n <= step ? 'text-brand-600' : 'text-muted'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${step > n ? 'bg-emerald-500 text-white' : n === step ? 'bg-brand-500 text-white' : 'bg-gray-100 text-muted'
                  }`}>
                  {step > n ? <HiOutlineCheck className="w-3.5 h-3.5" /> : n}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
              {idx < 2 && <div className={`flex-1 h-px ${step > n ? 'bg-brand-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Step 1: Products */}
          {step === 1 && (
            <div className="flex gap-4 min-h-[400px]">
              <div className="flex-1 min-w-0">
                <div className="relative mb-3">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="input pl-9"
                  />
                </div>
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {loadingProducts ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                  ) : products.length === 0 ? (
                    <div className="text-center text-muted py-10">No active products found</div>
                  ) : products.map(p => {
                    const inCart = cart.find(i => i.product_id === p.id)
                    const img = getFeaturedImage(p)
                    return (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer hover:border-brand-300 ${inCart ? 'border-brand-300 bg-brand-50/30' : 'border-default'
                          }`}
                      >
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {img
                            ? <Image src={img} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                            : <HiOutlinePhotograph className="w-5 h-5 text-muted" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted">Stock: {p.stock} · ${p.price.toFixed(2)}</p>
                        </div>
                        {inCart
                          ? <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full flex-shrink-0">×{inCart.quantity}</span>
                          : <HiOutlinePlusCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Cart */}
              <div className="w-64 flex-shrink-0 border-l border-default pl-4 flex flex-col">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Cart ({cart.length})</p>
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted text-sm text-center px-2">
                    Click products to add them
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product_id} className="border border-default rounded-lg p-2.5">
                        <p className="text-sm font-medium leading-tight truncate">{item.product_name}</p>
                        <p className="text-xs text-muted mb-2">${item.unit_price.toFixed(2)} each</p>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                            className="p-0.5 hover:text-red-500 transition">
                            <HiOutlineMinusCircle className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateQty(item.product_id, parseInt(e.target.value) || 0)}
                            className="w-12 text-center text-sm border border-default rounded-md py-0.5 px-1"
                            min={1} max={item.stock}
                          />
                          <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                            className="p-0.5 hover:text-brand-500 transition">
                            <HiOutlinePlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-3 border-t border-default mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customer (optional) */}
          {step === 2 && (
            <div className="max-w-md mx-auto">
              {customer ? (
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <HiOutlineUser className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted">{customer.phone}</p>
                        {customer.email && <p className="text-sm text-muted">{customer.email}</p>}
                      </div>
                    </div>
                    <button onClick={() => setCustomer(null)} className="text-sm text-muted hover:text-red-500 transition">
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <HiOutlineUser className="w-8 h-8 text-muted" />
                  </div>
                  <p className="text-muted mb-2">No customer assigned</p>
                  <p className="text-xs text-muted mb-4">You can assign a customer now or later from the order details</p>
                  <button onClick={() => setShowAssignInModal(true)} className="btn btn-primary">
                    <HiOutlineUserAdd className="w-4 h-4" /> Search or Create Customer
                  </button>
                </div>
              )}
              <AssignCustomerModal
                isOpen={showAssignInModal}
                onClose={() => setShowAssignInModal(false)}
                onAssign={c => { setCustomer(c); setShowAssignInModal(false) }}
              />
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex gap-2 items-start">
                  <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {submitError}
                </div>
              )}

              {/* Items summary */}
              <div className="border border-default rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-default">
                  <p className="text-sm font-semibold">Items ({cart.length})</p>
                </div>
                <div className="divide-y divide-default">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer (optional) */}
              {customer ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-default">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <HiOutlineUser className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted">{customer.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <HiOutlineExclamationCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">No customer assigned — you can assign one after creating the order</p>
                </div>
              )}

              {/* Order meta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Order Type</label>
                  <select value={orderType} onChange={e => setOrderType(e.target.value as OrderType)} className="input">
                    <option value="in_store">In Store</option>
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="input">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax ($)</label>
                  <input type="number" value={tax} onChange={e => setTax(e.target.value)}
                    className="input" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount ($)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                    className="input" placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="input resize-none" rows={2} placeholder="Notes visible to customer..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  className="input resize-none" rows={2} placeholder="Internal notes..." />
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {taxAmt > 0 && <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span>${taxAmt.toFixed(2)}</span></div>}
                {discountAmt > 0 && <div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>−${discountAmt.toFixed(2)}</span></div>}
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-default">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-default flex-shrink-0">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-secondary flex-1" disabled={isPending}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && cart.length === 0}
              className="btn btn-primary flex-1"
            >
              {step === 1
                ? `Continue with ${cart.length} item${cart.length !== 1 ? 's' : ''}`
                : 'Review Order'}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending || cart.length === 0}
              className="btn btn-primary flex-1"
            >
              {isPending
                ? <><Spinner sm /><span className="ml-2">Creating...</span></>
                : `Create Order · $${total.toFixed(2)}`}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Order Details Drawer ───────────────────────────────────

const OrderDetailsDrawer = ({
  order, isOpen, onClose, onRefresh, onToast,
}: {
  order: AnyOrder | null
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
  onToast: (message: string, type: 'success' | 'error') => void
}) => {
  const [fullOrder, setFullOrder] = useState<any>(null)          // ✅ FIX 4: full order with items
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)          // ✅ FIX 5: now actually used
  const [statusError, setStatusError] = useState('')

  // ✅ FIX 4: load full order (with items) whenever drawer opens
  useEffect(() => {
    if (!order || !isOpen) { setFullOrder(null); return }
    setIsLoadingDetails(true)
    setStatusError('')
    setConfirmDelete(false)
    getOrderById(order.id).then(({ data, error }) => {
      if (error) onToast('Failed to load order details', 'error')
      else setFullOrder(data)
      setIsLoadingDetails(false)
    })
  }, [order?.id, isOpen])

  const displayOrder = fullOrder ?? order
  const customer = displayOrder?.customers as any

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!displayOrder) return
    setStatusError('')
    setUpdatingStatus(true)
    const { error } = await updateOrderStatus(displayOrder.id, { status: newStatus })
    setUpdatingStatus(false)
    if (error) { setStatusError(error); return }
    // Refresh full order after status change
    const { data } = await getOrderById(displayOrder.id)
    if (data) setFullOrder(data)
    onRefresh()
    onToast(`Order marked as ${newStatus}`, 'success')
  }

  const handleDelete = async () => {
    if (!displayOrder) return
    setDeleting(true)
    const { error } = await deleteOrder(displayOrder.id)
    setDeleting(false)
    if (error) { setStatusError(error); setConfirmDelete(false); return }
    onClose()
    onRefresh()
    onToast('Order deleted', 'success')
  }

  // ✅ FIX 5: assign customer from inside the drawer
  const handleAssignCustomer = async (c: Customer) => {
    if (!displayOrder) return
    const { error } = await assignCustomerToOrder(displayOrder.id, c.id)
    setIsAssigning(false)
    if (error) { onToast(error, 'error'); return }
    const { data } = await getOrderById(displayOrder.id)
    if (data) setFullOrder(data)
    onRefresh()
    onToast(`${c.name} assigned successfully`, 'success')
  }

  return (
    <AnimatePresence>
      {isOpen && order && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-surface shadow-xl z-50 overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-surface border-b border-default p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-semibold font-mono">{displayOrder?.order_number}</h2>
                <p className="text-sm text-muted">
                  {displayOrder?.created_at ? new Date(displayOrder.created_at).toLocaleString() : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {displayOrder?.status === 'pending' && (
                  <button onClick={() => setConfirmDelete(true)}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition" title="Delete order">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 space-y-5">
              {/* Loading state */}
              {isLoadingDetails && (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              )}

              {!isLoadingDetails && displayOrder && (
                <>
                  {statusError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm flex gap-2 items-center">
                      <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" /> {statusError}
                    </div>
                  )}

                  {/* Status row */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl flex-wrap">
                    <div className="flex-1 min-w-[80px]">
                      <p className="text-xs text-muted mb-1">Order Status</p>
                      <StatusBadge status={displayOrder.status} />
                    </div>
                    <div className="flex-1 min-w-[80px]">
                      <p className="text-xs text-muted mb-1">Payment</p>
                      <PaymentBadge status={displayOrder.payment_status} />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Change Status</p>
                      <select
                        value={displayOrder.status}
                        onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                        disabled={
                          updatingStatus ||
                          displayOrder.status === 'cancelled' ||
                          displayOrder.status === 'completed'
                        }
                        className="input w-auto text-sm py-1.5"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="border border-default rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <HiOutlineUser className="w-4 h-4" /> Customer
                    </h3>
                    {customer ? (
                      <div className="space-y-1.5">
                        <p className="font-medium">{customer.name}</p>
                        {customer.email && (
                          <p className="text-sm text-muted flex items-center gap-2">
                            <HiOutlineMail className="w-3.5 h-3.5" />{customer.email}
                          </p>
                        )}
                        {customer.phone && (
                          <p className="text-sm text-muted flex items-center gap-2">
                            <HiOutlinePhone className="w-3.5 h-3.5" />{customer.phone}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-muted text-sm italic">No customer assigned</span>
                        {/* ✅ FIX 5: assign button now works from inside the drawer */}
                        <button onClick={() => setIsAssigning(true)} className="btn btn-primary btn-sm">
                          <HiOutlineUserAdd className="w-4 h-4" /> Assign
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="border border-default rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-default flex items-center gap-2">
                      <HiOutlineShoppingBag className="w-4 h-4 text-muted" />
                      <span className="text-sm font-semibold">
                        Items ({fullOrder?.items?.length ?? 0})
                      </span>
                    </div>
                    {fullOrder?.items?.length > 0 ? (
                      <div className="divide-y divide-default">
                        {fullOrder.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                            {item.image_url && (
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={item.image_url}
                                  alt={item.product_name}
                                  width={40} height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.product_name}</p>
                              {item.variant && <p className="text-xs text-muted">{item.variant}</p>}
                              <p className="text-xs text-muted">
                                Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              ${Number(item.total_price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted text-center py-4">No items found</p>
                    )}
                  </div>

                  {/* Payment */}
                  <div className="border border-default rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <HiOutlineCreditCard className="w-4 h-4" /> Payment
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Method</span>
                        <span className="capitalize">{displayOrder.payment_method ?? '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Type</span>
                        <span className="capitalize">{displayOrder.order_type?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Subtotal</span>
                        <span>${Number(displayOrder.subtotal ?? 0).toFixed(2)}</span>
                      </div>
                      {Number(displayOrder.tax) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted">Tax</span>
                          <span>${Number(displayOrder.tax).toFixed(2)}</span>
                        </div>
                      )}
                      {Number(displayOrder.discount) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>−${Number(displayOrder.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-base pt-2 border-t border-default">
                        <span>Total</span>
                        <span>${Number(displayOrder.total ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(displayOrder.notes || displayOrder.admin_notes) && (
                    <div className="border border-default rounded-xl p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <HiOutlineDocumentText className="w-4 h-4" /> Notes
                      </h3>
                      {displayOrder.notes && (
                        <p className="text-sm text-muted">
                          <span className="font-medium text-default">Customer:</span> {displayOrder.notes}
                        </p>
                      )}
                      {displayOrder.admin_notes && (
                        <p className="text-sm text-muted mt-1.5">
                          <span className="font-medium text-default">Admin:</span> {displayOrder.admin_notes}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Delete confirm bar */}
            {confirmDelete && (
              <div className="sticky bottom-0 bg-red-50 border-t border-red-200 p-4">
                <p className="text-sm font-medium text-red-700 mb-3">
                  Delete this pending order? Stock will be restored.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="btn btn-secondary flex-1 btn-sm">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="btn bg-red-600 hover:bg-red-700 text-white flex-1 btn-sm">
                    {deleting ? <><Spinner sm /><span className="ml-2">Deleting...</span></> : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ✅ FIX 5: AssignCustomerModal now renders inside the drawer */}
      <AssignCustomerModal
        isOpen={isAssigning}
        onClose={() => setIsAssigning(false)}
        onAssign={handleAssignCustomer}
      />
    </AnimatePresence>
  )
}

// ── Main Page ──────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<AnyOrder[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 20

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState<AnyOrder | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [assigningOrder, setAssigningOrder] = useState<AnyOrder | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isPending, startTransition] = useTransition()

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const fetchOrders = useCallback(async (
    page = currentPage,
    search = searchQuery,
    status = statusFilter,
    payment = paymentFilter
  ) => {
    setIsLoading(true)
    const { data, count, error } = await getOrders({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      status: status !== 'all' ? status as OrderStatus : undefined,
      payment_status: payment !== 'all' ? payment as PaymentStatus : undefined,
    })
    setIsLoading(false)
    if (error) { showToast(error, 'error'); return }
    setOrders(data ?? [])
    setTotalCount(count ?? 0)
  }, [currentPage, searchQuery, statusFilter, paymentFilter, showToast])

  // ✅ FIX 6: single consolidated useEffect instead of three
  useEffect(() => {
    const isFilterChange = true
    const delay = isFilterChange ? 350 : 0
    const t = setTimeout(() => {
      fetchOrders(currentPage, searchQuery, statusFilter, paymentFilter)
    }, delay)
    return () => clearTimeout(t)
  }, [currentPage, searchQuery, statusFilter, paymentFilter])

  const kpis = useMemo(() => ({
    revenue: orders.reduce((s, o) => s + (o.total ?? 0), 0),
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }), [orders])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const toggleRow = (id: string) => {
    setSelectedRows(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.size === orders.length ? new Set() : new Set(orders.map(o => o.id))
    )
  }

  return (
    <>
      <div className="space-y-6">
        <DashboardHeader
          title="Orders"
          subTitle="Manage and track all customer orders"
          button={{ text: 'Create Order', onClick: () => setIsCreateOpen(true) }}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Total Orders" value={totalCount} icon={HiOutlineShoppingBag} color="bg-blue-500" />
          <KPICard title="Revenue" value={`$${kpis.revenue.toFixed(2)}`} icon={HiOutlineCurrencyDollar} color="bg-emerald-500" />
          <KPICard title="Pending" value={kpis.pending} icon={HiOutlineClock} color="bg-amber-500" />
          <KPICard title="Completed" value={kpis.completed} icon={HiOutlineCheckCircle} color="bg-emerald-500" />
          <KPICard title="Cancelled" value={kpis.cancelled} icon={HiOutlineXCircle} color="bg-red-500" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowFilters(f => !f)} className="btn btn-secondary lg:hidden">
              <HiOutlineFilter className="w-4 h-4" /> Filters
            </button>
            <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex gap-2 flex-wrap`}>
              <select value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                className="input w-auto">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select value={paymentFilter}
                onChange={e => { setPaymentFilter(e.target.value); setCurrentPage(1) }}
                className="input w-auto">
                <option value="all">All Payment</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={() => fetchOrders(currentPage, searchQuery, statusFilter, paymentFilter)}
                className="btn btn-secondary" title="Refresh">
                <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selectedRows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-brand-50 border border-brand-200 rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-sm font-medium">
                {selectedRows.size} order{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(async () => {
                    const count = selectedRows.size
                    await Promise.all(
                      [...selectedRows].map(id => updateOrderStatus(id, { status: 'completed' }))
                    )
                    setSelectedRows(new Set())
                    fetchOrders()
                    showToast(`${count} orders marked as completed`)
                  })}
                  className="btn btn-primary btn-sm"
                >
                  Mark Completed
                </button>
                <button onClick={() => setSelectedRows(new Set())} className="btn btn-ghost btn-sm">
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table — Desktop */}
        <div className="hidden lg:block bg-surface rounded-xl border border-default overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-default">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox"
                        checked={selectedRows.size === orders.length && orders.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    {['Order', 'Customer', 'Total', 'Payment', 'Status', 'Type', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="wait">
                    {orders.map(order => {
                      const cust = order.customers as any
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-default hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => { setSelectedOrder(order); setIsDrawerOpen(true) }}
                        >
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedRows.has(order.id)}
                              onChange={() => toggleRow(order.id)} className="rounded border-gray-300" />
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-sm">{order.order_number}</td>
                          <td className="px-4 py-3">
                            {cust ? (
                              <div>
                                <p className="font-medium">{cust.name}</p>
                                <p className="text-xs text-muted">{cust.phone}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted italic text-xs">Unassigned</span>
                                <button
                                  onClick={e => { e.stopPropagation(); setAssigningOrder(order) }}
                                  className="p-1 text-brand-500 hover:bg-brand-50 rounded transition"
                                  title="Assign customer"
                                >
                                  <HiOutlineUserAdd className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold">${Number(order.total ?? 0).toFixed(2)}</td>
                          <td className="px-4 py-3"><PaymentBadge status={order.payment_status} /></td>
                          <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-3 text-xs text-muted capitalize">
                            {order.order_type?.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => { setSelectedOrder(order); setIsDrawerOpen(true) }}
                              className="p-1.5 rounded-md hover:bg-gray-100 transition"
                            >
                              <HiOutlineEye className="w-4 h-4 text-muted" />
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cards — Mobile */}
        <div className="lg:hidden space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : orders.map(order => {
            const cust = order.customers as any
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-xl border border-default p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono font-semibold">{order.order_number}</p>
                    <p className="text-xs text-muted">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mb-3">
                  {cust ? (
                    <div>
                      <p className="font-medium">{cust.name}</p>
                      <p className="text-sm text-muted">{cust.phone}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-muted italic text-sm">Unassigned</span>
                      <button onClick={() => setAssigningOrder(order)} className="btn btn-primary btn-sm">
                        <HiOutlineUserAdd className="w-4 h-4" /> Assign
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-default">
                  <PaymentBadge status={order.payment_status} />
                  <div className="text-right">
                    <p className="font-semibold">${Number(order.total ?? 0).toFixed(2)}</p>
                    <button
                      onClick={() => { setSelectedOrder(order); setIsDrawerOpen(true) }}
                      className="text-brand-500 text-sm"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty state */}
        {!isLoading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-default"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiOutlineShoppingBag className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted mt-1 text-sm">Try adjusting your filters or create a new order</p>
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary mt-4">
              <HiOutlinePlus className="w-4 h-4" /> Create first order
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-md border border-default disabled:opacity-40 hover:bg-gray-50 transition">
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let n = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) n = i + 1
                  else if (currentPage >= totalPages - 2) n = totalPages - 4 + i
                  else n = currentPage - 2 + i
                }
                return (
                  <button key={n} onClick={() => setCurrentPage(n)}
                    className={`px-3 py-1 rounded-md text-sm transition ${currentPage === n ? 'bg-brand-500 text-white' : 'border border-default hover:bg-gray-50'
                      }`}>
                    {n}
                  </button>
                )
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-default disabled:opacity-40 hover:bg-gray-50 transition">
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawers & Modals */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={() => fetchOrders()}
        onToast={showToast}
      />

      {/* Assign from table row (unassigned orders) */}
      {assigningOrder && (
        <AssignCustomerModal
          isOpen={!!assigningOrder}
          onClose={() => setAssigningOrder(null)}
          onAssign={async (customer) => {
            const { error } = await assignCustomerToOrder(assigningOrder.id, customer.id)
            setAssigningOrder(null)
            if (error) { showToast(error, 'error'); return }
            fetchOrders()
            showToast(`${customer.name} assigned successfully`)
          }}
        />
      )}

      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false)
          setCurrentPage(1)
          fetchOrders(1)
          showToast('Order created successfully!')
        }}
      />

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </>
  )
}