# ✅ Чек-лист: Локалізація Матеріалів

## 🎯 Перевірка Системи (Для Адміністратора)

### Крок 1️⃣: Перевірити вікладки мов в Редакторі

- [ ] Знайти вмикач мов в `Editor → Materials`
- [ ] Вкладки: `[🇺🇦 UA] [🇬🇧 EN] [🇵🇱 PL]` видимі
- [ ] При кліку на кожну вкладку інпути змінюються
- [ ] Переключення між мовами не втрачає дані

### Крок 2️⃣: Редагувати матеріал з локалізацією

```
1. Натисніть Edit на будь-якому матеріалі
2. Заповніть для мови UA:
   - Заголовок: "Бінарний пошук"
   - Посилання: "https://youtu.be/ua_video_id"
3. Перейдіть на EN tab
4. Заповніть:
   - Заголовок: "Binary Search"
   - Посилання: "https://youtu.be/en_video_id"
5. Натисніть [Save Material]
```

✅ **Очікуваний результат:**
- Матеріал зберігається без помилок
- Toast повідомлення: "Material updated"
- titleCache містить обидві мови
- urlCache містить обидва посилання

### Крок 3️⃣: Перевірити API відповідь

```bash
# Отримати матеріалу в адміні
GET /api/editor/topics/:topicId/materials

# В відповіді повинні бути:
{
  "id": "mat_xxx",
  "titleCache": {
    "UA": "Бінарний пошук",
    "EN": "Binary Search",
    "PL": "..." (якщо заповнено)
  },
  "urlCache": {
    "UA": "https://youtu.be/ua_video_id",
    "EN": "https://youtu.be/en_video_id",
    "PL": "..." (якщо заповнено)
  }
}
```

### Крок 4️⃣: Перевірити студентський вигляд

**Від estudienta з UA мовою:**
1. Зайти на Materials
2. Відкрити матеріал
3. Відео повинно бути в UA версії
4. Виключити DevTools:
   ```javascript
   // Console tab
   const url = document.querySelector('iframe')?.src
   console.log(url) // Повинен містити UA посилання
   ```

**Поміняти мову на EN:**
1. Зайти в Settings / Language Selector
2. Выбрать "English"
3. Повернутися на матеріал
4. Відео повинна змінитися на EN версію ✅

### Крок 5️⃣: Перевірити fallback логіку

**Сценарій:** Матеріал має UA та EN, але немає PL

1. Студент обирає PL мову
2. Система повинна показати EN версію (fallback)
3. PL вивідся якомусь користувачеві:
   ```javascript
   getMaterialUrl(material, 'PL') // Повинна повернути EN URL
   ```

### Крок 6️⃣: Тестування пусті Caches

**Проблема:** Старі матеріали можуть не мати titleCache

**Рішення:**
1. Відкрити старий матеріал на редагування
2. Просто перейти між вкладками UA/EN
3. Натиснути Save (навіть без змін)
4. Система заповнить порожні кеші з fallback полів

---

## 🧪 Тестування для Розробників

### Unit Tests (Frontend)

```javascript
// Web-e-learning/src/utils/__tests__/materialHelpers.test.ts

describe('getMaterialUrl', () => {
  test('returns user language URL from cache', () => {
    const material = {
      urlCache: {
        UA: 'https://youtu.be/ua_video',
        EN: 'https://youtu.be/en_video'
      }
    }
    
    expect(getMaterialUrl(material, 'UA'))
      .toBe('https://youtu.be/ua_video')
  })
  
  test('falls back to EN when user language not available', () => {
    const material = {
      urlCache: {
        EN: 'https://youtu.be/en_video'
      }
    }
    
    expect(getMaterialUrl(material, 'PL'))
      .toBe('https://youtu.be/en_video')
  })
  
  test('falls back to direct url field when cache empty', () => {
    const material = {
      url: 'https://example.com/default',
      urlCache: null
    }
    
    expect(getMaterialUrl(material, 'UA'))
      .toBe('https://example.com/default')
  })
})
```

### API Tests (Backend)

```bash
# Test 1: Create material
curl -X POST http://localhost:4000/api/editor/topics/topic_001/materials \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Binary Search",
    "type": "video",
    "lang": "EN"
  }'

# Test 2: Update with multi-language
curl -X PUT http://localhost:4000/api/editor/topics/topic_001/materials/mat_001/translations \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "titleUA": "Бінарний пошук",
    "titleEN": "Binary Search",
    "urlUA": "https://youtu.be/ua_video",
    "urlEN": "https://youtu.be/en_video",
    "type": "video"
  }'

# Expected response:
# {
#   "id": "mat_001",
#   "titleCache": {"UA": "Бінарний пошук", "EN": "Binary Search"},
#   "urlCache": {"UA": "https://youtu.be/ua_video", "EN": "https://youtu.be/en_video"}
# }
```

