# Tasks TODO - NIL Perfumes Admin System

> Track progress on current work. Keep one item "in progress" at a time.

---

## Phase 1: תשתית בסיס נתונים 🗄️

| Status | Task | Notes |
|--------|------|-------|
| ✅ | 1.1 יצירת Enums | app_role, order_status, discount_type |
| ✅ | 1.2 טבלת Products | מוצרים עם slug, מחיר, מלאי |
| ✅ | 1.3 טבלת Customers | לקוחות "צל" |
| ✅ | 1.4 טבלת Shipping Options | אפשרויות משלוח |
| ✅ | 1.5 טבלת Coupons | קופונים עם תפוגה והגבלות |
| ✅ | 1.6 טבלת Orders | הזמנות עם כל השדות |
| ✅ | 1.7 טבלת Order Items | פריטים עם snapshot מחיר |
| ✅ | 1.8 טבלת User Roles | הרשאות אדמין |
| ✅ | 1.9 יצירת Indexes | אינדקסים לביצועים |
| ✅ | 1.10 יצירת Triggers | updated_at אוטומטי |

**תוצר:** `database/001_schema.sql` ✅

---

## Phase 2: אבטחה והרשאות 🔐

| Status | Task | Notes |
|--------|------|-------|
| ✅ | 2.1 פונקציית has_role() | בדיקת הרשאות משתמש |
| ✅ | 2.2 Enable RLS | הפעלת Row Level Security |
| ✅ | 2.3 Policies - Products | קריאה ציבורית, עריכה לאדמין |
| ✅ | 2.4 Policies - Orders | יצירה ציבורית, קריאה/עריכה לאדמין |
| ✅ | 2.5 Policies - Customers | יצירה ציבורית, קריאה לאדמין |
| ✅ | 2.6 Policies - Coupons | קריאה ציבורית, עריכה לאדמין |
| ⬜ | 2.7 הגדרת Auth OTP | הגדרת התחברות עם קוד למייל |

**תוצר:** Included in `database/001_schema.sql` ✅

---

## Phase 3: ממשק ניהול - מבנה בסיסי 🖥️

| Status | Task | Notes |
|--------|------|-------|
| ✅ | 3.1 AdminLayout | Layout מוגן עם ניווט צדדי |
| ✅ | 3.2 Auth Guard | בדיקת הרשאות + הפניה ל-Login |
| ✅ | 3.3 Login Page | התחברות OTP |
| ✅ | 3.4 Dashboard | סטטיסטיקות בסיסיות |
| ✅ | 3.5 Navigation | תפריט צד עם כל הדפים |

**תוצר:** `src/components/admin/`, `src/pages/admin/`, `src/hooks/useAuth.ts`, `src/types/admin.ts` ✅

---

## Phase 4: ממשק ניהול - דפים 📄

| Status | Task | Notes |
|--------|------|-------|
| ✅ | 4.1 Orders List | טבלת הזמנות + סינון + חיפוש |
| ✅ | 4.2 Order Details | צפייה בהזמנה + שינוי סטטוס |
| ✅ | 4.3 Products List | רשימת מוצרים + עריכה |
| ✅ | 4.4 Product Edit | טופס עריכת מוצר |
| ✅ | 4.5 Coupons List | רשימת קופונים + יצירה |
| ✅ | 4.6 Coupon Create | טופס יצירת קופון |
| ✅ | 4.7 Settings | הגדרות משלוח |

**תוצר:** `src/pages/admin/` - 7 דפים ✅

---

## Phase 5: לוגיקה עסקית - Hooks & Services ⚙️

| Status | Task | Notes |
|--------|------|-------|
| ✅ | 5.1 useOrders | שליפה, סינון, עדכון סטטוס |
| ✅ | 5.2 useProducts | CRUD מוצרים |
| ✅ | 5.3 useCoupons | CRUD קופונים + validation |
| ✅ | 5.4 useCustomers | שליפת לקוחות + findOrCreate |
| ✅ | 5.5 useAuth | התחברות OTP + בדיקת הרשאות (Phase 3) |
| ✅ | 5.6 useDashboard | סטטיסטיקות |

**תוצר:** `src/hooks/` - 6 hooks ✅

---

## Phase 6: אינטגרציות חיצוניות 🔗

| Status | Task | Notes |
|--------|------|-------|
| ⬜ | 6.1 Edge Function - Webhook | קבלת אישור תשלום מ-YaadPay |
| ⬜ | 6.2 Edge Function - Telegram | שליחת התראות לבוט |
| ⬜ | 6.3 Edge Function - Email | שליחת אישור הזמנה (Resend) |
| ⬜ | 6.4 תבנית Email | תבנית React Email מעוצבת |

---

## Completed

- [x] ~~Project setup + Git~~ - 2026-02-03
- [x] ~~Phase 1: Database Schema~~ - 2026-02-03
- [x] ~~Phase 2: RLS Policies~~ - 2026-02-03
