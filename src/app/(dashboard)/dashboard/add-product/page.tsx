'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSave, HiOutlineUpload, HiOutlineX,
  HiOutlinePhotograph, HiOutlinePlus, HiOutlineTrash, HiOutlineDuplicate,
  HiOutlineChevronDown, HiOutlineTag, HiOutlineCube, HiOutlineTruck,
  HiOutlineGlobeAlt, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlinePencilAlt, HiOutlineSwitchHorizontal,
} from 'react-icons/hi';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createProduct,
  updateProduct,
  getProductById,
  getCategories,
  replaceProductImages,
  replaceProductVariants,
  type ProductStatus,
  type ProductVisibility,
  type ShippingClass,
  type Category,
} from '@/actions/products';


// ── Inline createCategory (client-safe via server action) ──
// We call getCategories from actions/products which already has auth.
// For createCategory we need a small dedicated action — add this to
// your actions/products.ts file:
//
//   export async function createCategory(name: string) {
//     const { userId } = await auth()
//     if (!userId) return { data: null, error: 'Unauthorized' }
//     const supabase = await createServerClient()
//     const { data, error } = await supabase
//       .from('categories')
//       .insert({ name, user_id: userId })
//       .select()
//       .single()
//     if (error) return { data: null, error: error.message }
//     revalidatePath('/dashboard/products')
//     return { data: data as Category, error: null }
//   }
//
// Then import it here:
import { createCategory } from '@/actions/products';

