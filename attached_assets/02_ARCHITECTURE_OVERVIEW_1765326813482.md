# АРХИТЕКТУРА СИСТЕМЫ - SecureLex.ru

**Версия:** 2.0  
**Дата:** 10 декабря 2025  

---

## 🏗️ ОБЩАЯ АРХИТЕКТУРА

```
┌──────────────────────────────────────────────────┐
│                    USER BROWSER                  │
│  Frontend (React) - SecureLex.ru                 │
│  ├─ Registration Form                            │
│  ├─ Dashboard (User / Admin / SuperAdmin)        │
│  ├─ Package Selector (Dropdown + Dynamic)        │
│  ├─ URL Input (flexible format support)          │
│  └─ Reports Viewer                               │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────┐
│          BACKEND API (Node.js + Express)         │
│  ├─ /auth/* (registration, login, verify)       │
│  ├─ /packages (GET dropdown + 9 options)        │
│  ├─ /audits (POST create, GET list, result)     │
│  ├─ /url-normalizer (normalize input format)    │
│  ├─ /payments (POST create, webhook)            │
│  ├─ /reports (GET brief, POST full PDF)         │
│  ├─ /admin/* (admin endpoints)                  │
│  └─ /superadmin/* (superadmin endpoints)        │
└────────────┬──────────────────────┬──────────────┘
             │                      │
    ┌────────▼─┐        ┌──────────▼────┐
    │PostgreSQL│        │ Redis Cache   │
    │Database  │        │ + Sessions    │
    │15 Tables │        │ + Job Queue   │
    └──────────┘        └───────────────┘
             │                      │
    ┌────────▼──────────────────────▼──────┐
    │   EXTERNAL SERVICES                  │
    ├─ Яндекс.Касса (Payments)            │
    ├─ Yandex Mail (Email)                │
    ├─ Mail.ru (Email backup)             │
    ├─ OpenAI GPT-4 (Analysis)            │
    └─ VK Cloud Storage (PDFs)            │
```

---

## 🔄 ПРОЦЕСС: НОРМАЛИЗАЦИЯ URL

### Backend URL-Normalizer

```javascript
function normalizeURL(inputURL) {
  // Пользователь вводит:
  // "example.com"
  // "www.example.com"
  // "https://example.com"
  // "https://www.example.com"
  // "http://example.com"
  
  // Система нормализует:
  let normalized = inputURL.trim();
  
  // Добавить https:// если его нет
  if (!normalized.match(/^https?:\/\//)) {
    normalized = 'https://' + normalized;
  }
  
  // Парсить URL
  const url = new URL(normalized);
  
  // Результат для сохранения: https://example.com
  return url.origin + url.pathname;
}

// ПРИМЕРЫ:
normalizeURL("example.com") 
  → "https://example.com"

normalizeURL("www.example.com") 
  → "https://www.example.com"

normalizeURL("https://www.example.com") 
  → "https://www.example.com"
```

---

## 📂 БАЗА ДАННЫХ

### 15 Таблиц

```
1. users (email, name, phone, company_name, inn)
2. audit_packages (type, price, criteria_count, duration)
3. audits (user_id, package_id, website_url_normalized)
4. audit_results (audit_id, criteria_json)
5. payments (user_id, amount, yandex_id, status)
6. reports (audit_id, type, content_html, pdf_url)
7. users_roles (user_id, role)
8. emails_log (user_id, email_type, status)
9. contracts (user_id, type, signed_at)
10. promo_codes (code, discount, created_by)
11. referral_earnings (referrer_id, referee_id, amount)
12. design_themes (name, css_content, is_active)
13. audit_logs (user_id, action, resource_type)
14. admins (email, password_hash, ip_whitelist)
15. system_settings (key: "site_name", value: "SecureLex.ru")
```

---

## 🔐 БЕЗОПАСНОСТЬ URL

```javascript
// Валидация URL на фронтенде
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Валидация на бэкенде
function isValidWebsite(url) {
  // Проверить не локальный ли адрес
  const banned = ['localhost', '127.0.0.1', '192.168', '10.0', '172.16'];
  for (let b of banned) {
    if (url.includes(b)) return false;
  }
  
  // Проверить домен существует
  return dns.lookup(url); // выкинет ошибку если нет
}
```

---

**Версия:** 2.0 ✅
