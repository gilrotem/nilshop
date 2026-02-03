// ============================================================
// NIL Perfumes - Admin Create Coupon Page
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRight, Save } from 'lucide-react';
import type { DiscountType } from '@/types/admin';

interface CouponForm {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_amount: string;
  max_uses: string;
  expires_at: string;
}

export default function AdminCouponCreate() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState<CouponForm>({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CouponForm, value: string) => {
    setForm({ ...form, [field]: value });
    setError(null);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const couponData = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: true,
      };

      const { error } = await supabase
        .from('coupons')
        .insert([couponData]);

      if (error) throw error;

      navigate('/admin/coupons');
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      if (error.code === '23505') {
        setError('קוד הקופון כבר קיים. בחר קוד אחר.');
      } else {
        setError('שגיאה ביצירת הקופון');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/coupons')}>
          <ArrowRight className="ml-2 h-4 w-4" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">קופון חדש</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>פרטי הקופון</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">קוד הקופון *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="SAVE10"
                  className="font-mono"
                  required
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  יצירה אוטומטית
                </Button>
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סוג הנחה *</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(value) => handleChange('discount_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">אחוזים (%)</SelectItem>
                    <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  ערך הנחה {form.discount_type === 'percent' ? '(%)' : '(₪)'} *
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={form.discount_type === 'percent' ? '100' : undefined}
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) => handleChange('discount_value', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Min Order Amount */}
            <div className="space-y-2">
              <Label htmlFor="min_order_amount">מינימום הזמנה (₪)</Label>
              <Input
                id="min_order_amount"
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_amount}
                onChange={(e) => handleChange('min_order_amount', e.target.value)}
                placeholder="0 = ללא מגבלה"
              />
            </div>

            {/* Max Uses */}
            <div className="space-y-2">
              <Label htmlFor="max_uses">מקסימום שימושים</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={form.max_uses}
                onChange={(e) => handleChange('max_uses', e.target.value)}
                placeholder="ריק = ללא מגבלה"
              />
            </div>

            {/* Expires At */}
            <div className="space-y-2">
              <Label htmlFor="expires_at">תאריך תפוגה</Label>
              <Input
                id="expires_at"
                type="date"
                value={form.expires_at}
                onChange={(e) => handleChange('expires_at', e.target.value)}
              />
              <p className="text-sm text-gray-500">
                ריק = ללא תאריך תפוגה
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/coupons')}
            disabled={isSaving}
          >
            ביטול
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                יוצר...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                יצירת קופון
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