// ============ Types ============
interface ProductVariantOption {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariant {
  id: string;
  options: { [key: string]: string };
  price: number;
  sku: string;
  stock: number;
  comparePrice?: number;
}

interface ProductImage {
  id: string;
  url: string;
  isFeatured: boolean;
  file?: File;
}

interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number;
  cost: number;
  sku: string;
  stock: number;
  trackInventory: boolean;
  lowStockAlert: number;
  hasVariants: boolean;
  variantOptions: ProductVariantOption[];
  variants: ProductVariant[];
  categoryId: string;
  tags: string[];
  status: ProductStatus;
  visibility: ProductVisibility;
  vendor: string;
  productType: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  shippingClass: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

// ============ Create Category Modal ============
const CreateCategoryModal = ({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (category: Category) => void;
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) { setName(''); setError(''); }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!name.trim()) { setError('Category name is required'); return; }
    setSaving(true);
    const { data, error: err } = await createCategory(name.trim());
    setSaving(false);
    if (err || !data) { setError(err ?? 'Failed to create category'); return; }
    onCreated(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl w-full max-w-sm"
      >
        <div className="flex items-center justify-between p-5 border-b border-default">
          <h3 className="text-base font-semibold">New Category</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <HiOutlineX className="w-5 h-5 text-muted" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="input"
              placeholder="e.g., Electronics, Clothing"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-default">
          <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="btn btn-primary flex-1">
            {saving ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============ Helper Components ============

const RichTextEditor = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) => {
  return (
    <div className="border border-default rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-default px-3 py-2 flex gap-2">
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs font-medium">B</button>
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs font-medium italic">I</button>
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs font-medium underline">U</button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs">H1</button>
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs">H2</button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs">• List</button>
        <button type="button" className="p-1 hover:bg-gray-200 rounded text-xs">1. List</button>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={8}
        className="w-full px-4 py-3 focus:outline-none resize-y" />
    </div>
  );
};

const ImageUpload = ({ images, onImagesChange, onReorder: _onReorder }: {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  onReorder: (images: ProductImage[]) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (files: FileList) => {
    const newImages: ProductImage[] = Array.from(files).map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isFeatured: images.length === 0 && index === 0,
      file,
    }));
    onImagesChange([...images, ...newImages]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) handleFileUpload(files);
  }, [images]);

  const removeImage = (id: string) => {
    const newImages = images.filter(img => img.id !== id);
    if (images.find(img => img.id === id)?.isFeatured && newImages.length > 0) {
      newImages[0].isFeatured = true;
    }
    onImagesChange(newImages);
  };

  const setFeatured = (id: string) => {
    onImagesChange(images.map(img => ({ ...img, isFeatured: img.id === id })));
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-brand-500 bg-green-50' : 'border-default hover:border-brand-500'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
        <HiOutlineUpload className="w-10 h-10 text-muted mx-auto mb-3" />
        <p className="text-muted">Drag & drop images here or click to browse</p>
        <p className="text-xs text-muted mt-1">PNG, JPG, WebP up to 10MB</p>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((image, index) => (
            <motion.div key={image.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-lg overflow-hidden border border-default bg-gray-50">
              <div className="aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              {image.isFeatured && (
                <div className="absolute top-2 left-2 bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Featured
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button type="button" onClick={() => setFeatured(image.id)} className="p-1.5 bg-white rounded-lg hover:bg-gray-100">
                  <HiOutlineCheckCircle className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeImage(image.id)} className="p-1.5 bg-white rounded-lg hover:bg-red-50 hover:text-red-500">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const VariantsManager = ({ options, variants, onOptionsChange, onVariantsChange }: {
  options: ProductVariantOption[];
  variants: ProductVariant[];
  onOptionsChange: (options: ProductVariantOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}) => {
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const addOption = () => {
    if (!newOptionName.trim()) return;
    const values = newOptionValues.split(',').map(v => v.trim()).filter(v => v);
    if (values.length === 0) return;
    onOptionsChange([...options, { id: Date.now().toString(), name: newOptionName, values }]);
    setNewOptionName('');
    setNewOptionValues('');
  };

  const removeOption = (optionId: string) => {
    onOptionsChange(options.filter(opt => opt.id !== optionId));
  };

  const generateCombinations = () => {
    if (options.length === 0) return;
    const combinations: { [key: string]: string }[] = [];
    const generate = (index: number, current: { [key: string]: string }) => {
      if (index === options.length) { combinations.push({ ...current }); return; }
      options[index].values.forEach(value => {
        generate(index + 1, { ...current, [options[index].name]: value });
      });
    };
    generate(0, {});
    onVariantsChange(combinations.map((combo, idx) => ({
      id: Date.now().toString() + idx, options: combo, price: 0, sku: '', stock: 0,
    })));
  };

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    onVariantsChange(variants.map(v => v.id === variantId ? { ...v, ...updates } : v));
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium mb-2">Add Product Options</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="Option name (e.g., Size, Color)"
            value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} className="input flex-1" />
          <input type="text" placeholder="Values (e.g., Small, Medium, Large)"
            value={newOptionValues} onChange={(e) => setNewOptionValues(e.target.value)} className="input flex-1" />
          <button type="button" onClick={addOption} className="btn btn-primary whitespace-nowrap">
            <HiOutlinePlus className="w-4 h-4" /> Add Option
          </button>
        </div>
      </div>
      {options.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Product Options</label>
            <button type="button" onClick={generateCombinations} className="btn btn-secondary btn-sm">
              <HiOutlineSwitchHorizontal className="w-4 h-4" /> Generate Combinations
            </button>
          </div>
          {options.map(option => (
            <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{option.name}</span>
                <span className="text-sm text-muted ml-2">{option.values.join(', ')}</span>
              </div>
              <button type="button" onClick={() => removeOption(option.id)} className="text-red-500 hover:text-red-600">
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {variants.length > 0 && (
        <div className="border border-default rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-default">
            <p className="text-sm font-medium">Variants ({variants.length})</p>
          </div>
          <div className="divide-y divide-default max-h-96 overflow-y-auto">
            {variants.map(variant => (
              <div key={variant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm">
                    {Object.entries(variant.options).map(([key, val]) => `${key}: ${val}`).join(' • ')}
                  </p>
                  <button type="button" onClick={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}>
                    <HiOutlineChevronDown className={`w-5 h-5 transition-transform ${expandedVariant === variant.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <AnimatePresence>
                  {expandedVariant === variant.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-muted">Price</label>
                        <input type="number" value={variant.price || ''} className="input mt-1 text-sm" placeholder="0.00"
                          onChange={(e) => updateVariant(variant.id, { price: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">SKU</label>
                        <input type="text" value={variant.sku} className="input mt-1 text-sm" placeholder="SKU"
                          onChange={(e) => updateVariant(variant.id, { sku: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Stock</label>
                        <input type="number" value={variant.stock} className="input mt-1 text-sm" placeholder="0"
                          onChange={(e) => updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className="text-xs text-muted">Compare at</label>
                        <input type="number" value={variant.comparePrice || ''} className="input mt-1 text-sm" placeholder="0.00"
                          onChange={(e) => updateVariant(variant.id, { comparePrice: parseFloat(e.target.value) || undefined })} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TagsInput = ({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };
  return (
    <div>
      <div className="flex gap-2">
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Add tags (e.g., new, sale, featured)" className="input flex-1" />
        <button type="button" onClick={addTag} className="btn btn-secondary">Add</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-muted hover:text-red-500">
              <HiOutlineX className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ============ Main Component ============
export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditing = !!editId;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '', description: '', shortDescription: '',
    price: 0, comparePrice: 0, cost: 0,
    sku: '', stock: 0, trackInventory: true, lowStockAlert: 5,
    hasVariants: false, variantOptions: [], variants: [],
    categoryId: '', tags: [],
    status: 'draft', visibility: 'public',
    vendor: '', productType: '',
    weight: 0, dimensions: { length: 0, width: 0, height: 0 },
    shippingClass: 'standard',
    seoTitle: '', seoDescription: '', slug: '',
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);  // ← new

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: HiOutlinePencilAlt },
    { id: 'media', label: 'Media', icon: HiOutlinePhotograph },
    { id: 'pricing', label: 'Pricing & Inventory', icon: HiOutlineCube },
    { id: 'variants', label: 'Variants', icon: HiOutlineDuplicate },
    { id: 'categories', label: 'Categories & Tags', icon: HiOutlineTag },
    { id: 'shipping', label: 'Shipping', icon: HiOutlineTruck },
    { id: 'seo', label: 'SEO', icon: HiOutlineGlobeAlt },
  ];

  // ── Load categories ───────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await getCategories();
      if (error) { console.error('Failed to load categories:', error); return; }
      if (data) setCategories(data);
    };
    loadCategories();
  }, []);

  // ── Load product for editing ──────────────────────────────
  useEffect(() => {
    if (!editId) return;
    const loadProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const { data, error } = await getProductById(editId);
        if (error || !data) throw new Error(error ?? 'Product not found');
        setFormData({
          name: data.name,
          description: data.description ?? '',
          shortDescription: data.short_description ?? '',
          price: data.price,
          comparePrice: data.compare_price ?? 0,
          cost: data.cost ?? 0,
          sku: data.sku ?? '',
          stock: data.stock,
          trackInventory: data.track_inventory,
          lowStockAlert: data.low_stock_alert,
          hasVariants: data.has_variants,
          variantOptions: (data.variant_options ?? []).map((opt: any) => ({
            id: opt.id, name: opt.name, values: opt.values,
          })),
          variants: (data.variants ?? []).map((v: any) => ({
            id: v.id, options: v.options, price: v.price,
            sku: v.sku ?? '', stock: v.stock, comparePrice: v.compare_price ?? undefined,
          })),
          categoryId: data.category_id ?? '',
          tags: data.tags ?? [],
          status: data.status,
          visibility: (data.visibility === 'hidden' ? 'hidden' : 'public') as ProductVisibility,
          vendor: data.vendor ?? '',
          productType: data.product_type ?? '',
          weight: data.weight ?? 0,
          dimensions: (data.dimensions as any) ?? { length: 0, width: 0, height: 0 },
          shippingClass: data.shipping_class,
          seoTitle: data.seo_title ?? '',
          seoDescription: data.seo_description ?? '',
          slug: data.slug ?? '',
        });
        setImages((data.images ?? []).map((img: any) => ({
          id: img.id, url: img.url, isFeatured: img.is_featured,
        })));
      } catch (err: any) {
        console.error('Failed to load product:', err);
        alert('Failed to load product data.');
        router.push('/dashboard/products');
      } finally {
        setIsLoadingProduct(false);
      }
    };
    loadProduct();
  }, [editId]);

  // ── Auto-generate slug ────────────────────────────────────
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.price <= 0 && !formData.hasVariants) newErrors.price = 'Price is required';
    if (!formData.categoryId) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const input = {
        name: formData.name,
        description: formData.description || undefined,
        short_description: formData.shortDescription || undefined,
        slug: formData.slug || undefined,
        price: formData.price,
        compare_price: formData.comparePrice || undefined,
        cost: formData.cost || undefined,
        sku: formData.sku || undefined,
        stock: formData.stock,
        track_inventory: formData.trackInventory,
        low_stock_alert: formData.lowStockAlert,
        has_variants: formData.hasVariants,
        category_id: formData.categoryId || undefined,
        tags: formData.tags,
        vendor: formData.vendor || undefined,
        product_type: formData.productType || undefined,
        status: (publish ? 'active' : formData.status) as ProductStatus,
        visibility: formData.visibility,
        weight: formData.weight || undefined,
        dimensions: formData.dimensions,
        shipping_class: formData.shippingClass as ShippingClass,
        seo_title: formData.seoTitle || undefined,
        seo_description: formData.seoDescription || undefined,
      };

      const savedImages = images
        .filter(img => !img.url.startsWith('blob:'))
        .map((img, i) => ({ url: img.url, is_featured: img.isFeatured, position: i }));

      const variantOptions = formData.hasVariants
        ? formData.variantOptions.map((opt, i) => ({ name: opt.name, values: opt.values, position: i }))
        : [];

      const variants = formData.hasVariants
        ? formData.variants.map(v => ({
          options: v.options, price: v.price,
          compare_price: v.comparePrice, sku: v.sku || undefined, stock: v.stock,
        }))
        : [];

      if (isEditing && editId) {
        const { error } = await updateProduct(editId, input);
        if (error) throw new Error(error);
        await replaceProductImages(editId, savedImages);
        await replaceProductVariants(editId, variantOptions, variants);
        router.push('/dashboard/products');
      } else {
        const { error } = await createProduct({
          ...input,
          image_urls: savedImages.map(img => img.url),
          variant_options: variantOptions,
          variants,
        });
        if (error) throw new Error(error);
        router.push('/dashboard/products');
      }
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert(err.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateForm = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Called when a new category is created inline ──────────
  const handleCategoryCreated = (category: Category) => {
    setCategories(prev => [...prev, category])  // add to dropdown
    updateForm('categoryId', category.id)        // auto-select it
    setIsCategoryModalOpen(false)
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-surface border-b border-default px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted mb-1">
              <Link href="/dashboard/products" className="hover:text-brand-500">Products</Link>
              <span>/</span>
              <span>{isEditing ? 'Edit Product' : 'Add Product'}</span>
            </div>
            <h1 className="text-2xl font-semibold">{isEditing ? 'Edit Product' : 'Add Product'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/products" className="btn btn-secondary">Cancel</Link>
            <button onClick={() => handleSave(false)} className="btn btn-secondary" disabled={isSaving}>
              <HiOutlineSave className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Save as Draft'}
            </button>
            {!isEditing && (
              <button onClick={() => handleSave(true)} className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Publish Product'}
              </button>
            )}
            {isEditing && (
              <button onClick={() => handleSave(false)} className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Update Product'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">

            {/* Basic Information */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => updateForm('name', e.target.value)}
                    className={`input ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g., Classic Leather Jacket" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Short Description</label>
                  <input type="text" value={formData.shortDescription}
                    onChange={(e) => updateForm('shortDescription', e.target.value)}
                    className="input" placeholder="Brief description for product listings" maxLength={160} />
                  <p className="text-xs text-muted mt-1">{formData.shortDescription.length}/160 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Description</label>
                  <RichTextEditor value={formData.description} onChange={(value) => updateForm('description', value)}
                    placeholder="Detailed product description..." />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="card" id="media">
              <h2 className="text-lg font-semibold mb-4">Product Media</h2>
              <ImageUpload images={images} onImagesChange={setImages} onReorder={setImages} />
              <p className="text-xs text-muted mt-3">
                Note: To persist new images, upload them to a hosting service and paste the URL, or set up Supabase Storage.
              </p>
            </div>

            {/* Pricing & Inventory */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input type="number" value={formData.price || ''} onChange={(e) => updateForm('price', parseFloat(e.target.value) || 0)}
                      className="input pl-7" placeholder="0.00" step="0.01" />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Compare at Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input type="number" value={formData.comparePrice || ''} onChange={(e) => updateForm('comparePrice', parseFloat(e.target.value) || 0)}
                      className="input pl-7" placeholder="0.00" step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost per item</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input type="number" value={formData.cost || ''} onChange={(e) => updateForm('cost', parseFloat(e.target.value) || 0)}
                      className="input pl-7" placeholder="0.00" step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => updateForm('sku', e.target.value)}
                    className="input" placeholder="SKU-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <input type="number" value={formData.stock} onChange={(e) => updateForm('stock', parseInt(e.target.value) || 0)}
                    className="input" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Low Stock Alert</label>
                  <input type="number" value={formData.lowStockAlert} onChange={(e) => updateForm('lowStockAlert', parseInt(e.target.value) || 0)}
                    className="input" placeholder="5" />
                </div>
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.trackInventory}
                    onChange={(e) => updateForm('trackInventory', e.target.checked)} className="rounded" />
                  <span className="text-sm">Track inventory</span>
                </label>
              </div>
            </div>

            {/* Variants */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Product Variants</h2>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.hasVariants}
                    onChange={(e) => updateForm('hasVariants', e.target.checked)} className="rounded" />
                  <span className="text-sm">Enable variants</span>
                </label>
              </div>
              {formData.hasVariants ? (
                <VariantsManager options={formData.variantOptions} variants={formData.variants}
                  onOptionsChange={(options) => updateForm('variantOptions', options)}
                  onVariantsChange={(variants) => updateForm('variants', variants)} />
              ) : (
                <p className="text-muted text-sm text-center py-6">
                  Enable variants to offer different options like size, color, or material
                </p>
              )}
            </div>

            {/* Categories & Tags */}
            <div className="card" id="categories">
              <h2 className="text-lg font-semibold mb-4">Categories & Tags</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>

                  {/* ── Category selector + inline create button ── */}
                  <div className="flex gap-2">
                    <select
                      value={formData.categoryId}
                      onChange={(e) => updateForm('categoryId', e.target.value)}
                      className={`input flex-1 ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">
                        {categories.length === 0 ? 'No categories yet — create one →' : 'Select a category'}
                      </option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="btn btn-secondary flex-shrink-0"
                      title="Create new category"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      New
                    </button>
                  </div>

                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                  )}

                  {/* Empty state hint */}
                  {categories.length === 0 && (
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <HiOutlineExclamationCircle className="w-3.5 h-3.5 text-amber-500" />
                      You don't have any categories yet. Click <strong>New</strong> to create your first one.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <TagsInput tags={formData.tags} onChange={(tags) => updateForm('tags', tags)} />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Shipping</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input type="number" value={formData.weight || ''} onChange={(e) => updateForm('weight', parseFloat(e.target.value) || 0)}
                    className="input" placeholder="0.00" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={formData.dimensions.length || ''}
                      onChange={(e) => updateForm('dimensions', { ...formData.dimensions, length: parseFloat(e.target.value) || 0 })}
                      className="input" placeholder="L" />
                    <input type="number" value={formData.dimensions.width || ''}
                      onChange={(e) => updateForm('dimensions', { ...formData.dimensions, width: parseFloat(e.target.value) || 0 })}
                      className="input" placeholder="W" />
                    <input type="number" value={formData.dimensions.height || ''}
                      onChange={(e) => updateForm('dimensions', { ...formData.dimensions, height: parseFloat(e.target.value) || 0 })}
                      className="input" placeholder="H" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Class</label>
                  <select value={formData.shippingClass} onChange={(e) => updateForm('shippingClass', e.target.value)} className="input">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="free">Free</option>
                    <option value="local_pickup">Local Pickup</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">SEO & Search Engine Listing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-sm">/products/</span>
                    <input type="text" value={formData.slug} onChange={(e) => updateForm('slug', e.target.value)}
                      className="input flex-1" placeholder="product-name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SEO Title</label>
                  <input type="text" value={formData.seoTitle} onChange={(e) => updateForm('seoTitle', e.target.value)}
                    className="input" placeholder="SEO title (defaults to product name)" maxLength={60} />
                  <p className="text-xs text-muted mt-1">{formData.seoTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <textarea value={formData.seoDescription} onChange={(e) => updateForm('seoDescription', e.target.value)}
                    className="input" rows={3} placeholder="Brief description for search engines" maxLength={160} />
                  <p className="text-xs text-muted mt-1">{formData.seoDescription.length}/160 characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="card sticky top-24">
              <h3 className="font-semibold mb-3">Product Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted">Name</p>
                  <p className="font-medium truncate">{formData.name || 'Untitled Product'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Price</p>
                  <p className="font-medium">${formData.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Category</p>
                  <p className="font-medium">
                    {categories.find(c => c.id === formData.categoryId)?.name || 'None selected'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <select value={formData.status} onChange={(e) => updateForm('status', e.target.value as ProductStatus)}
                      className="input text-sm py-1">
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button type="button" onClick={() => updateForm('visibility', formData.visibility === 'public' ? 'hidden' : 'public')}
                      className="p-1.5 rounded-md hover:bg-gray-100"
                      title={formData.visibility === 'public' ? 'Make hidden' : 'Make public'}>
                      {formData.visibility === 'public' ?
                        <HiOutlineEye className="w-4 h-4 text-muted" /> :
                        <HiOutlineEyeOff className="w-4 h-4 text-muted" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Organization</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted block mb-1">Vendor / Brand</label>
                  <input type="text" value={formData.vendor} onChange={(e) => updateForm('vendor', e.target.value)}
                    className="input text-sm" placeholder="Brand name" />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Product Type</label>
                  <input type="text" value={formData.productType} onChange={(e) => updateForm('productType', e.target.value)}
                    className="input text-sm" placeholder="e.g., Electronics, Clothing" />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Quick Navigation</h3>
              <div className="space-y-1">
                {sections.map(section => (
                  <a key={section.id} href={`#${section.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-brand-500 hover:bg-gray-50 rounded-lg transition">
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <AnimatePresence>
        <CreateCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onCreated={handleCategoryCreated}
        />
      </AnimatePresence>
    </div>
  );
}