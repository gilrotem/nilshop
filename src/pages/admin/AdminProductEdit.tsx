// ============================================================
// NIL Perfumes - Admin Product Edit Page
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, Save, Trash2 } from 'lucide-react';
import type { Product } from '@/types/admin';

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  image_url: string;
  in_stock: boolean;
  display_order: string;
}

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    price: '',
    image_url: '',
    in_stock: true,
    display_order: '0',
  });
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      fetchProduct();
    }
  }, [id, isNew]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setForm({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        price: data.price.toString(),
        image_url: data.image_url || '',
        in_stock: data.in_stock,
        display_order: data.display_order.toString(),
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('שגיאה בטעינת המוצר');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm({ ...form, [field]: value });
    setError(null);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: isNew ? generateSlug(name) : form.slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const productData = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        in_stock: form.in_stock,
        display_order: parseInt(form.display_order) || 0,
      };

      if (isNew) {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error.code === '23505') {
        setError('ה-slug כבר קיים. בחר שם אחר.');
      } else {
        setError('שגיאה בשמירת המוצר');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('האם למחוק את המוצר? פעולה זו אינה ניתנת לביטול.')) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('שגיאה במחיקת המוצר');
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/products')}>
          <ArrowRight className="ml-2 h-4 w-4" />
          חזרה
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'מוצר חדש' : 'עריכת מוצר'}
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>פרטי המוצר</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">שם המוצר *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                dir="ltr"
                required
              />
              <p className="text-sm text-gray-500">
                יופיע בכתובת: /products/{form.slug || 'example'}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">מחיר (₪) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">קישור לתמונה</Label>
              <Input
                id="image_url"
                type="url"
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                dir="ltr"
                placeholder="https://..."
              />
              {form.image_url && (
                <div className="mt-2">
                  <img
                    src={form.image_url}
                    alt="תצוגה מקדימה"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">סדר תצוגה</Label>
              <Input
                id="display_order"
                type="number"
                value={form.display_order}
                onChange={(e) => handleChange('display_order', e.target.value)}
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>במלאי</Label>
                <p className="text-sm text-gray-500">האם המוצר זמין לרכישה</p>
              </div>
              <Switch
                checked={form.in_stock}
                onCheckedChange={(checked) => handleChange('in_stock', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          {!isNew && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              <Trash2 className="ml-2 h-4 w-4" />
              מחיקה
            </Button>
          )}
          <div className="flex gap-3 mr-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              disabled={isSaving}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  שמירה
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