### E2E Tests (Playwright / Cypress)

```javascript
// E2E: Admin creates material with 3 languages
test('Admin creates multi-language material', async ({ page }) => {
  // 1. Login as admin
  await page.goto('/login')
  await page.fill('input[name=email]', 'admin@example.com')
  await page.fill('input[name=password]', 'admin123')
  await page.click('button:has-text("Login")')
  
  // 2. Go to Editor
  await page.goto('/admin/editor')
  
  // 3. Select topic
  await page.selectOption('select', 'algorithms')
  
  // 4. Fill material data for UA
  await page.click('text=🇺🇦 UA')
  await page.fill('input[placeholder*="Заголовок"]', 'Бінарний пошук')
  await page.fill('input[placeholder*="посилання"]', 'https://youtu.be/ua_video')
  
  // 5. Switch to EN
  await page.click('text=🇬🇧 EN')
  await page.fill('input[placeholder*="Title"]', 'Binary Search')
  await page.fill('input[placeholder*="URL"]', 'https://youtu.be/en_video')
  
  // 6. Save
  await page.click('button:has-text("Save Material")')
  await page.waitForSelector('text=Material updated')
  
  // 7. Verify in API
  const response = await page.request.get(
    '/api/editor/topics/algorithms/materials'
  )
  const materials = await response.json()
  const material = materials.find(m => m.title === 'Binary Search')
  
  expect(material.titleCache.UA).toBe('Бінарний пошук')
  expect(material.titleCache.EN).toBe('Binary Search')
  expect(material.urlCache.UA).toBe('https://youtu.be/ua_video')
  expect(material.urlCache.EN).toBe('https://youtu.be/en_video')
})

// E2E: Student sees correct language
test('Student sees localized material', async ({ page, context }) => {
  // 1. Set browser language to UA
  const uaBrowser = await context.browser()
  const uaContext = await uaBrowser.newContext({
    locale: 'uk-UA'
  })
  const uaPage = await uaContext.newPage()
  
  // 2. Go to materials
  await uaPage.goto('/materials/algorithms/sorting')
  
  // 3. Click on binary search material
  await uaPage.click('text=Бінарний пошук') // Should show UA title
  
  // 4. Verify video URL
  const iframe = uaPage.locator('iframe')
  const src = await iframe.getAttribute('src')
  expect(src).toContain('ua_video')
  
  // 5. Switch to EN language
  await uaPage.click('button:has-text("🌐")')
  await uaPage.click('text=English')
  
  // 6. Navigate back to material
  await uaPage.goto('/materials/algorithms/sorting')
  await uaPage.click('text=Binary Search') // Should show EN title now
  
  // 7. Verify video changed to EN
  const newIframe = uaPage.locator('iframe')
  const newSrc = await newIframe.getAttribute('src')
  expect(newSrc).toContain('en_video')
})
```

---

## 🔍 Перевірка в DevTools

### 1. Перевірити titleCache структуру

```javascript
// В консолі студентської сторінки:
fetch('/api/topics?lang=UA')
  .then(r => r.json())
  .then(data => {
    const firstMaterial = data.data[0].materials[0]
    console.log('Material:', firstMaterial)
    console.log('Title cache:', firstMaterial.titleCache)
    console.log('URL cache:', firstMaterial.urlCache)
  })

// Очікуваний результат:
// Material: {id: "mat_001", title: "Binary Search", titleCache: {...}, urlCache: {...}, ...}
// Title cache: {UA: "Бінарний пошук", EN: "Binary Search", PL: "Wyszukiwanie binarne"}
// URL cache: {UA: "https://youtu.be/ua", EN: "https://youtu.be/en", PL: "https://youtu.be/pl"}
```

### 2. Перевірити функцію getLocalizedContent

```javascript
// Імпортуйте функцію (якщо можна у консолі)
import { getLocalizedContent } from '@/utils/materialHelpers'

const material = {
  title: "Binary Search",
  titleCache: {UA: "Бінарний пошук", EN: "Binary Search"},
  url: "https://youtu.be/en_default",
  urlCache: {UA: "https://youtu.be/ua", EN: "https://youtu.be/en"}
}

// Тест для UA
console.log(getLocalizedContent(material, 'UA'))
// {url: "https://youtu.be/ua", title: "Бінарний пошук", ...}

// Тест для PL (fallback на EN)
console.log(getLocalizedContent(material, 'PL'))
// {url: "https://youtu.be/en", title: "Binary Search", ...}
```

### 3. Перевірити useTranslation hook

