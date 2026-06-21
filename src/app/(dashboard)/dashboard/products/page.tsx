'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch, HiOutlinePlus, HiOutlineFilter,
  HiOutlinePencilAlt, HiOutlineTrash, HiOutlineEye,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiX,
  HiOutlineExclamationCircle, HiOutlineRefresh,
} from 'react-icons/hi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
  getProducts,
  deleteProduct,
  type Product,
  type ProductStatus,
} from '@/actions/products';

// ── Helper: get featured image from a product ─────────────
function getFeaturedImage(product: Product): string | null {
  const images = product.product_images ?? [];
  return images.find(img => img.is_featured)?.url ?? images[0]?.url ?? null;
}

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ status, stock }: { status: ProductStatus; stock: number }) => {
  if (stock === 0) {
    return <span className="badge badge-danger">Out of Stock</span>;
  }
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'badge-success' },
    draft: { label: 'Draft', className: 'badge-warning' },
    archived: { label: 'Archived', className: 'bg-gray-100 text-gray-600' },
  };
  const { label, className } = config[status] ?? { label: status, className: 'badge-secondary' };
  return <span className={`badge ${className}`}>{label}</span>;
};

// ── Delete Modal ──────────────────────────────────────────
const DeleteModal = ({
  product, onConfirm, onClose,
}: {
  product: Product | null;
  onConfirm: () => void;
  onClose: () => void;
}) => {
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
          <h3 className="text-xl font-semibold">Delete Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <HiX className="w-5 h-5 text-muted" />
          </button>
        </div>
        <p className="text-muted mb-2">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{product.name}</span>?
        </p>
        <p className="text-sm text-muted mb-6">
          The product will be archived and hidden from the catalog. Order history is preserved.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger">Delete</button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load products from Supabase on mount ──────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await getProducts({ pageSize: 100 });
        if (fetchError) throw new Error(fetchError);
        setProducts((data as Product[]) ?? []);
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Derive categories from loaded products ────────────────
  const categories = useMemo(() => {
    const cats = new Set(
      products.map(p => p.categories?.name).filter(Boolean) as string[]
    );
    return ['all', ...Array.from(cats)];
  }, [products]);

  // ── Filter products ───────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categories?.name === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Handlers ─────────────────────────────────────────────
  const handleEdit = (product: Product) => {
    router.push(`/dashboard/add-product?id=${product.id}`);
  };

  const handleView = (product: Product) => {
    router.push(`/dashboard/add-product?id=${product.id}`);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await deleteProduct(productToDelete.id);
      if (error) {
        alert(error);
        return;
      }
      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    } finally {
      setProductToDelete(null);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // ── Loading & error states ────────────────────────────────
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <HiOutlineExclamationCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg font-medium">Something went wrong</p>
          <p className="text-muted">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            <HiOutlineRefresh className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

        <DashboardHeader
          title="Products"
          subTitle="Manage your product inventory"
          button={{
            text: "Add Product",
            onClick: () => router.push('/dashboard/add-product'),
          }}
        />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary md:hidden">
              <HiOutlineFilter className="w-4 h-4" /> Filters
            </button>
            <div className={`${showFilters ? 'flex' : 'hidden'} md:flex gap-3 flex-wrap`}>
              <select value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="input w-auto min-w-[130px]">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <select value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="input w-auto min-w-[130px]">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-surface rounded-xl border border-default overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-default bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="wait">
                  {paginatedProducts.map((product) => {
                    const image = getFeaturedImage(product);
                    return (
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
                              {image ? (
                                <Image src={image} alt={product.name} width={40} height={40}
                                  className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted">{product.sku ?? '—'}</td>
                        <td className="px-6 py-4">{product.categories?.name ?? 'Uncategorized'}</td>
                        <td className="px-6 py-4 font-medium">${product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={product.stock <= product.low_stock_alert && product.stock > 0 ? 'text-amber-500' : product.stock === 0 ? 'text-red-500' : ''}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={product.status} stock={product.stock} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleView(product)}
                              className="p-1.5 rounded-md hover:bg-gray-100 transition text-muted hover:text-brand-500" title="View">
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(product)}
                              className="p-1.5 rounded-md hover:bg-gray-100 transition text-muted hover:text-brand-500" title="Edit">
                              <HiOutlinePencilAlt className="w-4 h-4" />
                            </button>
                            <button onClick={() => setProductToDelete(product)}
                              className="p-1.5 rounded-md hover:bg-gray-100 transition text-muted hover:text-danger" title="Delete">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          <AnimatePresence mode="wait">
            {paginatedProducts.map((product) => {
              const image = getFeaturedImage(product);
              return (
                <motion.div key={product.id} variants={itemVariants} initial="hidden" animate="visible"
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-surface rounded-xl border border-default p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {image ? (
                        <Image src={image} alt={product.name} width={56} height={56}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold truncate">{product.name}</h4>
                          <p className="text-xs text-muted">{product.sku ?? '—'}</p>
                        </div>
                        <StatusBadge status={product.status} stock={product.stock} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-sm text-muted">{product.categories?.name ?? 'Uncategorized'}</p>
                          <p className="text-xs text-muted">Stock: {product.stock}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(product)} className="p-2 rounded-md hover:bg-gray-100">
                            <HiOutlinePencilAlt className="w-4 h-4 text-muted" />
                          </button>
                          <button onClick={() => setProductToDelete(product)} className="p-2 rounded-md hover:bg-gray-100">
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
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {paginatedProducts.length === 0 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-default">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiOutlineSearch className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted mt-1">Try adjusting your search or filters</p>
            <button onClick={() => router.push('/dashboard/add-product')} className="btn btn-primary mt-4">
              <HiOutlinePlus className="w-4 h-4" /> Add your first product
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <p className="text-sm text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
              {filteredProducts.length} products
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-default disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
                <HiOutlineChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm transition ${currentPage === page ? 'bg-brand-500 text-white' : 'border border-default hover:bg-gray-50'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-default disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {productToDelete && (
          <DeleteModal product={productToDelete} onConfirm={handleDelete}
            onClose={() => setProductToDelete(null)} />
        )}
      </AnimatePresence>
    </>
  );
}