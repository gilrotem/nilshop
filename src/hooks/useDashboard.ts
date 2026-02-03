// ============================================================
// NIL Perfumes - useDashboard Hook
// ============================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DashboardStats, Order } from '@/types/admin';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentOrders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      
      // Start of today (midnight)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Start of current month
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch all paid orders for calculations
      const { data: paidOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status')
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Calculate stats
      const todayOrders = (paidOrders || []).filter(
        order => new Date(order.created_at) >= today
      );

      const monthOrders = (paidOrders || []).filter(
        order => new Date(order.created_at) >= firstDayOfMonth
      );

      const todayRevenue = todayOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      const monthlyRevenue = monthOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      // Fetch pending orders count (paid + processing)
      const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['paid', 'processing']);

      if (pendingError) throw pendingError;

      // Fetch recent orders
      const { data: recent, error: recentError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        monthlyRevenue,
        pendingOrders: pendingCount || 0,
      });

      setRecentOrders(recent || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'שגיאה בטעינת נתונים');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    recentOrders,
    isLoading,
    error,
    fetchDashboardData,
  };
}
