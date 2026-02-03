// ============================================================
// NIL Perfumes - Admin Settings Page
// ============================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Plus, Trash2, Truck } from 'lucide-react';
import type { ShippingOption } from '@/types/admin';

export default function AdminSettings() {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New shipping option form
  const [newOption, setNewOption] = useState({ name: '', price: '' });

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const fetchShippingOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_options')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setShippingOptions(data || []);
    } catch (error) {
      console.error('Error fetching shipping options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (id: string, field: keyof ShippingOption, value: string | number | boolean) => {
    setShippingOptions(options =>
      options.map(opt =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
    setSuccess(null);
  };

  const addShippingOption = async () => {
    if (!newOption.name || !newOption.price) {
      setError('יש למלא שם ומחיר');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('shipping_options')
        .insert([{
          name: newOption.name,
          price: parseFloat(newOption.price),
          is_active: true,
          display_order: shippingOptions.length,
        }])
        .select()
        .single();

      if (error) throw error;

      setShippingOptions([...shippingOptions, data]);
      setNewOption({ name: '', price: '' });
      setSuccess('אפשרות משלוח נוספה');
    } catch (error) {
      console.error('Error adding shipping option:', error);
      setError('שגיאה בהוספת אפשרות משלוח');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteShippingOption = async (id: string) => {
    if (!confirm('האם למחוק אפשרות משלוח זו?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shipping_options')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShippingOptions(options => options.filter(opt => opt.id !== id));
      setSuccess('אפשרות משלוח נמחקה');
    } catch (error) {
      console.error('Error deleting shipping option:', error);
      setError('שגיאה במחיקת אפשרות משלוח');
    }
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      for (const option of shippingOptions) {
        const { error } = await supabase
          .from('shipping_options')
          .update({
            name: option.name,
            price: option.price,
            is_active: option.is_active,
            display_order: option.display_order,
          })
          .eq('id', option.id);

        if (error) throw error;
      }

      setSuccess('השינויים נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving shipping options:', error);
      setError('שגיאה בשמירת השינויים');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>
        <p className="text-gray-500">הגדרות החנות</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            אפשרויות משלוח
          </CardTitle>
          <CardDescription>
            הגדר את אפשרויות המשלוח הזמינות ללקוחות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Options */}
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label>שם</Label>
                  <Input
                    value={option.name}
                    onChange={(e) => handleOptionChange(option.id, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>מחיר (₪)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={option.price}
                    onChange={(e) => handleOptionChange(option.id, 'price', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={option.is_active}
                    onCheckedChange={(checked) => handleOptionChange(option.id, 'is_active', checked)}
                  />
                  <span className="text-sm text-gray-500">פעיל</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteShippingOption(option.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add New Option */}
          <div className="flex items-end gap-4 p-4 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <Label>שם אפשרות חדשה</Label>
                <Input
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  placeholder="למשל: שליח עד הבית"
                />
              </div>
              <div>
                <Label>מחיר (₪)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newOption.price}
                  onChange={(e) => setNewOption({ ...newOption, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <Button onClick={addShippingOption} disabled={isSaving}>
              <Plus className="ml-2 h-4 w-4" />
              הוספה
            </Button>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={saveAllChanges} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  שמירת שינויים
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
