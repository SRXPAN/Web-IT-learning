# 🌍 Гайд по Системі Локалізації Матеріалів

## 📋 Огляд Системи

Ця система дозволяє адміністраторам створювати **мультимовні матеріали** з окремими посиланнями на відео, PDF та контент для кожної мови:
- 🇺🇦 **Українська (UA)**
- 🇬🇧 **Англійська (EN)**
- 🇵🇱 **Польська (PL)**

### Приклад: Навіщо це потрібно?

| Мова | Матеріал | URL |
|------|----------|-----|
| 🇺🇦 UA | "Сортування массивів" | https://youtu.be/UA-video |
| 🇬🇧 EN | "Array Sorting" | https://youtu.be/EN-video |
| 🇵🇱 PL | "Sortowanie tablic" | https://youtu.be/PL-video |

Студент обирає мову → система автоматично показує правильне відео!

---

## 🗄️ Архітектура Бази Даних

### Material Model (schema.prisma)

```prisma
model Material {
  // Fallback поля (EN - за замовчуванням)
  title       String          // Основний título (EN)
  url         String?         // Основне посилання (EN)
  content     String?         // Основний контент (EN)

  // 🆕 Мультимовні JSON кеши (read-optimized)
  titleCache   Json?          // {"UA": "...", "EN": "...", "PL": "..."}
  urlCache     Json?          // {"UA": "http://...", "EN": "http://...", "PL": "http://..."}
  contentCache Json?          // {"UA": "# Привіт", "EN": "# Hello", "PL": "# Cześć"}
  
  // Інші поля...
  type        MaterialType    // pdf, video, link, text
  topicId     String
  lang        Lang            // Первинна мова матеріалу
  status      Status          // Draft, Published
}
```

**Чому JSON кеші?**
- ✅ Немає складних JOIN-ів
- ✅ Швидко читати (одна відбірка)
- ✅ Досить гнучко (не зафіксована схема)
- ✅ Native PostgreSQL JSON support

---

## 🛠️ Backend API

### 1️⃣ Отримати матеріали (GET)

```bash
GET /api/editor/topics/:topicId/materials
Authorization: Bearer <token>
```

**Відповідь:**
```json
{
  "id": "mat_001",
  "title": "Binary Search",
  "titleCache": {
    "UA": "Бінарний пошук",
    "EN": "Binary Search",
    "PL": "Wyszukiwanie binarne"
  },
  "url": "https://example.com/default",
  "urlCache": {
    "UA": "https://youtu.be/UA_video",
    "EN": "https://youtu.be/EN_video",
    "PL": "https://youtu.be/PL_video"
  },
  "type": "video",
  "status": "Published"
}
```

### 2️⃣ Оновити матеріал (PUT) - Мультимовна версія

```bash
PUT /api/editor/topics/:topicId/materials/:id/translations
Authorization: Bearer <token>
Content-Type: application/json
```

**Тіло запиту:**
```json
{
  "titleUA": "Бінарний пошук",
  "titleEN": "Binary Search",
  "titlePL": "Wyszukiwanie binarne",
  
  "urlUA": "https://youtu.be/UA_video_id",
  "urlEN": "https://youtu.be/EN_video_id",
  "urlPL": "https://youtu.be/PL_video_id",
  
  "contentUA": "# Алгоритм\n\nВиконується за O(log n)...",
  "contentEN": "# Algorithm\n\nRuns in O(log n)...",
  "contentPL": "# Algorytm\n\nDziała w O(log n)...",
  
  "type": "video",
  "publish": true
}
```

**Логіка обробки в backend:**

```typescript
// elearn-backend/src/routes/editor.ts (line ~170)
async function handlePutTranslations(req, res) {
  // 1. Parse multi-language data from request
  const translations = {
    titleUA: req.body.titleUA,
    titleEN: req.body.titleEN,
    // ... etc
  }

  // 2. Call service to update caches
  await updateMaterialMultiLang(materialId, translations)
  
  // 3. Service builds JSON objects:
  const titleCache = {
    UA: req.body.titleUA,
    EN: req.body.titleEN,
    PL: req.body.titlePL
  }
  
  // 4. Store in database:
  await prisma.material.update({
    where: { id: materialId },
    data: {
      titleCache,
      urlCache,
      contentCache
    }
  })
  
  return material
}
```