```javascript
// В компоненті React:
const { lang } = useTranslation()
console.log('Current language:', lang) // 'UA', 'EN', or 'PL'

// Коли змінюєте мову:
// - lang має оновитися
// - Компоненти мають перерендеритися
// - Material URL має змінитися
```

---

## 📋 Чек-лист для Production Deployment

### Pre-Deployment

- [ ] Усі матеріали мають titleCache заповнене
- [ ] EN версія є обов'язковою фолбек (перевірити)
- [ ] Не має порожніх urlCache або titleCache для опублікованих матеріалів
- [ ] TypeScript компіліруется без помилок
- [ ] Frontend build проходить
- [ ] Усі тести проходять

### Post-Deployment

- [ ] API повертає правильні localized дані
- [ ] Студенти бачать матеріали своєю мовою
- [ ] Fallback працює для недовніх локалізацій
- [ ] Зміна мови автоматично оновлює контент
- [ ] Старі матеріали без кешу відображаються (fallback)

---

## 🐛 Troubleshooting

### Проблема: "titleCache is undefined"

**Причина:** Матеріал створений до впровадження системи

**Рішення:**
```javascript
// В редакторі відкрийте старий матеріал
// Просто натисніть Save без змін
// Система заповнить кеш з існуючих полів
```

### Проблема: "Video не грається на правильній мові"

**Перевірити:**
1. titleCache містить дані?
   ```bash
   SELECT id, title, "titleCache" FROM "Material" WHERE id = 'mat_001'
   ```
2. useTranslation() повертає правильну мову?
   ```javascript
   console.log(lang) // UA? EN? PL?
   ```
3. getMaterialUrl() повертає правильний URL?
   ```javascript
   console.log(getLocalizedContent(material, lang))
   ```

### Проблема: "Форма не ловить текст при переключенні вкладок"

**Причина:** Инпути не синхронізовані

**Рішення:** Перевірити MaterialsTab.tsx:
```typescript
const value = form[`title${activeLanguage}`]
// Имя динамического ключе завтра бути правилним!
// titleUA, titleEN, titlePL - все мають бути в form state
```

---

## 📊 Метрики для Моніторингу

### Що відслідковувати?

1. **Заповненість Кешів**
   ```sql
   SELECT 
     COUNT(*) as total,
     COUNT("titleCache") as with_title_cache,
     COUNT("urlCache") as with_url_cache
   FROM "Material"
   ```

2. **Статус Локалізації**
   ```sql
   SELECT 
     id, title, 
     "titleCache" ->> 'UA' as ua_title,
     "titleCache" ->> 'EN' as en_title,
     status
   FROM "Material"
   WHERE "titleCache" IS NOT NULL
   LIMIT 10
   ```

3. **Fallback Usage**
   - Скільки запитів повернули fallback значення (url vs urlCache)
   - Скільки матеріалів немають повної локалізації

---

## 🎓 Для Нових Розробників

### Огляд Систем

1. **Database Layer**: `schema.prisma`
   - JSON кеші для швидкого читання
   - Fallback поля (title, url, content) для EN

2. **Service Layer**: `translation.service.ts`
   - Синхронізація між нормалізованою та кеш-версіею

3. **API Layer**: `editor.ts`
   - `PUT /translations` приймає flat структуру (titleUA, titleEN, ...)
   - Конвертує в JSON об'єкти для кешування

4. **Frontend Helper**: `materialHelpers.ts`
   - `getLocalizedContent()` - main function
   - `getMaterialUrl()`, `getMaterialTitle()`, etc - specific getters

5. **UI Components**:
   - `MaterialsTab.tsx` - Editor з вкладками мов
   - `LessonView.tsx` - Student view з локалізацією

### Як додати нову мову?

1. Додати в `Lang` enum (schema.prisma):
   ```prisma
   enum Lang {
     UA
     EN
     PL
     FR  // ← NEW
   }
   ```

2. Оновити `getMaterialUrl` fallback:
   ```typescript
   // Додати FR у fallback ланцюжок
   if (cache['FR']) return cache['FR']
   ```

3. Оновити UI (MaterialsTab.tsx):
   ```tsx
   {(['UA', 'EN', 'PL', 'FR'] as const).map(lang => ...)}
   ```

---

## ✨ Заключення

Система локалізації **ГОТОВА ДО PRODUCTION**:

✅ Database: JSON кеші для швидкого читання  
✅ Backend API: Приймає мультимовні дані  
✅ Frontend Admin: Вкладки для редагування кожної мови  
✅ Frontend Student: Автоматичне відображення правильної мови  
✅ Fallback logic: EN як універсальний фолбек  
✅ Backward compatibility: Стариії матеріалі без кешу все ще работают  

**Status: ✅ READY TO USE**
