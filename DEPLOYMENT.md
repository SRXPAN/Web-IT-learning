# 🚀 Deployment Guide для E-Learning Platform

Інструкції по deployment на **Cloudflare Pages** (фронтенд) + **Railway/Render** (бекенд) + **Cloudflare R2** (файли)

---

## 📋 **Архітектура**

```
┌─────────────────────────────────────────────────────┐
│  👤 Користувач                                       │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Cloudflare CDN     │
        │  (Global Network)   │
        └──────────┬──────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────────┐          ┌─────────▼──────┐
│ Frontend   │          │ Backend API     │
│ (Pages)    │◄────────►│ (Railway/Render)│
│ Static     │   API    │ Node.js/Express │
└────────────┘          └─────────┬───────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
          ┌─────────▼────────┐      ┌───────────▼─────────┐
          │ Cloudflare R2    │      │ PostgreSQL Database │
          │ (File Storage)   │      │ (Railway/Supabase)  │
          └──────────────────┘      └─────────────────────┘
```

---

## 🌐 **ЧАСТИНА 1: Фронтенд (Cloudflare Pages)**

### **1.1 Підготовка проекту**

```bash
cd Web-e-learning

# Перевір що .env.production налаштовано
cat .env.production
# Має бути: VITE_API_URL=https://your-backend.railway.app
```

### **1.2 Build конфігурація для Cloudflare Pages**

Cloudflare Pages вже має вбудовану підтримку Vite проектів. Налаштування в Cloudflare Dashboard:

**Framework preset**: `Vite`  
**Build command**: `npm run build` або `npm run build:production`  
**Build output directory**: `Web-e-learning/dist`  
**Root directory**: `Web-e-learning`  
**Node version**: `22` (або той же що у `engines.node`)

**Environment Variables:**
```
Production:
  VITE_API_URL=https://your-backend.railway.app

Preview (development):
  VITE_API_URL=https://your-backend-staging.railway.app
```

### **1.3 Конфігураційні файли**

Проект містить файли для Cloudflare оптимізації:

- **`wrangler.json`** — конфіг для Cloudflare Workers (якщо буде потрібно)
- **`_redirects`** — перенаправлення маршрутів SPA (в корені `dist/` після збірки)
- **`public/_headers`** — cache-control headers для оптимізації
- **`vite.config.ts`** — конфіг збірки з оптимізацією для Cloudflare

### **1.4 Build та деплой варіанти**

#### **Варіант A: Через Git (рекомендую)**

1. **Залий проект в GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **В Cloudflare Dashboard:**
   - https://dash.cloudflare.com → Workers & Pages
   - Create application → Pages → Connect to Git
   - Обери свій репозиторій
   - Cloudflare автоматично визначить монорепо структуру
   
3. **Автоматично налаштує:**
   ```yaml
   Build command: npm run build
   Build output directory: dist
   Root directory: Web-e-learning
   ```

4. **Додай Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

5. **Натискай "Save and Deploy"** → Cloudflare почне білдити та розгортати

**Переваги:**
- ✅ Автоматичний redeploy на кожен push
- ✅ Preview для PR
- ✅ Кешування node_modules

#### **Варіант B: Через Wrangler CLI**

```bash
# Встановити Wrangler
npm install -g @cloudflare/wrangler

# Залогіниться
wrangler login

# Білдити локально (тестування)
cd Web-e-learning
npm run build

# Перевірити що dist/ створена правильно
ls -la dist/
# Повинні бути: index.html, assets/, _redirects тощо

# Preview локально
npm run preview
# Відкрити http://localhost:4173

# Деплой на Cloudflare
wrangler pages deploy dist --project-name elearn-frontend
```

#### **Варіант C: Drag & Drop (простої для тестування)**

1. Білдити локально: `npm run build`
2. Відкрити https://dash.cloudflare.com → Pages
3. Upload папку `dist/` в UI

### **1.5 Custom Domain (опційно)**

Після успішного деплою:

```bash
# В Cloudflare Pages settings:
Settings → Custom domains → Add custom domain
# Введи: learn.yourdomain.com
```

