// ============================================================
// NIL Perfumes - useProducts Hook
// ============================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/admin';

interface CreateProductData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  in_stock?: boolean;
  display_order?: number;
}

interface UpdateProductData extends Partial<CreateProductData> {}

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  getProductBySlug: (slug: string) => Promise<Product | null>;
  createProduct: (data: CreateProductData) => Promise<Product | null>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleStock: (id: string, inStock: boolean) => Promise<boolean>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'שגיאה בטעינת מוצרים');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      console.error('Error fetching product:', err);
      return null;
    }
  }, []);

  const getProductBySlug = useCallback(async (slug: string): Promise<Product | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      console.error('Error fetching product by slug:', err);
      return null;
    }
  }, []);

  const createProduct = useCallback(async (data: CreateProductData): Promise<Product | null> => {
    try {
      const { data: newProduct, error: createError } = await supabase
        .from('products')
        .insert([{
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          in_stock: data.in_stock ?? true,
          display_order: data.display_order ?? 0,
        }])
        .select()
        .single();

      if (createError) throw createError;

      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      console.error('Error creating product:', err);
      return null;
    }
  }, []);

  const updateProduct = useCallback(async (
    id: string, 
    data: UpdateProductData
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...data } : product
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error updating product:', err);
      return false;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setProducts(prev => prev.filter(product => product.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting product:', err);
      return false;
    }
  }, []);

  const toggleStock = useCallback(async (id: string, inStock: boolean): Promise<boolean> => {
    return updateProduct(id, { in_stock: inStock });
  }, [updateProduct]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
  };
}
