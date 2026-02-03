// ============================================================
// NIL Perfumes - Telegram Notification Function
// Edge Function for Lovable Cloud
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramPayload {
  order_number: number;
  customer_name: string;
  total_amount: number;
  message?: string;  // Optional custom message
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Telegram credentials from environment
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.error('Missing Telegram configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Telegram not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const payload: TelegramPayload = await req.json();

    // Build message
    let message: string;
    
    if (payload.message) {
      // Use custom message if provided
      message = payload.message;
    } else {
      // Build order notification message
      message = `🛒 *הזמנה חדשה!*

📦 הזמנה: #${payload.order_number}
👤 לקוח: ${payload.customer_name}
💰 סכום: ₪${payload.total_amount.toLocaleString()}

⏰ ${new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })}`;
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', result);
      throw new Error(result.description || 'Telegram API error');
    }

    console.log('Telegram notification sent for order:', payload.order_number);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Telegram notification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