**Cloudflare автоматично налаштує SSL/TLS**

**URL після deployment:**
- `https://elearn-frontend.pages.dev` (автоматичний)
- `https://learn.yourdomain.com` (якщо додав custom domain)

### **1.6 Перевірка перед деплоєм**

```bash
# 1. Локальна збірка
cd Web-e-learning
npm run build

# 2. Перевірити dist/ структуру
ls -la dist/
# Повинні бути: index.html, assets/, 
# Для SPA маршрутів повинен бути _redirects

# 3. Preview
npm run preview
# Відкрити http://localhost:4173

# 4. Перевірити routing (тестування SPA)
# Навігуватися на маршрути типу:
# - http://localhost:4173/materials
# - http://localhost:4173/quiz/123
# Повинна завантажитися сторінка без 404
# (якщо 404 - перевір _redirects файл)

# 5. Перевірити API connection
# Відкрити DevTools → Network
# Запити до VITE_API_URL повинні проходити (не 404)
```

### **1.7 Вирішення типових проблем**

#### **Build timeout на Cloudflare**

```bash
# Рішення: оптимізуй білд
# 1. Виключи непотрібні залежності
npm prune --production

# 2. Використовуй build:production команду (якщо існує)
npm run build:production

# 3. Vagy у Cloudflare Pages Settings збільши timeout на 30+ хв
```

#### **Missing environment variables**

```bash
# ВИРІШЕННЯ: у Cloudflare Pages Settings додай:
Environment variables → VITE_API_URL
# З значенням URL твого бекенду
```

#### **Routing не працює (404 на SPA маршрутах)**

```bash
# ПРОБЛЕМА: файл _redirects не знайдено
# РІШЕННЯ: 
# 1. Переконайся що _redirects в корені dist/ після білда
#    ls dist/_redirects
# 2. Cloudflare Pages автоматично обробляє _redirects
# 3. Якщо не працює - перебудуй: npm run build
```

#### **CORS помилки при запитах до API**

```bash
# РІШЕННЯ: налаштуй CORS на бекенді
# В elearn-backend/.env встанови:
CORS_ORIGIN=https://yourdomain.pages.dev,https://learn.yourdomain.com

# Тогоді перезапусти бекенд та перебудуй фронтенд
```

#### **Node version mismatch помилки**

```bash
# РІШЕННЯ: у Cloudflare Pages → Settings → Build
# Change Node version: обери Node 22 (або той же як у package.json)
# engines.node версія
```

#### **TypeScript не знаходить типи при білді**

```bash
# РІШЕННЯ: перевір tsconfig.json виключає тести:
{
  "exclude": [
    "node_modules",
    "dist",
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

#### **Залежність не знайдена (@elearn/shared)**

```bash
# РІШЕННЯ: Cloudflare Pages автоматично встановлює залежності
# Переконайся що package.json правильно налаштований:
# 1. workspace залежности налаштовані
# 2. npm install локально працює
# 3. Перебудуй: npm run build
```

### **1.8 Оптимізація для Cloudflare**

**Кешування стратегія:**
- HTML (index.html): 3600s (1 година) - реревалідація
- JS/CSS (immutable): 31536000s (1 рік) - кешуються назавжди (Vite додає hash)
- API запити: no-cache - всі запити йдуть на сервер

**Performance оптимізації:**
- Minification: Terser (вимикаємо console.log в production)
- Sourcemaps: вимкнено для експорту (зменшує розмір)
- Build output: оптимізований dist/ (тільки потрібні файли)

**Автоматичні переваги Cloudflare Pages:**
- ✅ Global CDN - коротший latency для користувачів
- ✅ DDOS захист
- ✅ Автоматичний SSL/TLS сертифікат
- ✅ Поміжного кешування для статичних файлів

---

## ⚙️ **ЧАСТИНА 2: Бекенд (Railway / Render)**

### **2.1 Підготовка**

```bash
cd elearn-backend

# Скопіюй .env.example в .env
cp .env.example .env

