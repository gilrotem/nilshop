// ============================================================
// NIL Perfumes - YaadPay Payment Webhook Handler
// Edge Function for Lovable Cloud
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YaadPayResponse {
  Id: string;           // Transaction ID from YaadPay
  CCode: string;        // Response code (0 = success)
  Amount: string;       // Amount in agorot (cents)
  ACode: string;        // Authorization code
  Fild1?: string;       // Custom field 1 (order_number)
  Fild2?: string;       // Custom field 2
  Fild3?: string;       // Custom field 3
  Coin?: string;        // Currency (1 = ILS)
  Tmonth?: string;      // Card expiry month
  Tyear?: string;       // Card expiry year
  L4digit?: string;     // Last 4 digits of card
  Hesh?: string;        // Number of payments
  UserId?: string;      // Customer ID from YaadPay
  Sign?: string;        // Signature for verification
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook data (YaadPay sends as form data or query params)
    let paymentData: YaadPayResponse;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      paymentData = Object.fromEntries(formData) as unknown as YaadPayResponse;
    } else if (contentType.includes('application/json')) {
      paymentData = await req.json();
    } else {
      // Try URL params (GET request)
      const url = new URL(req.url);
      paymentData = Object.fromEntries(url.searchParams) as unknown as YaadPayResponse;
    }

    console.log('Received payment webhook:', JSON.stringify(paymentData));

    // Validate required fields
    if (!paymentData.CCode || !paymentData.Fild1) {
      throw new Error('Missing required fields');
    }

    // CCode "0" means success
    if (paymentData.CCode !== '0') {
      console.log('Payment failed with code:', paymentData.CCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Payment failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get order by order_number (stored in Fild1)
    const orderNumber = parseInt(paymentData.Fild1);
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderNumber);
      throw new Error(`Order not found: ${orderNumber}`);
    }

    // Verify amount matches (YaadPay sends in agorot)
    const paidAmount = parseInt(paymentData.Amount) / 100;
    if (Math.abs(paidAmount - order.total_amount) > 0.01) {
      console.error('Amount mismatch:', { paid: paidAmount, expected: order.total_amount });
      throw new Error('Amount mismatch');
    }

    // Update order status to 'paid'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_provider_id: paymentData.Id,
      })
      .eq('id', order.id);

    if (updateError) {
      throw updateError;
    }

    // Update customer stats
    if (order.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('total_orders, total_spent')
        .eq('id', order.customer_id)
        .single();

      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_orders: (customer.total_orders || 0) + 1,
            total_spent: (customer.total_spent || 0) + order.total_amount,
            last_order_at: new Date().toISOString(),
          })
          .eq('id', order.customer_id);
      }
    }

    // Increment coupon usage if used
    if (order.coupon_code) {
      await supabase.rpc('increment_coupon_usage', { coupon_code: order.coupon_code });
    }

    // Trigger notifications (async - don't wait)
    const baseUrl = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
    
    // Send Telegram notification to admin
    fetch(`${baseUrl}/send-telegram`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        order_number: order.order_number,
        customer_name: order.recipient_name,
        total_amount: order.total_amount,
      }),
    }).catch(console.error);

    // Send confirmation email to customer
    fetch(`${baseUrl}/send-order-email`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        order_id: order.id,
      }),
    }).catch(console.error);

    console.log('Payment processed successfully for order:', orderNumber);

    return new Response(
      JSON.stringify({ success: true, order_number: orderNumber }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
