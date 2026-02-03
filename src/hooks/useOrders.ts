// ============================================================
// NIL Perfumes - useOrders Hook
// ============================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, OrderStatus, OrderWithItems } from '@/types/admin';

interface UseOrdersOptions {
  status?: OrderStatus | 'all';
  limit?: number;
}

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (options?: UseOrdersOptions) => Promise<void>;
  getOrderById: (id: string) => Promise<OrderWithItems | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  getOrderItems: (orderId: string) => Promise<OrderItem[]>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (options: UseOrdersOptions = {}) => {
    const { status = 'all', limit } = options;
    
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'שגיאה בטעינת הזמנות');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (id: string): Promise<OrderWithItems | null> => {
    try {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Fetch customer if exists
      let customer;
      if (order.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', order.customer_id)
          .single();
        customer = customerData;
      }

      // Fetch shipping option if exists
      let shipping_option;
      if (order.shipping_option_id) {
        const { data: shippingData } = await supabase
          .from('shipping_options')
          .select('*')
          .eq('id', order.shipping_option_id)
          .single();
        shipping_option = shippingData;
      }

      return {
        ...order,
        items: items || [],
        customer,
        shipping_option,
      };
    } catch (err: any) {
      console.error('Error fetching order:', err);
      return null;
    }
  }, []);

  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: OrderStatus
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      return false;
    }
  }, []);

  const getOrderItems = useCallback(async (orderId: string): Promise<OrderItem[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching order items:', err);
      return [];
    }
  }, []);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    getOrderById,
    updateOrderStatus,
    getOrderItems,
  };
}
