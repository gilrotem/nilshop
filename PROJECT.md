# Project: NILSHOP

> מסמך זה הוא מקור האמת עבור הסוכן. מלא את הסעיפים הרלוונטיים.

---

## 🎯 Overview

**מטרה:** מערכת ניהול הזמנות ומעקב משלוחים לחנות בשמים NIL Perfumes

**סטאק:**
- Frontend: React + TypeScript + Tailwind
- Backend: Supabase Edge Functions (via Lovable Cloud)
- Database: PostgreSQL (via Lovable Cloud)
- Hosting: Lovable
- Payment: YaadPay (Redirect API)
- Email: Resend
- Notifications: Telegram Bot

**GitHub:** https://github.com/gilrotem/nilshop

---

## 📁 Main Directories

```
src/
├── components/   — UI components
├── pages/        — Page components
├── hooks/        — Custom hooks
├── services/     — API calls
└── utils/        — Helper functions
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

---

## 📐 Code Standards

- **Language:** TypeScript (strict mode)
- **Components:** Function components + hooks
- **Styling:** Tailwind CSS utility-first
- **State:** TanStack Query for server state
- **Naming:** PascalCase components, camelCase functions

---

## 🔒 Security Rules

- ❌ Never commit secrets or service role keys
- ❌ No direct Supabase calls in UI components (use hooks/services)
- ❌ Avoid `any` type
- ✅ Use `.env` for local secrets (only `VITE_` prefix in client)
- ✅ Validate all user input
- ✅ Enforce RLS in database

---

## 🚀 Development Workflow

### Git
- Main branch protected
- Feature branches for new work
- Small, descriptive commits

### Lovable Sync (if applicable)
- Lovable edits sync to GitHub automatically
- Local changes: `git pull` before work, `git push` after
- Edge Functions deploy via Lovable (not git push)

---

## ☁️ Lovable Cloud Infrastructure

> **חשוב!** אם הפרויקט משתמש ב-Lovable Cloud, הוא כולל Supabase מנוהל.

```
┌─────────────────────────────────────────────────────────────┐
│                      LOVABLE CLOUD                          │
│         (מנוהל 100% דרך Lovable - אין Dashboard נפרד)       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ניהול דרך Lovable Editor:                                │
│   ├── Cloud → Database (SQL Editor)                        │
│   ├── Cloud → Users & Auth                                 │
│   ├── Cloud → Edge Functions                               │
│   ├── Cloud → Secrets                                      │
│   └── Cloud → Logs                                         │
│                                                             │
│   Project ID: [YOUR_PROJECT_ID]                            │
│   ❌ אין גישה ל-Supabase Dashboard ישירות!                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔑 Lovable Cloud - מה ואיפה:

| פעולה | איפה לבצע |
|-------|-----------|
| הרצת Migrations | Lovable → Cloud → Database → SQL Editor |
| Auth Settings | Lovable → Cloud → Users & Auth |
| Secrets/ENV | Lovable → Cloud → Secrets |
| Edge Functions Deploy | Lovable עושה אוטומטית / Cloud → Edge Functions |
| Supabase Dashboard | ❌ **אין גישה ישירה!** |

### ⚠️ טעויות נפוצות להימנע:
- ❌ לא לנסות לגשת ל-supabase.com/dashboard
- ❌ לא להריץ `supabase db push` מהטרמינל
- ❌ לא ליצור Supabase project נפרד
- ✅ הכל דרך Lovable Editor בלבד

---

## ✅ Definition of Done

A task is done when:
- [ ] Behavior matches requirements
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Build passes (`npm run build`)
- [ ] Tested manually or with automated tests
- [ ] Code follows existing patterns
- [ ] Changes documented if needed

---

## ⚠️ Project-Specific Rules

### Database Schema (Known)
- **`app_role` enum:** `editor`, `owner`
- **`projects` table:** includes `owner_id`, `created_by`

### TODO (Security)
- [ ] Enable "Leaked Password Protection" in Lovable Cloud → Auth settings

---

## 📝 Notes

- Project cloned from GitHub on 2026-02-03
- Lovable Cloud is the single source of truth for DB/Auth/Functions
