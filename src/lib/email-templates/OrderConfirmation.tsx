// ============================================================
// NIL Perfumes - Order Confirmation Email Template
// React Email Template (for reference/future use)
// ============================================================

import * as React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price_at_purchase: number;
}

interface OrderEmailProps {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  productsTotal: number;
  shippingCost: number;
  discountAmount: number;
  couponCode: string | null;
  totalAmount: number;
  shippingAddress: {
    street: string;
    houseNumber: string;
    apartment?: string;
    city: string;
    zipCode?: string;
  };
  phone: string;
  orderDate: string;
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  productsTotal,
  shippingCost,
  discountAmount,
  couponCode,
  totalAmount,
  shippingAddress,
  phone,
  orderDate,
}: OrderEmailProps) {
  return (
    <html dir="rtl" lang="he">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.logo}>NIL Perfumes</h1>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <h2 style={styles.title}>תודה על הזמנתך! 🎉</h2>
            <p style={styles.subtitle}>
              הזמנתך התקבלה בהצלחה. להלן פרטי ההזמנה:
            </p>

            {/* Order Info Box */}
            <div style={styles.infoBox}>
              <p><strong>מספר הזמנה:</strong> #{orderNumber}</p>
              <p><strong>תאריך:</strong> {new Date(orderDate).toLocaleDateString('he-IL')}</p>
              <p><strong>סטטוס:</strong> <span style={styles.statusPaid}>שולם ✓</span></p>
            </div>

            {/* Items */}
            <h3>פריטים שהוזמנו</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>מוצר</th>
                  <th style={styles.th}>כמות</th>
                  <th style={styles.th}>מחיר</th>
                  <th style={styles.th}>סה"כ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{item.name}</td>
                    <td style={styles.tdCenter}>{item.quantity}</td>
                    <td style={styles.td}>₪{item.price_at_purchase}</td>
                    <td style={styles.td}>₪{(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span>סה"כ מוצרים:</span>
                <span>₪{productsTotal}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>משלוח:</span>
                <span>₪{shippingCost}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ ...styles.summaryRow, color: '#22c55e' }}>
                  <span>הנחה ({couponCode}):</span>
                  <span>-₪{discountAmount}</span>
                </div>
              )}
              <div style={styles.summaryTotal}>
                <span>סה"כ לתשלום:</span>
                <span>₪{totalAmount}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <h3>כתובת למשלוח</h3>
            <div style={styles.infoBox}>
              <p><strong>{customerName}</strong></p>
              <p>
                {shippingAddress.street} {shippingAddress.houseNumber}
                {shippingAddress.apartment && `, דירה ${shippingAddress.apartment}`}
              </p>
              <p>
                {shippingAddress.city}
                {shippingAddress.zipCode && `, ${shippingAddress.zipCode}`}
              </p>
              <p>טלפון: {phone}</p>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p>יש שאלות? צרו קשר: support@nilperfumes.com</p>
            <p>© {new Date().getFullYear()} NIL Perfumes. כל הזכויות שמורות.</p>
          </div>
        </div>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5',
  },
  container: {
    maxWidth: 600,
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 30,
    textAlign: 'center',
  },
  logo: {
    color: '#ffffff',
    margin: 0,
    fontSize: 24,
  },
  content: {
    padding: '40px 30px',
  },
  title: {
    color: '#333',
    margin: '0 0 20px',
  },
  subtitle: {
    color: '#666',
    lineHeight: 1.6,
    margin: '0 0 30px',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  statusPaid: {
    color: '#22c55e',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #eee',
    borderRadius: 8,
    marginBottom: 30,
  },
  th: {
    padding: 12,
    textAlign: 'right',
    borderBottom: '2px solid #eee',
    backgroundColor: '#f9f9f9',
  },
  td: {
    padding: 12,
    borderBottom: '1px solid #eee',
  },
  tdCenter: {
    padding: 12,
    borderBottom: '1px solid #eee',
    textAlign: 'center',
  },
  summary: {
    marginBottom: 30,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    color: '#666',
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0',
    fontSize: 18,
    fontWeight: 'bold',
    borderTop: '2px solid #333',
  },
  footer: {
    backgroundColor: '#f5f5f5',
    padding: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
};

export default OrderConfirmationEmail;