---

## 🎨 Frontend - Редагування (Admin)

### MaterialsTab.tsx - Редактор з вкладками

**Вкладки для мов:**
```
┌─────────────┬─────────────┬─────────────┐
│  🇺🇦 UA     │  🇬🇧 EN     │  🇵🇱 PL     │
└─────────────┴─────────────┴─────────────┘
```

**UI Компоненти:**

```tsx
// 1. Language tabs (line ~165)
<div className="flex gap-2 border-b-2 border-gray-200">
  {(['UA', 'EN', 'PL'] as const).map(lang => (
    <button
      onClick={() => setActiveLanguage(lang)}
      className={activeLanguage === lang ? 'text-primary-500 border-b-primary-500' : ''}
    >
      {lang}
    </button>
  ))}
</div>

// 2. Form inputs dynamically change based on activeLanguage
<input 
  value={form[`title${activeLanguage}`]}
  onChange={e => setForm(s => ({ ...s, [`title${activeLanguage}`]: e.target.value }))}
/>

// 3. Save button sends all languages at once
async function save() {
  const payload = {
    titleUA: form.titleUA,
    titleEN: form.titleEN,
    titlePL: form.titlePL,
    urlUA: form.urlUA,
    // ... etc
  }
  
  await fetch(`/api/editor/topics/${topicId}/materials/${id}/translations`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}
```

**Форма для редагування:**

```
┌─────────────────────────────────────┐
│ Тип матеріалу: [Видео      ▼]       │
├─────────────────────────────────────┤
│ [ 🇺🇦 UA ]  [ 🇬🇧 EN ]  [ 🇵🇱 PL ] │
├─────────────────────────────────────┤
│ Заголовок (Українська)              │
│ [Бінарний пошук               ]     │
├─────────────────────────────────────┤
│ Посилання на відео (Українська)     │
│ [https://youtu.be/UA_video   ]     │
├─────────────────────────────────────┤
│ [Save Material]  [Cancel]           │
└─────────────────────────────────────┘
```

### Логіка редактування

```typescript
// MaterialsTab.tsx (line ~65)
function startEdit(material: Material) {
  setEditingId(material.id)
  
  // Load all language variants from cache
  setForm({
    titleUA: (material.titleCache?.UA as string) || material.title,
    titleEN: (material.titleCache?.EN as string) || material.title,
    titlePL: (material.titleCache?.PL as string) || material.title,
    urlUA: (material.urlCache?.UA as string) || material.url,
    urlEN: (material.urlCache?.EN as string) || material.url,
    urlPL: (material.urlCache?.PL as string) || material.url,
    // ... etc
  })
}
```

---

## 👨‍🎓 Frontend - Студент (LessonView)

### Як студент бачить локалізований контент

```typescript
// Web-e-learning/src/pages/LessonView.tsx (line ~460)

// 1. Get current language from hook
const { lang } = useTranslation() // 'UA', 'EN', or 'PL'

// 2. Use helper function to get localized content
const localizedUrl = getLocalizedContent(lesson, lang).url

// 3. Show correct video
<iframe
  src={videoUrl.replace('watch?v=', 'embed/')}
  // Буде播放UA, EN або PL відео в залежності від lang!
/>
```

### Helper функція (materialHelpers.ts)

```typescript
export function getLocalizedContent(material, userLang) {
  return {
    url: getMaterialUrl(material, userLang),
    title: getMaterialTitle(material, userLang),
    content: getMaterialContent(material, userLang)
  }
}

export function getMaterialUrl(material, userLang) {
  // Fallback priority:
  // 1. User's language (UA, EN, PL)
  // 2. English (EN) - как универсальный фолбек
  // 3. Первый доступный URL из кеша
  // 4. Старое поле url (backwards compatibility)
  
  if (material.urlCache?.[userLang]) {
    return material.urlCache[userLang]
  }
  if (material.urlCache?.EN) {
    return material.urlCache.EN
  }
  return material.url
}
```

---

## 🔄 Процесс: От Адміна до Студента

### Сценарій: Адмін додає відео на 3 мовах

