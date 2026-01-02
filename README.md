# 🎓 E-Learn Platform

> Сучасна платформа електронного навчання з підтримкою багатомовності, адмін-панеллю та системою управління контентом.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

## 🌟 Основні можливості

### 👨‍🎓 Для студентів
- 📚 **Структурований навчальний контент** - теми з матеріалами (PDF, відео, текст, посилання)
- 🎯 **Інтерактивні квізи** - практичні та екзаменаційні режими з миттєвим зворотнім зв'язком
- 🏆 **Система прогресу** - XP, рівні, streak, досягнення
- 📊 **Персональна статистика** - відстеження прогресу, слабких місць, активності
- 🌍 **Багатомовність** - UA, PL, EN (динамічне перемикання без перезавантаження)
- 📱 **Адаптивний дизайн** - зручний на всіх пристроях

### 👨‍💼 Для редакторів контенту
- ✏️ **Вбудований редактор** - створення та редагування тем, матеріалів, квізів
- 🌐 **Управління перекладами** - підтримка контенту трьома мовами
- 📤 **Завантаження файлів** - PDF, відео з валідацією та оптимізацією
- 🔄 **Контроль статусу** - Draft/Published для поетапної публікації
- 🎨 **Категорії** - організація контенту за тематиками

### 👨‍💻 Для адміністраторів
- 👥 **Управління користувачами** - ролі (STUDENT, EDITOR, ADMIN), верифікація email
- 📈 **Детальна аналітика** - статистика системи, активність користувачів
- 🗂️ **Управління файлами** - перегляд, видалення завантажень
- 📝 **Журнал аудиту** - логування всіх важливих операцій
- 🔐 **Безпека** - CSRF захист, rate limiting, роль-based доступ
- 🌐 **i18n система** - управління перекладами через UI

## 🏗️ Архітектура

```
elearn-platform/
├── packages/
│   └── shared/              # Спільні TypeScript типи і інтерфейси
│       ├── src/types/       # API контракти, моделі даних
│       └── package.json
│
├── elearn-backend/          # Express + Prisma API сервер
│   ├── src/
│   │   ├── routes/          # API endpoints (auth, admin, content, i18n)
│   │   ├── middleware/      # Auth, CSRF, validation, sanitization
│   │   ├── services/        # Бізнес-логіка (audit, email, storage)
│   │   ├── prisma/          # Schema, migrations, seeds
│   │   └── __tests__/       # Unit та integration тести
│   └── scripts/             # DB утиліти, міграції даних
│
├── Web-e-learning/          # React + Vite SPA
│   ├── src/
│   │   ├── pages/           # Сторінки додатку
│   │   │   ├── admin/       # Адмін-панель (users, content, audit)
│   │   │   └── editor/      # Редактор контенту
│   │   ├── components/      # Перевикористовувані UI компоненти
│   │   ├── hooks/           # Custom React hooks
│   │   ├── auth/            # Контекст автентифікації
│   │   ├── i18n/            # Система інтернаціоналізації
│   │   ├── store/           # Zustand стейт менеджмент
│   │   └── __tests__/       # Frontend тести
│   └── vite.config.ts
│
└── package.json             # Monorepo root (workspaces)
```

## 🛠️ Технологічний стек

### Frontend
- **React 18.2** - UI бібліотека
- **TypeScript 5.6** - Type safety
- **Vite 7.1** - Швидкий build tool
- **React Router 6** - Client-side routing
- **Zustand** - Легкий state management
- **Tailwind CSS 4** - Utility-first CSS
- **Lucide React** - Іконки

### Backend
- **Node.js 20+** - Runtime
- **Express 4.19** - Web framework
- **TypeScript 5.6** - Type safety
- **Prisma 5.19** - ORM
- **PostgreSQL 16** - База даних
- **JWT** - Автентифікація
- **Zod** - Runtime validation
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS захист

### DevOps & Tools
- **Vitest** - Unit тестування
- **npm workspaces** - Monorepo менеджмент
- **tsx** - TypeScript execution
- **AWS S3** - File storage (опціонально)
- **Stripe** - Payments (опціонально)

## 🚀 Швидкий старт

### Вимоги

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 16.0
- **npm** >= 10.0.0

### 1️⃣ Встановлення

```bash
# Клонувати репозиторій
git clone https://github.com/SRXPAN/Web-IT-learning.git
cd Web-IT-learning

# Встановити всі залежності (monorepo)
npm install
```

### 2️⃣ Налаштування бази даних

```bash
# Створити базу даних PostgreSQL
createdb elearn_db

# Налаштувати .env файл
cd elearn-backend
cp .env.example .env
# Відредагувати DATABASE_URL та інші змінні

# Запустити міграції
npm run prisma:migrate

# Заповнити початковими даними
npm run db:seed
```

### 3️⃣ Налаштування frontend

```bash
cd ../Web-e-learning
cp .env.example .env
# Вказати VITE_API_URL=http://localhost:3000
```

