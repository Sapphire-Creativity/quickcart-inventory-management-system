// app/admin/products/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineDotsVertical,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiX,
} from 'react-icons/hi';
import Image from 'next/image';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

// Types
type ProductStatus = 'published' | 'draft' | 'out_of_stock';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: ProductStatus;
  category: string;
  image: string;
  createdAt: string;
}

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Minimalist Backpack',
    sku: 'MB-001',
    price: 89.99,
    stock: 45,
    status: 'published',
    category: 'Bags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Wireless Headphones',
    sku: 'WH-002',
    price: 199.99,
    stock: 0,
    status: 'out_of_stock',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Ceramic Coffee Mug',
    sku: 'CM-003',
    price: 24.99,
    stock: 120,
    status: 'published',
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=80&h=80&fit=crop',
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Smart Watch',
    sku: 'SW-004',
    price: 299.99,
    stock: 15,
    status: 'draft',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop',
    createdAt: '2024-02-10',
  },
  {
    id: '5',
    name: 'Leather Wallet',
    sku: 'LW-005',
    price: 49.99,
    stock: 89,
    status: 'published',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=80&h=80&fit=crop',
    createdAt: '2024-02-15',
  },
  {
    id: '6',
    name: 'Yoga Mat',
    sku: 'YM-006',
    price: 39.99,
    stock: 34,
    status: 'published',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=80&h=80&fit=crop',
    createdAt: '2024-02-20',
  },
  {
    id: '7',
    name: 'Desk Lamp',
    sku: 'DL-007',
    price: 59.99,
    stock: 0,
    status: 'out_of_stock',
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=80&h=80&fit=crop',
    createdAt: '2024-03-01',
  },
  {
    id: '8',
    name: 'Mechanical Keyboard',
    sku: 'MK-008',
    price: 149.99,
    stock: 22,
    status: 'published',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop',
    createdAt: '2024-03-05',
  },
  {
    id: '9',
    name: 'Sunglasses',
    sku: 'SG-009',
    price: 129.99,
    stock: 56,
    status: 'published',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=80&h=80&fit=crop',
    createdAt: '2024-03-10',
  },
  {
    id: '10',
    name: 'Water Bottle',
    sku: 'WB-010',
    price: 19.99,
    stock: 200,
    status: 'draft',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=80&h=80&fit=crop',
    createdAt: '2024-03-12',
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const config = {
    published: { label: 'Published', className: 'badge-success' },
    draft: { label: 'Draft', className: 'badge-warning' },
    out_of_stock: { label: 'Out of Stock', className: 'badge-danger' },
  };
  const { label, className } = config[status];
  return <span className={`badge ${className}`}>{label}</span>;
};

// Delete confirmation modal
const DeleteModal = ({ product, onConfirm, onClose }: { product: Product | null; onConfirm: () => void; onClose: () => void }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl">Delete Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <HiX className="w-5 h-5 text-muted" />
          </button>
        </div>
        <p className="text-muted mb-2">
          Are you sure you want to delete <span className="font-medium text-text">{product.name}</span>?
        </p>
        <p className="text-sm text-muted mb-6">This action cannot be undone.</p>
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

// Main Products Page Component
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleDelete = () => {
    if (productToDelete) {
      setIsDeleting(true);
      setTimeout(() => {
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setIsDeleting(false);
        setProductToDelete(null);
      }, 400);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Edit product:', product);
    // Navigate to edit page or open modal
  };

  const handleView = (product: Product) => {
    console.log('View product:', product);
    // Navigate to product details
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Page Header */}

        <DashboardHeader title="Products" subTitle="Manage your product inventory"
          button={{
            text: "Add Product",
          }}
        />


        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary md:hidden"
            >
              <HiOutlineFilter className="w-4 h-4" />
              Filters
            </button>
            <div className={`${showFilters ? 'flex' : 'hidden'} md:flex gap-3 flex-wrap`}>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="input w-auto min-w-[130px]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="input w-auto min-w-[130px]"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden md:block bg-surface rounded-xl border border-default overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-default bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginatedProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-default hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted">{product.sku}</td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={product.stock <= 10 ? 'text-danger' : ''}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(product)}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition text-muted hover:text-brand-500"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition text-muted hover:text-brand-500"
                            title="Edit"
                          >
                            <HiOutlinePencilAlt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition text-muted hover:text-danger"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
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

        {/* Products Grid - Mobile */}
        <div className="md:hidden space-y-3">
          <AnimatePresence mode="wait">
            {paginatedProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20 }}
                className="bg-surface rounded-xl border border-default p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold truncate">{product.name}</h4>
                        <p className="text-xs text-muted">{product.sku}</p>
                      </div>
                      <StatusBadge status={product.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm text-muted">{product.category}</p>
                        <p className="text-xs text-muted">Stock: {product.stock}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(product)}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <HiOutlineEye className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <HiOutlineTrash className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-default">
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {paginatedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-default"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiOutlineSearch className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <p className="text-sm text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-default disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm transition ${currentPage === page
                    ? 'bg-brand-500 text-white'
                    : 'border border-default hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
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
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {productToDelete && (
          <DeleteModal
            product={productToDelete}
            onConfirm={handleDelete}
            onClose={() => setProductToDelete(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}