# Заповни всі змінні (особливо R2!)
```

### **2.2 Deploy на Railway (рекомендую)**

**Чому Railway?**
- ✅ Безкоштовний tier ($5/місяць кредити)
- ✅ PostgreSQL вбудована
- ✅ Автоматичний SSL
- ✅ GitHub integration

**Кроки:**

1. **Створи проект на Railway:**
   ```bash
   # Встанови CLI
   npm install -g @railway/cli
   
   # Логін
   railway login
   
   # Створи проект
   railway init
   ```

2. **Додай PostgreSQL:**
   - В Railway Dashboard → New → Database → PostgreSQL
   - Скопіюй `DATABASE_URL` зі змінних

3. **Налаштуй Environment Variables:**
   ```bash
   # Автоматично з Railway UI або CLI:
   railway variables set DATABASE_URL="postgresql://..."
   railway variables set JWT_SECRET="your_secret_32_chars"
   railway variables set R2_ACCOUNT_ID="your_cloudflare_account"
   railway variables set R2_ACCESS_KEY_ID="your_r2_key"
   railway variables set R2_SECRET_ACCESS_KEY="your_r2_secret"
   railway variables set R2_BUCKET_NAME="elearn-files"
   railway variables set R2_PUBLIC_URL="https://your-bucket.r2.dev"
   railway variables set CORS_ORIGIN="https://elearn-frontend.pages.dev"
   railway variables set FRONTEND_URL="https://elearn-frontend.pages.dev"
   railway variables set NODE_ENV="production"
   railway variables set PORT="4000"
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Запусти міграції:**
   ```bash
   railway run npm run prisma:migrate
   railway run npm run seed
   ```

**Твій бекенд URL:** `https://your-app.railway.app`

---

### **2.3 Deploy на Render (альтернатива)**

**Чому Render?**
- ✅ Безкоштовний tier
- ✅ Автоматичний SSL
- ✅ Easy setup

**Кроки:**

1. **Створи Web Service:**
   - https://dashboard.render.com → New → Web Service
   - Connect GitHub repo
   
2. **Налаштування:**
   ```yaml
   Name: elearn-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables** (додай всі з .env.example)

4. **Додай PostgreSQL:**
   - New → PostgreSQL
   - Copy `DATABASE_URL`

**Недолік:** Free tier засипає після 15 хв неактивності (перший запит повільний)

---

## 💾 **ЧАСТИНА 3: Cloudflare R2 (File Storage)**

### **3.1 Створи R2 Bucket**

1. **В Cloudflare Dashboard:**
   - R2 → Create bucket
   - Назва: `elearn-files`
   - Region: Automatic

2. **Створи API Token:**
   - R2 → Manage R2 API Tokens → Create API token
   - Permissions: Object Read & Write
   - Скопіюй: `Access Key ID` та `Secret Access Key`

3. **Отримай Account ID:**
   - В URL dashboard: `https://dash.cloudflare.com/YOUR_ACCOUNT_ID/r2`
   - Або в Settings → Account ID

### **3.2 Налаштуй Public Access (опційно)**

Якщо хочеш щоб файли були публічні:

```bash
# В R2 bucket settings:
Settings → Public Access → Allow Access
Custom Domain → r2.yourdomain.com (або використай dev subdomain)
```

**Public URL format:**
- Dev: `https://pub-xxxxx.r2.dev`
- Custom: `https://r2.yourdomain.com`

### **3.3 Перевір код storage.service.ts**

Файл вже налаштований! Переконайся що env змінні правильні:

```typescript
// elearn-backend/src/services/storage.service.ts
const s3 = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})
```

---

## 🗄️ **ЧАСТИНА 4: База Даних**

### **Варіант A: Railway PostgreSQL (вбудована)**

Вже налаштовано якщо використовуєш Railway для бекенду.

### **Варіант B: Supabase (безкоштовна)**

1. **Створи проект:**
   - https://supabase.com → New project
   - Регіон: обери найближчий

2. **Отримай DATABASE_URL:**
   - Settings → Database → Connection string
   - Transaction mode (для Prisma)
   ```
   postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
   ```

