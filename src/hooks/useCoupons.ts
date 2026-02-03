// ============================================================
// NIL Perfumes - useCoupons Hook
// ============================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coupon, DiscountType } from '@/types/admin';

interface CreateCouponData {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number | null;
  expires_at?: string | null;
}

interface ValidateCouponResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
}

interface UseCouponsReturn {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  createCoupon: (data: CreateCouponData) => Promise<Coupon | null>;
  deleteCoupon: (id: string) => Promise<boolean>;
  toggleActive: (id: string, isActive: boolean) => Promise<boolean>;
  validateCoupon: (code: string, orderTotal: number) => Promise<ValidateCouponResult>;
  incrementUsage: (id: string) => Promise<boolean>;
  calculateDiscount: (coupon: Coupon, orderTotal: number) => number;
}

export function useCoupons(): UseCouponsReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCoupons(data || []);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError(err.message || 'שגיאה בטעינת קופונים');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCoupon = useCallback(async (data: CreateCouponData): Promise<Coupon | null> => {
    try {
      const { data: newCoupon, error: createError } = await supabase
        .from('coupons')
        .insert([{
          code: data.code.toUpperCase(),
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          min_order_amount: data.min_order_amount || 0,
          max_uses: data.max_uses || null,
          expires_at: data.expires_at || null,
          is_active: true,
          usage_count: 0,
        }])
        .select()
        .single();

      if (createError) throw createError;

      setCoupons(prev => [newCoupon, ...prev]);
      return newCoupon;
    } catch (err: any) {
      console.error('Error creating coupon:', err);
      return null;
    }
  }, []);

  const deleteCoupon = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting coupon:', err);
      return false;
    }
  }, []);

  const toggleActive = useCallback(async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ is_active: isActive })
        .eq('id', id);

      if (updateError) throw updateError;

      setCoupons(prev =>
        prev.map(coupon =>
          coupon.id === id ? { ...coupon, is_active: isActive } : coupon
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error toggling coupon:', err);
      return false;
    }
  }, []);

  const calculateDiscount = useCallback((coupon: Coupon, orderTotal: number): number => {
    if (coupon.discount_type === 'percent') {
      return Math.round((orderTotal * coupon.discount_value / 100) * 100) / 100;
    }
    // Fixed discount - don't exceed order total
    return Math.min(coupon.discount_value, orderTotal);
  }, []);

  const validateCoupon = useCallback(async (
    code: string, 
    orderTotal: number
  ): Promise<ValidateCouponResult> => {
    try {
      const { data: coupon, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (fetchError || !coupon) {
        return { valid: false, error: 'קוד קופון לא נמצא' };
      }

      // Check if active
      if (!coupon.is_active) {
        return { valid: false, error: 'הקופון אינו פעיל' };
      }

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { valid: false, error: 'פג תוקף הקופון' };
      }

      // Check usage limit
      if (coupon.max_uses && coupon.usage_count >= coupon.max_uses) {
        return { valid: false, error: 'הקופון מוצה' };
      }

      // Check minimum order amount
      if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
        return { 
          valid: false, 
          error: `מינימום הזמנה לקופון: ₪${coupon.min_order_amount}` 
        };
      }

      const discountAmount = calculateDiscount(coupon, orderTotal);

      return {
        valid: true,
        coupon,
        discountAmount,
      };
    } catch (err: any) {
      console.error('Error validating coupon:', err);
      return { valid: false, error: 'שגיאה באימות הקופון' };
    }
  }, [calculateDiscount]);

  const incrementUsage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const coupon = coupons.find(c => c.id === id);
      if (!coupon) return false;

      const { error: updateError } = await supabase
        .from('coupons')
        .update({ usage_count: coupon.usage_count + 1 })
        .eq('id', id);

      if (updateError) throw updateError;

      setCoupons(prev =>
        prev.map(c =>
          c.id === id ? { ...c, usage_count: c.usage_count + 1 } : c
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error incrementing coupon usage:', err);
      return false;
    }
  }, [coupons]);

  return {
    coupons,
    isLoading,
    error,
    fetchCoupons,
    createCoupon,
    deleteCoupon,
    toggleActive,
    validateCoupon,
    incrementUsage,
    calculateDiscount,
  };
}
