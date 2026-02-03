// ============================================================
// NIL Perfumes - Admin Coupons List Page
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Ticket, Trash2 } from 'lucide-react';
import type { Coupon } from '@/types/admin';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    setUpdatingId(coupon.id);
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;

      setCoupons(coupons.map(c =>
        c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (error) {
      console.error('Error updating coupon:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`האם למחוק את הקופון ${coupon.code}?`)) {
      return;
    }

    setUpdatingId(coupon.id);
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', coupon.id);

      if (error) throw error;

      setCoupons(coupons.filter(c => c.id !== coupon.id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDiscount = (coupon: Coupon): string => {
    if (coupon.discount_type === 'percent') {
      return `${coupon.discount_value}%`;
    }
    return `₪${coupon.discount_value}`;
  };

  const isExpired = (coupon: Coupon): boolean => {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at) < new Date();
  };

  const isMaxedOut = (coupon: Coupon): boolean => {
    if (!coupon.max_uses) return false;
    return coupon.usage_count >= coupon.max_uses;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">קופונים</h1>
          <p className="text-gray-500">ניהול קודי הנחה</p>
        </div>
        <Button asChild>
          <Link to="/admin/coupons/new">
            <Plus className="ml-2 h-4 w-4" />
            קופון חדש
          </Link>
        </Button>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>{coupons.length} קופונים</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">אין קופונים עדיין</p>
              <Button asChild className="mt-4">
                <Link to="/admin/coupons/new">צור קופון ראשון</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
                      <Ticket className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold">{coupon.code}</p>
                        {isExpired(coupon) && (
                          <Badge variant="destructive" className="text-xs">פג תוקף</Badge>
                        )}
                        {isMaxedOut(coupon) && (
                          <Badge variant="secondary" className="text-xs">מוצה</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        הנחה: {formatDiscount(coupon)}
                        {coupon.min_order_amount > 0 && (
                          <span> | מינימום הזמנה: ₪{coupon.min_order_amount}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        שימושים: {coupon.usage_count}
                        {coupon.max_uses && ` / ${coupon.max_uses}`}
                        {coupon.expires_at && (
                          <span> | תפוגה: {new Date(coupon.expires_at).toLocaleDateString('he-IL')}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => toggleActive(coupon)}
                        disabled={updatingId === coupon.id}
                      />
                      <span className="text-sm text-gray-500">
                        {coupon.is_active ? 'פעיל' : 'מושבת'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCoupon(coupon)}
                      disabled={updatingId === coupon.id}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