3. **Додай до Railway/Render env:**
   ```bash
   DATABASE_URL="postgresql://..."
   ```

### **Варіант C: Neon (serverless PostgreSQL)**

- https://neon.tech - serverless, auto-scaling
- Безкоштовний tier: 0.5 GB storage
- Отримай connection string та додай в env

---

## 🔐 **ЧАСТИНА 5: Secrets & Security**

### **5.1 Генеруй сильні secrets:**

```bash
# JWT_SECRET (32+ chars)
openssl rand -base64 32

# JWT_REFRESH_SECRET
openssl rand -base64 32
```

### **5.2 CORS налаштування:**

В бекенд `.env`:
```bash
# Production
CORS_ORIGIN="https://elearn-frontend.pages.dev,https://learn.yourdomain.com"

# Development (додай localhost)
CORS_ORIGIN="http://localhost:5173,https://elearn-frontend.pages.dev"
```

### **5.3 Rate Limiting (production):**

```bash
# Strict для production
RL_AUTH_LIMIT=10
RL_GENERAL_LIMIT=100
```

---

## ✅ **ЧАСТИНА 6: Фінальні кроки**

### **6.1 Оновлюй Frontend URL**

Після deployment бекенду:

```bash
# В Cloudflare Pages → Settings → Environment Variables
VITE_API_URL=https://your-app.railway.app
```

**Redeploy фронтенду:**
- Pages → Deployments → Retry deployment

### **6.2 Тестування**

```bash
# Перевір endpoints:
curl https://your-backend.railway.app/api/auth/csrf
curl https://your-backend.railway.app/api/i18n/bundle?lang=UA

# Перевір фронтенд:
# Відкрий https://elearn-frontend.pages.dev
# Спробуй login/register
```

### **6.3 Моніторинг**

- **Railway:** Logs → Real-time logs
- **Cloudflare:** Analytics → Web Analytics
- **R2:** Metrics → Storage usage

---

## 📊 **Pricing Estimate**

| Сервіс | Free Tier | Paid (якщо потрібно) |
|--------|-----------|---------------------|
| **Cloudflare Pages** | Unlimited requests | $0 (безкоштовно) |
| **Cloudflare R2** | 10 GB storage, 1M Class A requests/mo | $0.015/GB/month |
| **Railway** | $5 credits/mo (enough for small app) | $5-20/month |
| **Supabase** | 500 MB DB, 2 GB bandwidth | $25/month Pro |

**Мінімальна ціна:** $0-5/місяць (для малого проекту)

---

## 🐛 **Troubleshooting**

### **CORS errors:**
```bash
# Перевір CORS_ORIGIN в бекенд .env
# Має містити точну URL фронтенду
```

### **500 errors на /api/auth/csrf:**
```bash
# Перевір що бекенд запущений:
railway logs
# Або
render logs
```

### **Database connection failed:**
```bash
# Перевір DATABASE_URL
# Для Railway:
railway variables

# Тест connection:
railway run npm run db:status
```

### **R2 upload fails:**
```bash
# Перевір credentials:
echo $R2_ACCOUNT_ID
echo $R2_ACCESS_KEY_ID

# Тест:
railway run node -e "console.log(process.env.R2_ACCOUNT_ID)"
```

---

## 🎯 **Швидкий Checklist**

- [ ] Frontend deployed на Cloudflare Pages
- [ ] Backend deployed на Railway/Render
- [ ] PostgreSQL database створена
- [ ] Migrations виконані (`npm run prisma:migrate`)
- [ ] Seed data додано (`npm run seed`)
- [ ] R2 bucket створений
- [ ] R2 credentials налаштовані
- [ ] CORS правильно налаштований
- [ ] Frontend `VITE_API_URL` вказує на бекенд
- [ ] Login/Register працює
- [ ] Переклади завантажуються
- [ ] File upload працює (якщо використовуєш)

---

## 📚 **Додаткові ресурси**

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Railway Docs](https://docs.railway.app/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Готово! 🎉** Твій проект ready for production!
