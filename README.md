# E-Learn Monorepo

Платформа електронного навчання з React frontend та Express backend.

## 📁 Структура проекту

```
elearn-monorepo/
├── packages/
│   └── shared/           # Спільні типи та утиліти
├── elearn-backend/       # Express + Prisma API
├── Web-e-learning/       # React + Vite Frontend
├── package.json          # Кореневий package.json з workspaces
└── tsconfig.json         # Кореневий TypeScript config
```

## 🚀 Швидкий старт

### Встановлення залежностей

```bash
# З кореневої папки - встановить залежності для всіх пакетів
npm install
```

### Збірка shared пакету

```bash
# Спочатку зберіть shared пакет
npm run build -w @elearn/shared
```

### Запуск розробки

```bash
# Запустити backend
npm run dev:backend

# Запустити frontend (в іншому терміналі)
npm run dev:frontend

# Або запустити обидва одночасно
npm run dev
```

### База даних

```bash
# Генерація Prisma клієнта
npm run prisma:generate

# Запуск міграцій
npm run prisma:migrate

# Заповнення тестовими даними
npm run db:seed
```

## 📦 Workspaces

| Пакет | Опис |
|-------|------|
| `@elearn/shared` | Спільні TypeScript типи |
| `elearn-backend` | Express API сервер |
| `Web-e-learning` | React SPA клієнт |

## 🔧 Скрипти

| Команда | Опис |
|---------|------|
| `npm run dev` | Запуск всіх сервісів в dev режимі |
| `npm run dev:backend` | Запуск тільки backend |
| `npm run dev:frontend` | Запуск тільки frontend |
| `npm run build` | Збірка всіх пакетів |
| `npm run test` | Запуск тестів |
| `npm run clean` | Очищення node_modules |

## 🔗 Використання shared типів

```typescript
// В будь-якому пакеті
import { User, Quiz, TopicTree } from '@elearn/shared'
```

## 📝 Змінні середовища

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

НІКОЛИ не запускай npm run db:reset:confirm або npm run seed:unsafe якщо хочеш зберегти дані!

Перед захистом запусти:
cd elearn-backend
npm run db:status    # Перевір що все OK
npm run db:publish   # Опублікуй всі Draft записи