```
1️⃣ ADMIN CREATES MATERIAL
┌──────────────────────────┐
│編集ページ (MaterialsTab)│
│                          │
│ Title (UA): "Сортування"│
│ URL (UA): youtu.be/ua1   │
│                          │
│ [Switch to EN tab]      │
│                          │
│ Title (EN): "Sorting"    │
│ URL (EN): youtu.be/en1   │
│                          │
│ [Save Material]          │
└──────────────────────────┘
         ⬇️
2️⃣ BACKEND SAVES (editor.ts)
┌──────────────────────────┐
│ PUT /api/editor/.../     │
│   translations           │
│                          │
│ {                        │
│   titleUA: "Сортування"│
│   titleEN: "Sorting",    │
│   urlUA: "youtu.be/ua1", │
│   urlEN: "youtu.be/en1"  │
│ }                        │
└──────────────────────────┘
         ⬇️
3️⃣ SERVICE BUILDS CACHE
┌──────────────────────────┐
│ updateMaterialMultiLang()│
│                          │
│ titleCache = {           │
│   UA: "Сортування",     │
│   EN: "Sorting"         │
│ }                        │
│ urlCache = {            │
│   UA: "youtu.be/ua1",   │
│   EN: "youtu.be/en1"    │
│ }                        │
└──────────────────────────┘
         ⬇️
4️⃣ DATABASE STORES
┌──────────────────────────┐
│ Material {               │
│   id: "mat_001",         │
│   title: "Sorting",      │ ← Fallback (EN)
│   titleCache: {...},     │ ← All languages
│   url: "youtu.be/en1",   │ ← Fallback (EN)
│   urlCache: {...}        │ ← All languages
│ }                        │
└──────────────────────────┘
         ⬇️
5️⃣ STUDENT VIEWS (LessonView)
┌──────────────────────────┐
│ Student picks UA lang    │
│                          │
│ getLocalizedContent(     │
│   material, 'UA'         │
│ )                        │
│                          │
│ Returns:                 │
│ url: "youtu.be/ua1" ✅   │
│                          │
│ [Play Video in UA]       │
└──────────────────────────┘
```

---

## 🧪 Тестування

### Тест 1: Редагування матеріалу (Admin)

```bash
# 1. Admin logs in via UI and goes to Editor
# 2. Click on existing material to edit
# 3. Switch to UA tab, enter "Бінарний пошук"
# 4. Enter UA YouTube link
# 5. Switch to EN tab, enter "Binary Search" + EN link
# 6. Click Save
```

**Очікуваний результат:**
- ✅ Материал зберігається без помилок
- ✅ titleCache містить {UA: "Бінарний пошук", EN: "Binary Search"}
- ✅ urlCache містить {UA: "link_ua", EN: "link_en"}

### Тест 2: Студент бачить локалізовані матеріали

```bash
# 1. Student logs in via UI
# 2. Goes to Materials page
# 3. Opens Lesson with localized material
# 4. Video plays in UA because student's language = UA ✅

# 5. Student changes language to EN in settings
# 6. Refreshes page
# 7. Video automatically changes to EN version ✅
```

**Перевірка в DevTools:**
```javascript
// Check what URL is being used
const videoIframe = document.querySelector('iframe')
console.log(videoIframe.src)
// Expected: YouTube embed URL for current language
```

### Тест 3: Fallback логіка

```bash
# 1. Material має UA та EN переклади
# 2. Student picks PL (польська)
# 3. System falls back to EN (default)
# 4. EN version plays ✅
```

---

## 📊 Структура Даних в API

### Запит до GET /api/topics?lang=UA

```json
{
  "data": [
    {
      "id": "topic_001",
      "slug": "algorithms",
      "title": "Алгоритми",           ← Localized to UA
      "children": [...],
      "materials": [
        {
          "id": "mat_001",
          "type": "video",
          "title": "Бінарний пошук",   ← From titleCache.UA
          "titleCache": {
            "UA": "Бінарний пошук",
            "EN": "Binary Search",
            "PL": "Wyszukiwanie binarne"
          },
          "url": "https://youtu.be/en_default",
          "urlCache": {
            "UA": "https://youtu.be/ua_video",
            "EN": "https://youtu.be/en_video",
            "PL": "https://youtu.be/pl_video"
          },
          "status": "Published"
        }
      ],
      "quizzes": [...]
    }
  ]
}
```

