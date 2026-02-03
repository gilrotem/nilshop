// ============================================================
// NIL Perfumes - Admin Types
// ============================================================

// User Roles
export type AppRole = 'admin' | 'moderator';

// Order Status
export type OrderStatus = 
  | 'pending'    // נוצר, ממתין לתשלום
  | 'paid'       // שולם בהצלחה
  | 'processing' // בטיפול/אריזה
  | 'shipped'    // יצא למשלוח
  | 'delivered'  // נמסר
  | 'cancelled'  // בוטל
  | 'refunded';  // הוחזר כסף

// Discount Type
export type DiscountType = 'percent' | 'fixed';

// -----------------------------------------------------------
// Database Models
// -----------------------------------------------------------

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  in_stock: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  display_order: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_email: string;
  recipient_name: string;
  phone: string;
  city: string;
  street: string;
  house_number: string;
  apartment: string | null;
  zip_code: string | null;
  notes: string | null;
  shipping_option_id: string | null;
  shipping_cost: number;
  products_total: number;
  discount_amount: number;
  coupon_code: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_provider_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price_at_purchase: number;
  quantity: number;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

// -----------------------------------------------------------
// Extended Types (with relations)
// -----------------------------------------------------------

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer?: Customer;
  shipping_option?: ShippingOption;
}

// -----------------------------------------------------------
// Auth Types
// -----------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  role: AppRole;
}

// -----------------------------------------------------------
// Dashboard Stats
// -----------------------------------------------------------

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
}

// -----------------------------------------------------------
// Status Labels (Hebrew)
// -----------------------------------------------------------

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'ממתין לתשלום',
  paid: 'שולם',
  processing: 'בטיפול',
  shipped: 'נשלח',
  delivered: 'נמסר',
  cancelled: 'בוטל',
  refunded: 'הוחזר',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
};
