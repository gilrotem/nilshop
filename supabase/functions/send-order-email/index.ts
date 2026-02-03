// ============================================================
// NIL Perfumes - Order Confirmation Email Function
// Edge Function for Lovable Cloud
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  order_id: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price_at_purchase: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'orders@nilperfumes.com';
    const storeName = Deno.env.get('STORE_NAME') || 'NIL Perfumes';

    if (!resendApiKey) {
      console.error('Missing Resend API key');
      return new Response(
        JSON.stringify({ success: false, error: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id }: EmailPayload = await req.json();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError) {
      throw itemsError;
    }

    // Build email HTML
    const emailHtml = generateOrderEmailHtml(order, items || [], storeName);

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${storeName} <${fromEmail}>`,
        to: order.customer_email,
        subject: `אישור הזמנה #${order.order_number} - ${storeName}`,
        html: emailHtml,
      }),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', result);
      throw new Error(result.message || 'Failed to send email');
    }

    console.log('Order confirmation email sent to:', order.customer_email);

    return new Response(
      JSON.stringify({ success: true, email_id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Generate HTML email template
function generateOrderEmailHtml(order: any, items: OrderItem[], storeName: string): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: left;">₪${item.price_at_purchase}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: left;">₪${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
      <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${storeName}</h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        
        <!-- Thank You Message -->
        <h2 style="color: #333; margin: 0 0 20px;">תודה על הזמנתך! 🎉</h2>
        <p style="color: #666; line-height: 1.6; margin: 0 0 30px;">
          הזמנתך התקבלה בהצלחה. להלן פרטי ההזמנה:
        </p>
        
        <!-- Order Info -->
        <table width="100%" style="background-color: #f9f9f9; border-radius: 8px; margin-bottom: 30px;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 10px;"><strong>מספר הזמנה:</strong> #${order.order_number}</p>
              <p style="margin: 0 0 10px;"><strong>תאריך:</strong> ${new Date(order.created_at).toLocaleDateString('he-IL')}</p>
              <p style="margin: 0;"><strong>סטטוס:</strong> <span style="color: #22c55e;">שולם ✓</span></p>
            </td>
          </tr>
        </table>
        
        <!-- Items Table -->
        <h3 style="color: #333; margin: 0 0 15px;">פריטים שהוזמנו</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">מוצר</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #eee;">כמות</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">מחיר</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">סה"כ</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <!-- Order Summary -->
        <table width="100%" style="margin-bottom: 30px;">
          <tr>
            <td style="padding: 8px 0; color: #666;">סה"כ מוצרים:</td>
            <td style="padding: 8px 0; text-align: left;">₪${order.products_total}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">משלוח:</td>
            <td style="padding: 8px 0; text-align: left;">₪${order.shipping_cost}</td>
          </tr>
          ${order.discount_amount > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: #22c55e;">הנחה (${order.coupon_code}):</td>
            <td style="padding: 8px 0; text-align: left; color: #22c55e;">-₪${order.discount_amount}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 2px solid #333;">
            <td style="padding: 15px 0; font-size: 18px; font-weight: bold;">סה"כ לתשלום:</td>
            <td style="padding: 15px 0; text-align: left; font-size: 18px; font-weight: bold;">₪${order.total_amount}</td>
          </tr>
        </table>
        
        <!-- Shipping Address -->
        <h3 style="color: #333; margin: 0 0 15px;">כתובת למשלוח</h3>
        <table width="100%" style="background-color: #f9f9f9; border-radius: 8px;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 5px;"><strong>${order.recipient_name}</strong></p>
              <p style="margin: 0 0 5px;">${order.street} ${order.house_number}${order.apartment ? `, דירה ${order.apartment}` : ''}</p>
              <p style="margin: 0 0 5px;">${order.city}${order.zip_code ? `, ${order.zip_code}` : ''}</p>
              <p style="margin: 0;">טלפון: ${order.phone}</p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f5f5f5; padding: 30px; text-align: center;">
        <p style="color: #999; margin: 0 0 10px; font-size: 14px;">
          יש שאלות? צרו קשר: support@nilperfumes.com
        </p>
        <p style="color: #999; margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} ${storeName}. כל הזכויות שמורות.
        </p>
      </td>
    </tr>
    
  </table>
</body>
</html>
  `;
}