### 4️⃣ Запуск

```bash
# З кореневої папки - запустити backend і frontend одночасно
npm run dev

# Або окремо:
npm run dev:backend   # Backend на http://localhost:3000
npm run dev:frontend  # Frontend на http://localhost:5173
```

### 5️⃣ Тестові облікові записи

```
Admin:
  Email: admin@example.com
  Password: Admin123!

Editor:
  Email: editor@example.com
  Password: Editor123!

Student:
  Email: student@example.com
  Password: Student123!
```

## 📦 Доступні скрипти

### Кореневі команди

```bash
npm run dev              # Запуск всіх сервісів
npm run dev:backend      # Тільки backend
npm run dev:frontend     # Тільки frontend
npm run build            # Збірка всіх пакетів
npm run test             # Запуск тестів
npm run clean            # Очистити node_modules
```

### Backend команди

```bash
cd elearn-backend

# Розробка
npm run dev              # Watch mode
npm run build            # Production build
npm start                # Запуск production

# База даних
npm run prisma:generate  # Генерація Prisma client
npm run prisma:migrate   # Нова міграція
npm run db:seed          # Seed даних
npm run db:status        # Перевірка стану БД
npm run db:publish       # Опублікувати Draft записи

# i18n
npm run i18n:seed        # Seed перекладів
npm run i18n:check       # Перевірка ключів

# Тестування
npm run test             # Запуск тестів
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage звіт
```

### Frontend команди

```bash
cd Web-e-learning

npm run dev              # Dev server
npm run build            # Production build
npm run preview          # Preview build
npm run test             # Запуск тестів
npm run lint             # TypeScript перевірка
```

## 🔐 Безпека

- ✅ **JWT автентифікація** - Access + Refresh токени
- ✅ **CSRF захист** - Double submit cookie pattern
- ✅ **HTTP-only cookies** - XSS захист
- ✅ **Rate limiting** - Захист від brute force
- ✅ **Input validation** - Zod schema validation
- ✅ **Input sanitization** - XSS фільтрація
- ✅ **Role-based access** - STUDENT/EDITOR/ADMIN ролі
- ✅ **Security headers** - Helmet middleware
- ✅ **Audit logging** - Логування критичних операцій

## 🌍 Інтернаціоналізація (i18n)

Система підтримує **3 мови**: 🇺🇦 Українська, 🇵🇱 Польська, 🇬🇧 Англійська

### Особливості

- 📥 **Динамічне завантаження** - Bundle завантажується з API
- 🔄 **Гаряче перемикання** - Без перезавантаження сторінки
- 🗄️ **Нормалізована БД** - Централізоване управління перекладами
- 🎯 **Fallback механізм** - Автоматичний fallback на default ключ
- 🔧 **Admin UI** - Управління перекладами через веб-інтерфейс

### Використання

```typescript
import { useTranslation } from '@/i18n/useTranslation'

function MyComponent() {
  const { t, lang, setLang } = useTranslation()
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <button onClick={() => setLang('UA')}>UA</button>
    </div>
  )
}
```

## 📂 Модель даних

### Основні сутності

- **User** - Користувачі (role, xp, streak)
- **Topic** - Теми (ієрархічні з перекладами)
- **Material** - Навчальні матеріали (PDF, video, text, link)
- **Quiz** - Вікторини (з питаннями та опціями)
- **Progress** - Прогрес користувача по темам
- **AuditLog** - Журнал аудиту операцій
- **File** - Завантажені файли (з метаданими)
- **TranslationKey** - Ключі перекладів
- **TranslationValue** - Значення перекладів (normalized)

## 🧪 Тестування

```bash
# Backend тести
cd elearn-backend
npm run test              # Запуск всіх тестів
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage звіт

# Frontend тести
cd Web-e-learning
npm run test              # Запуск тестів
npm run test:ui           # UI mode
```

## 📈 Roadmap

- [ ] WebSocket для real-time статистики
- [ ] Система сертифікатів
- [ ] Gamification розширення
- [ ] Mobile додаток (React Native)
- [ ] AI-асистент для навчання
- [ ] Інтеграція з LMS системами
- [ ] Розширена аналітика з графіками
- [ ] Соціальні функції (коментарі, обговорення)

## 🤝 Contribution

Contributions are welcome! Будь ласка, створіть issue перед великими змінами.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) для деталей

## 📧 Контакти

**Author**: SRXPAN  
**GitHub**: [@SRXPAN](https://github.com/SRXPAN)  
**Repository**: [Web-IT-learning](https://github.com/SRXPAN/Web-IT-learning)

---

⚠️ **ВАЖЛИВО**: Ніколи не запускайте `npm run db:reset:confirm` на production!

Перед демонстрацією/захистом:
```bash
cd elearn-backend
npm run db:status    # Перевірити стан системи
npm run db:publish   # Опублікувати всі Draft записи
```