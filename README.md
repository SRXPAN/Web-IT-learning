# 🎓 E-Learn Platform

> Повнофункціональна платформа електронного навчання з мультимовною підтримкою (UA/PL/EN), системою прогресу, інтерактивними квізами та адміністративною панеллю.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF.svg)](https://vitejs.dev/)

## 🌟 Основні можливості

### 👨‍🎓 Для студентів
- 📚 **Структурований навчальний контент** — ієрархічні теми з підтемами та матеріалами (PDF, відео, текст, посилання)
- 🌍 **Мультимовна підтримка** — UA/PL/EN з локалізованим контентом для кожної мови
- 🎯 **Інтерактивні квізи** — тестування знань з миттєвим зворотнім зв'язком
- 🏆 **Система прогресу** — XP, рівні, досягнення, відстеження переглянутих матеріалів
- 📊 **Персональна статистика** — детальна аналітика прогресу та активності
- 🔍 **Глобальний пошук** — швидкий пошук по всьому контенту
- 🏅 **Таблиця лідерів** — змагання між студентами

### 👨‍💼 Для редакторів контенту
- ✏️ **Редактор матеріалів** — створення та редагування контенту
- 🌐 **Мультимовне управління** — окремі заголовки та контент для кожної мови
- 📤 **Завантаження файлів** — підтримка PDF, відео через S3/R2 storage
- 🔄 **Контроль статусу** — Draft/Published для поетапної публікації
- 📝 **Управління квізами** — створення питань з локалізованими текстами

### 👨‍💻 Для адміністраторів
- 👥 **Управління користувачами** — ролі (STUDENT, EDITOR, ADMIN), статистика
- 📈 **Системна аналітика** — статистика користувачів, контенту, активності
- 🗂️ **Управління контентом** — теми, матеріали, квізи, файли
- 📝 **Журнал аудиту** — логування всіх критичних операцій
- 🔐 **Безпека** — CSRF захист, rate limiting, role-based access control

## 🏗️ Архітектура проекту

```
elearn-monorepo/
├── packages/
│   └── shared/                 # Спільні TypeScript типи
│       └── src/types/          # API контракти, моделі даних (index.ts)
│
├── elearn-backend/             # Express + Prisma API сервер
│   └── src/
│       ├── routes/             # API endpoints
│       │   ├── auth.ts         # Автентифікація
│       │   ├── admin.ts        # Адмін-панель
│       │   ├── topics.ts       # Теми
│       │   ├── lessons.ts      # Уроки
│       │   ├── quiz.ts         # Квізи
│       │   ├── progress.ts     # Прогрес користувача
│       │   ├── editor.ts       # Редактор контенту
│       │   ├── files.ts        # Файли (S3/R2)
│       │   ├── i18n.ts         # Переклади
│       │   ├── dashboard.ts    # Dashboard API
│       │   └── activity.ts     # Активність
│       ├── middleware/         # Auth, CSRF, validation, rateLimit, errorHandler
│       ├── services/           # Бізнес-логіка (ai, audit, email, storage, etc.)
│       ├── schemas/            # Zod валідація
│       ├── prisma/             # Schema, migrations, seeds
│       ├── utils/              # Утиліти (logger, i18n, gamification)
│       └── config/             # [ДОДАНО] Налаштування (dailyGoals.ts, weakSpots.ts)
│
├── elearn-front/               # React + Vite SPA
│   └── src/
│       ├── pages/              # Сторінки
│       │   ├── Dashboard.tsx   # Головна панель
│       │   ├── Materials.tsx   # Перегляд матеріалів
│       │   ├── LessonView.tsx  # Перегляд уроків
│       │   ├── Leaderboard.tsx # Таблиця лідерів
│       │   ├── Profile.tsx     # Профіль користувача
│       │   ├── Login.tsx       # Вхід
│       │   ├── Register.tsx    # Реєстрація
│       │   ├── NotFound.tsx    # [ДОДАНО] Сторінка 404
│       │   │
│       │   ├── admin/          # Адмін-панель
│       │   │   ├── AdminLayout.tsx       # [ДОДАНО] Окремий Layout для адмінки
│       │   │   ├── AdminDashboard.tsx
│       │   │   ├── AdminUsers.tsx
│       │   │   ├── AdminUserDetails.tsx  # [ДОДАНО] Деталі користувача
│       │   │   ├── AdminContent.tsx
│       │   │   ├── AdminTopics.tsx
│       │   │   ├── AdminFiles.tsx
│       │   │   └── AdminAuditLogs.tsx
│       │   │
│       │   └── materialsComponents/      # [ДОДАНО] Складові для Materials.tsx
│       │       ├── TopicSidebar.tsx      # Навігація по темах
│       │       ├── DashboardView.tsx     # Внутрішній дашборд матеріалів
│       │       └── ...                   # Інші модалки та віджети для сторінки
│       │
│       ├── components/         # UI компоненти (admin/, dashboard/, загальні)
│       ├── hooks/              # Custom React hooks (useActivityTracker, useAdmin, useFileUpload)
│       ├── auth/               # Контекст автентифікації
│       ├── i18n/               # Інтернаціоналізація (locales: en, pl, ua)
│       ├── store/              # Zustand state management (catalog, i18n, theme)
│       ├── lib/                # HTTP клієнт, API контракти (editorApi, http)
│       └── utils/              # [ДОДАНО] Допоміжні функції (formatters, storage, colors)
│
├── package.json                # Monorepo root (workspaces)
├── package-lock.json           # Загальні залежності монорепозиторію
└── tsconfig.json               # Глобальний конфіг TypeScript
```

## 🛠️ Технологічний стек

### Frontend
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| React | 18.2 | UI бібліотека |
| TypeScript | 5.3 | Type safety |
| Vite | 5.1 | Build tool |
| React Router | 6.22 | Client-side routing |
| Zustand | 4.5 | State management |
| Tailwind CSS | 3.4 | Styling |
| Lucide React | 0.344 | Іконки |
| Axios | 1.13 | HTTP клієнт |

### Backend
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Node.js | 20+ | Runtime |
| Express | 4.19 | Web framework |
| TypeScript | 5.6 | Type safety |
| Prisma | 5.19 | ORM |
| PostgreSQL | 16 | База даних |
| JWT | - | Автентифікація |
| Zod | 3.23 | Валідація |
| Helmet | 7.1 | Security headers |
| Winston | 3.19 | Логування |
| AWS SDK | 3.958 | S3/R2 storage |

### DevOps & Tools
| Технологія | Призначення |
|------------|-------------|
| Vitest | Тестування |
| npm workspaces | Monorepo |
| tsx | TypeScript execution |
| Cloudflare R2 | File storage |
| Wrangler | Deployment |

## 🚀 Швидкий старт

### Вимоги

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 16.0
- **npm** >= 10.0.0

### 1️⃣ Встановлення

```bash
# Клонувати репозиторій
git clone https://github.com/your-username/elearn-platform.git
cd elearn-platform

# Встановити всі залежності
npm install
```

### 2️⃣ Налаштування Backend

```bash
cd elearn-backend
```

Створіть файл `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/elearn?schema=public"

# Server
PORT=4000
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# JWT
JWT_SECRET="your-super-secret-key-min-32-characters"

# Email (опціонально)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password
MAIL_FROM="E-Learn <noreply@elearn.com>"

# R2/S3 Storage (опціонально)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=elearn-files

# Rate Limiting
RL_GENERAL_WINDOW_MS=60000
RL_GENERAL_LIMIT=200
RL_AUTH_WINDOW_MS=900000
RL_AUTH_LIMIT=10
```

Ініціалізація бази даних:

```bash
npm run prisma:generate   # Генерація Prisma client
npm run prisma:migrate    # Застосування міграцій
npm run db:seed           # Заповнення тестовими даними
```

### 3️⃣ Налаштування Frontend

```bash
cd ../elearn-front
```

Створіть файл `.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

### 4️⃣ Запуск

**Варіант 1: Разом (з кореневої папки)**

```bash
npm run dev
```

**Варіант 2: Окремо**

```bash
# Terminal 1 - Backend
cd elearn-backend
npm run dev
# → http://localhost:4000

# Terminal 2 - Frontend
cd elearn-front
npm run dev
# → http://localhost:5173
```

### 5️⃣ Тестові облікові записи

```
👨‍💼 Admin:
   Email: admin@elearn.local
   Password: admin123

✍️ Editor:
   Email: editor@example.com
   Password: Editor123!

🎓 Student:
   Email: student@example.com
   Password: Student123!
```

## 📦 Доступні скрипти

### Root (Monorepo)

| Команда | Опис |
|---------|------|
| `npm run dev` | Запуск всіх сервісів |
| `npm run dev:backend` | Тільки backend |
| `npm run dev:frontend` | Тільки frontend |
| `npm run build` | Збірка всіх пакетів |
| `npm run test` | Запуск тестів |
| `npm run clean` | Очистити node_modules |

### Backend

| Команда | Опис |
|---------|------|
| `npm run dev` | Watch mode |
| `npm run build` | Production build |
| `npm start` | Запуск production |
| `npm run prisma:generate` | Генерація Prisma client |
| `npm run prisma:migrate` | Нова міграція |
| `npm run db:seed` | Seed даних |
| `npm run db:status` | Перевірка стану БД |
| `npm run db:publish` | Опублікувати Draft записи |
| `npm run test` | Запуск тестів |
| `npm run test:coverage` | Coverage звіт |

### Frontend

| Команда | Опис |
|---------|------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run deploy` | Deploy to Cloudflare Pages |
| `npm run test` | Запуск тестів |
| `npm run lint` | TypeScript перевірка |

## 🗄️ Модель даних

### Основні сутності

```
User
├── id, email, name, password
├── role: STUDENT | EDITOR | ADMIN
├── xp, emailVerified, isPremium
├── avatarFile → File
└── viewedMaterials[]

Topic
├── id, slug, name
├── titleCache, descCache (JSON: {UA, EN, PL})
├── category: Programming | Databases | ...
├── status: Draft | Published
├── parent → Topic (ієрархія)
├── children[] → Topic[]
├── materials[] → Material[]
└── quizzes[] → Quiz[]

Material
├── id, title, type: pdf | video | link | text
├── titleCache, contentCache, urlJson (JSON)
├── status: Draft | Published
├── file → File
└── topic → Topic

Quiz
├── id, title, durationSec
├── titleCache (JSON)
├── status: Draft | Published
├── questions[] → Question[]
└── topic → Topic

Question
├── id, text, explanation
├── textJson, explanationJson (JSON)
├── difficulty: Easy | Medium | Hard
└── options[] → Option[]

File
├── id, key, bucket, originalName
├── mimeType, size, visibility
└── confirmed
```

## 🔒 Безпека

| Функція | Реалізація |
|---------|------------|
| Автентифікація | JWT Access + Refresh токени |
| CSRF захист | Double submit cookie pattern |
| XSS захист | HTTP-only cookies, DOMPurify |
| Rate limiting | Express Rate Limit |
| Валідація | Zod schemas |
| Security headers | Helmet middleware |
| RBAC | STUDENT/EDITOR/ADMIN ролі |
| Audit logging | Логування операцій |

## 🌍 Мультимовна система

Платформа підтримує 3 мови: 🇺🇦 Українська, 🇵🇱 Польська, 🇬🇧 English

### JSON Cache підхід

Локалізований контент зберігається в JSON полях для швидкого доступу:

```json
{
  "titleCache": { "UA": "Основи програмування", "EN": "Programming Basics", "PL": "Podstawy programowania" },
  "contentCache": { "UA": "...", "EN": "...", "PL": "..." },
  "urlJson": { "UA": "file-ua.pdf", "EN": "file-en.pdf", "PL": "file-pl.pdf" }
}
```

### Переваги

- ✅ O(1) доступ до локалізованих даних
- ✅ Немає JOIN при запитах
- ✅ Різний контент/URL для кожної мови
- ✅ Легке додавання нових мов
- ✅ Fallback: lang → EN → перша наявна

## 🧪 Тестування

```bash
# Backend
cd elearn-backend
npm run test              # Всі тести
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage звіт

# Frontend
cd elearn-front
npm run test              # Всі тести
```

## 📝 API Endpoints

### Auth
- `GET /api/auth/csrf` — CSRF токен
- `POST /api/auth/register` — Реєстрація
- `POST /api/auth/login` — Вхід
- `POST /api/auth/refresh` — Оновлення токена
- `POST /api/auth/logout` — Вихід

### Content
- `GET /api/topics` — Дерево тем
- `GET /api/topics/:slug` — Деталі теми
- `GET /api/lessons/:slug` — Урок з матеріалами
- `GET /api/quiz/:id` — Квіз
- `POST /api/quiz/:id/submit` — Відправка відповідей

### Progress
- `GET /api/progress` — Прогрес користувача
- `POST /api/progress/view/:materialId` — Позначити переглянутим
- `GET /api/dashboard` — Dashboard дані

### Admin
- `GET /api/admin/stats` — Статистика системи
- `GET /api/admin/users` — Список користувачів
- `GET /api/admin/audit-logs` — Журнал аудиту

### Files
- `POST /api/files/presign-upload` — Presigned URL
- `POST /api/files/confirm` — Підтвердження

## 🚀 Deployment

### Frontend (Cloudflare Pages)

```bash
cd elearn-front
npm run build
npm run deploy
```

### Backend

```bash
cd elearn-backend
npm run build
npm start
```

## 📄 Ліцензія

MIT License

---

⚠️ **ВАЖЛИВО**: Ніколи не запускайте `npm run db:reset:confirm` на production!

Перед демонстрацією:
```bash
cd elearn-backend
npm run db:status    # Перевірити стан
npm run db:publish   # Опублікувати Draft записи
```
