// ============================================================
// NIL Perfumes - useCustomers Hook
// ============================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Customer } from '@/types/admin';

interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer | null>;
  getCustomerByEmail: (email: string) => Promise<Customer | null>;
  findOrCreateCustomer: (email: string, name?: string, phone?: string) => Promise<Customer | null>;
  updateCustomerStats: (customerId: string, orderAmount: number) => Promise<boolean>;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCustomers(data || []);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'שגיאה בטעינת לקוחות');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCustomerById = useCallback(async (id: string): Promise<Customer | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      console.error('Error fetching customer:', err);
      return null;
    }
  }, []);

  const getCustomerByEmail = useCallback(async (email: string): Promise<Customer | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (not found)
        throw fetchError;
      }
      
      return data || null;
    } catch (err: any) {
      console.error('Error fetching customer by email:', err);
      return null;
    }
  }, []);

  const findOrCreateCustomer = useCallback(async (
    email: string,
    name?: string,
    phone?: string
  ): Promise<Customer | null> => {
    try {
      // First, try to find existing customer
      const existing = await getCustomerByEmail(email);
      
      if (existing) {
        // Update name/phone if provided and different
        if ((name && name !== existing.full_name) || (phone && phone !== existing.phone)) {
          await supabase
            .from('customers')
            .update({
              full_name: name || existing.full_name,
              phone: phone || existing.phone,
            })
            .eq('id', existing.id);
        }
        return existing;
      }

      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([{
          email: email.toLowerCase(),
          full_name: name || null,
          phone: phone || null,
        }])
        .select()
        .single();

      if (createError) throw createError;

      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err: any) {
      console.error('Error finding/creating customer:', err);
      return null;
    }
  }, [getCustomerByEmail]);

  const updateCustomerStats = useCallback(async (
    customerId: string,
    orderAmount: number
  ): Promise<boolean> => {
    try {
      // Get current customer data
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', customerId)
        .single();

      if (fetchError) throw fetchError;

      // Update stats
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          total_orders: (customer.total_orders || 0) + 1,
          total_spent: (customer.total_spent || 0) + orderAmount,
          last_order_at: new Date().toISOString(),
        })
        .eq('id', customerId);

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      console.error('Error updating customer stats:', err);
      return false;
    }
  }, []);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    getCustomerById,
    getCustomerByEmail,
    findOrCreateCustomer,
    updateCustomerStats,
  };
}
