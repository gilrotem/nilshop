// ============================================================
// NIL Perfumes - Admin Dashboard Page
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Clock,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import type { DashboardStats, Order } from '@/types/admin';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get today's orders count
        const { count: todayOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
          .eq('status', 'paid');

        // Get today's revenue
        const { data: todayRevenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', today.toISOString())
          .eq('status', 'paid');

        const todayRevenue = todayRevenueData?.reduce(
          (sum, order) => sum + (order.total_amount || 0), 
          0
        ) || 0;

        // Get monthly revenue
        const { data: monthlyRevenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', firstDayOfMonth.toISOString())
          .eq('status', 'paid');

        const monthlyRevenue = monthlyRevenueData?.reduce(
          (sum, order) => sum + (order.total_amount || 0), 
          0
        ) || 0;

        // Get pending orders count
        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['paid', 'processing']);

        // Get recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          todayOrders: todayOrders || 0,
          todayRevenue,
          monthlyRevenue,
          pendingOrders: pendingOrders || 0,
        });

        setRecentOrders(recentOrdersData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">דשבורד</h1>
        <p className="text-gray-500">סקירה כללית של החנות</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="הזמנות היום"
          value={stats?.todayOrders || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="הכנסות היום"
          value={`₪${stats?.todayRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
        />
        <StatCard
          title="הכנסות החודש"
          value={`₪${stats?.monthlyRevenue?.toLocaleString() || 0}`}
          icon={TrendingUp}
        />
        <StatCard
          title="ממתינות לטיפול"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          description="הזמנות ששולמו"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>הזמנות אחרונות</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/orders">
              צפה בהכל
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">אין הזמנות עדיין</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">הזמנה #{order.order_number}</p>
                    <p className="text-sm text-gray-500">{order.recipient_name}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">₪{order.total_amount}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
