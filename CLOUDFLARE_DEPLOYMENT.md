# 🚀 Deployment Guide - Cloudflare Pages

## Налаштування для Cloudflare Pages

### 1️⃣ Build Configuration

**Framework preset**: `Vite`  
**Build command**: `cd Web-e-learning && npm run build:production`  
**Build output directory**: `Web-e-learning/dist`  
**Root directory**: `/`

### 2️⃣ Environment Variables

Додайте в Cloudflare Pages Settings → Environment variables:

```
VITE_API_URL=https://your-backend-api.com
```

### 3️⃣ Node.js Version

Переконайтеся що Node.js >= 20.0.0:

Settings → Environment variables → Add variable:
- Name: `NODE_VERSION`
- Value: `20`

### 4️⃣ Монорепо конфігурація

Cloudflare Pages автоматично виявить monorepo структуру. Проект налаштований для білда тільки frontend частини без тестів.

## Виключені з білда

- ✅ Тестові файли (`__tests__/`, `*.test.ts`, `*.test.tsx`)
- ✅ Backend код (`elearn-backend/`)
- ✅ Shared packages (будуть зібрані автоматично як залежності)
- ✅ Конфігураційні файли розробки

## Локальна перевірка перед деплоєм

```bash
# Білд без тестів (як на Cloudflare)
cd Web-e-learning
npm run build:production

# Попередній перегляд
npm run preview
```

## Troubleshooting

### Помилка: TypeScript не знаходить типи

**Рішення**: Перевірте що `tsconfig.json` виключає тести:
```json
"exclude": [
  "node_modules",
  "dist",
  "**/__tests__/**",
  "**/*.test.ts",
  "**/*.test.tsx"
]
```

### Помилка: Залежність не знайдена

**Рішення**: Cloudflare Pages автоматично встановлює залежності. Переконайтеся що `@elearn/shared` правильно налаштований в workspaces.

### Помилка: Build timeout

**Рішення**: Збільшіть timeout в Settings або оптимізуйте білд:
- Виключіть непотрібні залежності
- Використайте `build:production` замість `build`

## Custom Domains

Після успішного деплою:
1. Settings → Custom domains
2. Додайте свій домен
3. Cloudflare автоматично налаштує SSL

## Continuous Deployment

Cloudflare Pages автоматично:
- ✅ Білдить кожен push в `master`
- ✅ Створює preview для PR
- ✅ Кешує node_modules
- ✅ Генерує унікальні URL для кожного білда