---

## 🐛 Debugging

### Проблема: Відео не грається на потрібній мові

```bash
# 1. Check if material has urlCache:
curl "http://localhost:4000/api/topics/topic_001/materials" \
  -H "Authorization: Bearer token"

# Look for urlCache field
# Should have { "UA": "...", "EN": "..." }

# 2. Check LessonView component
# Console should show:
console.log(getLocalizedContent(lesson, lang))
// { url: "correct_url", title: "correct_title", ... }

# 3. Check that useTranslation() returns correct lang
console.log(lang) // Should be 'UA', 'EN', or 'PL'
```

### Проблема: titleCache пуста

```bash
# Material was created before multi-language system
# Solution: Edit it once with all languages via Admin UI
# This will populate titleCache, urlCache, contentCache

# Or manually update in database:
UPDATE "Material" 
SET "titleCache" = '{"UA": "...", "EN": "..."}'
WHERE id = 'mat_001'
```

---

## 📈 Best Practices

### ✅ Do's

- **Завжди заповняйте EN версію** - це фолбек для всіх студентів
- **Переконайтесь, що URL правильні** - тестуйте кожне посилання перед збереженням
- **Використовуйте одні й ті ж типи матеріалу** - не мішайте PDF та video
- **Перекладайте контент повністю** - неповні переклади зберігаються!

### ❌ Don'ts

- **Не залишайте поля порожними** - система не дозволить зберегти
- **Не змінюйте титульні дані напрямку в БД** - завжди через API
- **Не забувайте публікувати матеріал** - Draft не видно студентам
- **Не вимикайте JS у браузері** - локалізація працює тільки на клієнті

---

## 📞 API Reference

### CRUD Operations

| Operation | Method | Endpoint | Body |
|-----------|--------|----------|------|
| List materials | GET | `/api/editor/topics/:id/materials` | — |
| Create material | POST | `/api/editor/topics/:id/materials` | `{ title, type, lang }` |
| Update material (old) | PUT | `/api/editor/topics/:id/materials/:id` | `{ title, url, ... }` |
| **Update translations** | PUT | `/api/editor/topics/:id/materials/:id/translations` | `{ titleUA, titleEN, ... }` |
| Delete material | DELETE | `/api/editor/topics/:id/materials/:id` | — |

### Helper Functions (Frontend)

```typescript
// Get URL for current language with fallback
getMaterialUrl(material, userLang: 'UA' | 'EN' | 'PL')

// Get all localized fields at once
getLocalizedContent(material, userLang)

// Get title with fallback
getMaterialTitle(material, userLang)

// Get content with fallback
getMaterialContent(material, userLang)
```

---

## 🎓 Приклади

### Приклад 1: Додати англійське відео

```javascript
const response = await fetch(
  `/api/editor/topics/${topicId}/materials/${materialId}/translations`,
  {
    method: 'PUT',
    body: JSON.stringify({
      titleEN: 'Introduction to Algorithms',
      urlEN: 'https://youtu.be/rHrfq5BbpV4',
      type: 'video'
    })
  }
)
```

### Приклад 2: Показати правильне відео студенту

```javascript
// In React component
const { lang } = useTranslation()
const videoUrl = getMaterialUrl(material, lang)

return (
  <iframe
    src={videoUrl.replace('watch?v=', 'embed/')}
  />
)
```

### Приклад 3: Перевірити кеш-дані

```javascript
// In browser console
const material = document.querySelector('[data-material-id]').__data__
console.table(material.titleCache)
// Output:
// UA | Бінарний пошук
// EN | Binary Search
// PL | Wyszukiwanie binarne
```

---

## 📝 Висновок

Система локалізації матеріалів дозволяє:

✅ Адміністраторам легко створювати мультимовні матеріали  
✅ Студентам автоматично бачити контент своєю мовою  
✅ Без складних SQL JOIN-ів завдяки JSON кешам  
✅ З інтелектуальним fallback-ом на EN  
✅ Готово для масштабування

**Похідна повідомлення для користувачів:**

> "При редагуванні матеріалу вибирайте вкладку своєї мови, заповняйте поля та зберігайте. Система автоматично розпізнає і зберігає переклади. Студенти будуть бачити контент своєю мовою 🌍"
