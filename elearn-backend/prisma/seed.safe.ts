// prisma/seed.ts - БЕЗПЕЧНИЙ SEED (не видаляє існуючі дані)
import { PrismaClient, Category } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ===== ФУНКЦІЯ: створити тему якщо не існує =====
async function upsertTopic(slug: string, data: {
  name: string,
  nameJson?: object,
  description: string,
  descJson?: object,
  category: 'Programming' | 'Mathematics' | 'Databases' | 'Networks' | 'WebDevelopment' | 'MobileDevelopment' | 'MachineLearning' | 'Security' | 'DevOps' | 'OperatingSystems',
  parentId?: string | null,
  materials?: Array<{ title: string, type: 'pdf' | 'video' | 'link' | 'text', url?: string, content?: string }>,
  quizzes?: Array<{
    title: string,
    durationSec: number,
    questions: Array<{
      text: string,
      explanation?: string,
      tags: string[],
      difficulty: 'Easy' | 'Medium' | 'Hard',
      options: Array<{ text: string, correct?: boolean }>
    }>
  }>
}) {
  const existing = await prisma.topic.findUnique({ where: { slug } })
  if (existing) {
    console.log(`  ↳ Topic "${slug}" already exists, skipping...`)
    return existing
  }

  const topic = await prisma.topic.create({
    data: {
      slug,
      name: data.name,
      nameJson: data.nameJson,
      description: data.description,
      descJson: data.descJson,
      category: data.category,
      parentId: data.parentId,
      materials: data.materials ? {
        create: data.materials.map(m => ({
          title: m.title,
          type: m.type,
          url: m.url,
          content: m.content,
          status: 'Published',
          publishedAt: new Date()
        }))
      } : undefined,
      quizzes: data.quizzes ? {
        create: data.quizzes.map(q => ({
          title: q.title,
          durationSec: q.durationSec,
          status: 'Published',
          publishedAt: new Date(),
          questions: {
            create: q.questions.map(qu => ({
              text: qu.text,
              explanation: qu.explanation,
              tags: qu.tags,
              difficulty: qu.difficulty,
              options: {
                create: qu.options.map(o => ({
                  text: o.text,
                  correct: o.correct ?? false
                }))
              }
            }))
          }
        }))
      } : undefined,
      status: 'Published',
      publishedAt: new Date()
    }
  })
  console.log(`  ✓ Created topic "${slug}"`)
  return topic
}

// ===== ФУНКЦІЯ: створити переклади якщо не існують =====
async function upsertUiTranslation(key: string, translations: { UA: string, PL: string, EN: string }) {
  const existing = await prisma.uiTranslation.findFirst({ where: { key } })
  if (existing) return existing
  
  return prisma.uiTranslation.create({
    data: { key, translations }
  })
}

async function main() {
  console.log('🌱 Starting SAFE seed (preserves existing data)...\n')

  // ===== 1. Admin user (upsert - не перезаписує пароль) =====
  console.log('👤 Creating admin user...')
  const hash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elearn.local' },
    update: {}, // НЕ оновлювати якщо існує
    create: {
      email: 'admin@elearn.local',
      name: 'Admin',
      password: hash,
      role: 'ADMIN'
    }
  })
  console.log(`  ✓ Admin: ${admin.email}\n`)

  // ===== 2. Demo Topics =====
  console.log('📚 Creating demo topics...')
  
  // Root: Algorithms
  const algorithms = await upsertTopic('algorithms', {
    name: 'Algorithms',
    nameJson: { UA: 'Алгоритми', PL: 'Algorytmy', EN: 'Algorithms' },
    description: 'Sorting and graphs',
    descJson: { UA: 'Сортування та графи', PL: 'Sortowanie i grafy', EN: 'Sorting and graphs' },
    category: 'Programming'
  })

  // Subtopic: Sorting
  await upsertTopic('sorting', {
    name: 'Sorting',
    nameJson: { UA: 'Сортування', PL: 'Sortowanie', EN: 'Sorting' },
    description: 'Quick/Merge/Heap',
    descJson: { UA: 'Quick/Merge/Heap сортування', PL: 'Sortowanie Quick/Merge/Heap', EN: 'Quick/Merge/Heap sorting' },
    category: 'Programming',
    parentId: algorithms.id,
    materials: [
      { title: 'QuickSort – PDF', type: 'pdf', url: 'https://example.com/quicksort.pdf' },
      { title: 'Merge Sort – Video', type: 'video', url: 'https://www.youtube.com/watch?v=Ns7tGNbtvV4' },
      { title: 'Stability of sorting – Article', type: 'link', url: 'https://en.wikipedia.org/wiki/Sorting_algorithm' },
    ],
    quizzes: [{
      title: 'Sorting Basics',
      durationSec: 90,
      questions: [
        {
          text: 'Середня складність QuickSort?',
          explanation: 'QuickSort середньо працює за O(n log n) завдяки поділу масиву.',
          tags: ['Sorting'],
          difficulty: 'Easy',
          options: [
            { text: 'O(n log n)', correct: true },
            { text: 'O(n^2)' },
            { text: 'O(log n)' }
          ]
        },
        {
          text: 'Стабільний алгоритм?',
          explanation: 'MergeSort не змінює порядок рівних елементів.',
          tags: ['Sorting'],
          difficulty: 'Medium',
          options: [
            { text: 'QuickSort' },
            { text: 'MergeSort', correct: true },
            { text: 'HeapSort' }
          ]
        },
        {
          text: 'Коли QuickSort стає O(n^2)?',
          explanation: 'На вже відсортованих або майже відсортованих масивах без рандомізації.',
          tags: ['Sorting'],
          difficulty: 'Hard',
          options: [
            { text: 'Коли всі елементи унікальні' },
            { text: 'Коли півмасиву рівний іншому' },
            { text: 'На вже відсортованому масиві', correct: true }
          ]
        },
        {
          text: 'Яка пам\'ять у HeapSort?',
          explanation: 'HeapSort потребує O(1) додаткової пам\'яті.',
          tags: ['Sorting'],
          difficulty: 'Medium',
          options: [
            { text: 'O(log n)' },
            { text: 'O(n)' },
            { text: 'O(1)', correct: true }
          ]
        }
      ]
    }]
  })

  // Subtopic: Graphs
  await upsertTopic('graphs', {
    name: 'Графи',
    description: 'BFS/DFS/Dijkstra',
    category: 'Programming',
    parentId: algorithms.id,
    materials: [
      { title: 'BFS & DFS – Video', type: 'video', url: 'https://www.youtube.com/watch?v=pcKY4hjDrxk' },
      { title: 'Найкоротші шляхи (Notion)', type: 'link', url: 'https://www.notion.so' },
    ],
    quizzes: [{
      title: 'Graphs 101',
      durationSec: 90,
      questions: [
        {
          text: 'BFS обходить…',
          explanation: 'BFS рухається по рівнях від стартової вершини.',
          tags: ['Graphs'],
          difficulty: 'Easy',
          options: [
            { text: 'в глибину' },
            { text: 'вшир', correct: true },
            { text: 'випадково' }
          ]
        },
        {
          text: 'Яка структура даних лежить в основі BFS?',
          explanation: 'BFS використовує чергу для зберігання сусідів поточних вершин.',
          tags: ['Graphs'],
          difficulty: 'Easy',
          options: [
            { text: 'Стек' },
            { text: 'Черга', correct: true },
            { text: 'Купа' }
          ]
        },
        {
          text: 'Dijkstra не працює коректно коли…',
          explanation: 'Алгоритм не підтримує ребра з від\'ємною вагою.',
          tags: ['Graphs'],
          difficulty: 'Medium',
          options: [
            { text: 'Є ребра з від\'ємною вагою', correct: true },
            { text: 'Граф орієнтований' },
            { text: 'Є петлі' }
          ]
        }
      ]
    }]
  })

  // OOP topic
  await upsertTopic('oop-basics', {
    name: 'Основи ООП',
    description: 'Інкапсуляція, Наслідування, Поліморфізм',
    category: 'Programming',
    materials: [
      { title: 'OOP – конспект', type: 'text', content: 'Інкапсуляція — приховування стану…' },
      { title: 'SOLID – стаття', type: 'link', url: 'https://example.com/solid' },
    ],
    quizzes: [{
      title: 'OOP Basics',
      durationSec: 80,
      questions: [
        {
          text: 'Який принцип про «одну причину для змін»?',
          explanation: 'SRP означає, що клас має одну зону відповідальності.',
          tags: ['OOP'],
          difficulty: 'Easy',
          options: [
            { text: 'LSP' },
            { text: 'SRP', correct: true },
            { text: 'DIP' }
          ]
        },
        {
          text: 'Який принцип описує підстановку підтипів?',
          explanation: 'LSP гарантує, що підкласи можна замінити базовим класом.',
          tags: ['OOP'],
          difficulty: 'Medium',
          options: [
            { text: 'LSP', correct: true },
            { text: 'ISP' },
            { text: 'SRP' }
          ]
        },
        {
          text: 'Який патерн створює об\'єкти без вказання конкретного класу?',
          explanation: 'Factory Method інкапсулює створення об\'єктів.',
          tags: ['OOP'],
          difficulty: 'Medium',
          options: [
            { text: 'Observer' },
            { text: 'Factory Method', correct: true },
            { text: 'Strategy' }
          ]
        }
      ]
    }]
  })

  // Mathematics
  await upsertTopic('linear-algebra', {
    name: 'Лінійна алгебра',
    description: 'Вектори, матриці, множення',
    category: 'Mathematics',
    materials: [
      { title: 'Матриці – PDF', type: 'pdf', url: 'https://example.com/matrix.pdf' }
    ]
  })

  // Databases
  await upsertTopic('sql-basics', {
    name: 'SQL: основи',
    description: 'SELECT, WHERE, JOIN',
    category: 'Databases',
    materials: [
      { title: 'JOIN – пояснення', type: 'text', content: 'LEFT/RIGHT/INNER/FULL…' },
      { title: 'SQL навчальне відео', type: 'video', url: 'https://www.youtube.com/watch?v=27axs9dO7AE' }
    ],
    quizzes: [{
      title: 'SQL Select & Join',
      durationSec: 120,
      questions: [
        {
          text: 'LEFT JOIN повертає…',
          explanation: 'LEFT JOIN залишає всі рядки з лівої таблиці.',
          tags: ['JOIN'],
          difficulty: 'Easy',
          options: [
            { text: 'усі з лівої', correct: true },
            { text: 'тільки співпадіння' },
            { text: 'усі з правої' }
          ]
        },
        {
          text: 'Який індекс прискорить WHERE email = ?',
          explanation: 'B-Tree індекс на стовпці email дає O(log n) пошук.',
          tags: ['Index'],
          difficulty: 'Medium',
          options: [
            { text: 'FULLTEXT' },
            { text: 'BTREE', correct: true },
            { text: 'HASH лише у PostgreSQL' }
          ]
        },
        {
          text: 'Що робить COUNT(*)?',
          explanation: 'COUNT(*) підраховує всі рядки, не ігноруючи NULL.',
          tags: ['Aggregate'],
          difficulty: 'Easy',
          options: [
            { text: 'Підраховує ненульові' },
            { text: 'Підраховує лише числа' },
            { text: 'Підраховує всі рядки', correct: true }
          ]
        },
        {
          text: 'Яка складність пошуку без індексу?',
          explanation: 'Без індексу виконується повне сканування O(n).',
          tags: ['Index'],
          difficulty: 'Hard',
          options: [
            { text: 'O(1)' },
            { text: 'O(log n)' },
            { text: 'O(n)', correct: true }
          ]
        }
      ]
    }]
  })

  // Networks
  await upsertTopic('osi-model', {
    name: 'OSI Model',
    nameJson: { UA: 'Модель OSI', PL: 'Model OSI', EN: 'OSI Model' },
    description: '7 layers',
    descJson: { UA: '7 шарів', PL: '7 warstw', EN: '7 layers' },
    category: 'Networks',
    materials: [
      { title: 'OSI – Notion', type: 'link', url: 'https://www.notion.so' }
    ]
  })

  console.log('')

  // ===== 3. Translations =====
  console.log('🌐 Seeding translations...')
  
  // Category translations
  const categoryTranslations: { category: Category; translations: { UA: string; PL: string; EN: string } }[] = [
    { category: 'Programming', translations: { UA: 'Програмування', PL: 'Programowanie', EN: 'Programming' } },
    { category: 'Mathematics', translations: { UA: 'Математика', PL: 'Matematyka', EN: 'Mathematics' } },
    { category: 'Databases', translations: { UA: 'Бази даних', PL: 'Bazy danych', EN: 'Databases' } },
    { category: 'Networks', translations: { UA: 'Мережі', PL: 'Sieci', EN: 'Networks' } },
    { category: 'WebDevelopment', translations: { UA: 'Веб-розробка', PL: 'Tworzenie stron', EN: 'Web Development' } },
    { category: 'MobileDevelopment', translations: { UA: 'Мобільна розробка', PL: 'Rozwój mobilny', EN: 'Mobile Development' } },
    { category: 'MachineLearning', translations: { UA: 'Машинне навчання', PL: 'Uczenie maszynowe', EN: 'Machine Learning' } },
    { category: 'Security', translations: { UA: 'Кібербезпека', PL: 'Cyberbezpieczeństwo', EN: 'Cybersecurity' } },
    { category: 'DevOps', translations: { UA: 'DevOps', PL: 'DevOps', EN: 'DevOps' } },
    { category: 'OperatingSystems', translations: { UA: 'Операційні системи', PL: 'Systemy operacyjne', EN: 'Operating Systems' } },
  ]
  
  for (const cat of categoryTranslations) {
    const exists = await prisma.categoryTranslation.findFirst({ where: { category: cat.category } })
    if (!exists) {
      await prisma.categoryTranslation.create({ data: cat })
    }
  }
  console.log('  ✓ Category translations')

  // Daily Goal Templates
  const existingGoals = await prisma.dailyGoalTemplate.count()
  if (existingGoals === 0) {
    await prisma.dailyGoalTemplate.createMany({
      data: [
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти 1 квіз', PL: 'Zrób 1 quiz', EN: 'Complete 1 quiz' } },
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти 2 квізи', PL: 'Zrób 2 quizy', EN: 'Complete 2 quizzes' } },
        { category: 'quiz', weight: 2, translations: { UA: 'Отримати 100% у квізі', PL: 'Zdobądź 100% w quizie', EN: 'Get 100% in a quiz' } },
        { category: 'materials', weight: 1, translations: { UA: 'Переглянути 3 матеріали', PL: 'Obejrzyj 3 materiały', EN: 'View 3 materials' } },
        { category: 'materials', weight: 1, translations: { UA: 'Подивитись 1 відео', PL: 'Obejrzyj 1 wideo', EN: 'Watch 1 video' } },
        { category: 'learning', weight: 1, translations: { UA: 'Завчити нове поняття', PL: 'Naucz się nowej koncepcji', EN: 'Learn a new concept' } },
        { category: 'practice', weight: 1, translations: { UA: 'Вирішити 3 задачі', PL: 'Rozwiąż 3 zadania', EN: 'Solve 3 problems' } },
        { category: 'review', weight: 1, translations: { UA: 'Переглянути помилки у квізах', PL: 'Przejrzyj błędy w quizach', EN: 'Review quiz mistakes' } },
      ]
    })
    console.log('  ✓ Daily goal templates')
  }

  // Weak Spot Templates
  const existingWeakSpots = await prisma.weakSpotTemplate.count()
  if (existingWeakSpots === 0) {
    await prisma.weakSpotTemplate.createMany({
      data: [
        { category: 'algorithms', weight: 1, translations: { topic: { UA: 'Рекурсія', PL: 'Rekurencja', EN: 'Recursion' }, advice: { UA: 'Перегляньте конспект та пройдіть додаткові тести', PL: 'Przejrzyj notatki i zrób dodatkowe testy', EN: 'Review notes and take additional tests' } } },
        { category: 'sql', weight: 1, translations: { topic: { UA: 'SQL INNER JOIN', PL: 'SQL INNER JOIN', EN: 'SQL INNER JOIN' }, advice: { UA: 'Практикуйте з реальними прикладами даних', PL: 'Praktykuj z rzeczywistymi przykładami danych', EN: 'Practice with real data examples' } } },
        { category: 'complexity', weight: 1, translations: { topic: { UA: 'Big-O нотація', PL: 'Notacja Big-O', EN: 'Big-O Notation' }, advice: { UA: 'Подивіться відео-пояснення та вирішіть 3 задачі', PL: 'Zobacz wyjaśnienie wideo i rozwiąż 3 zadania', EN: 'Watch video explanation and solve 3 problems' } } },
      ]
    })
    console.log('  ✓ Weak spot templates')
  }

  // Achievement Templates
  const existingAchievements = await prisma.achievementTemplate.count()
  if (existingAchievements === 0) {
    await prisma.achievementTemplate.createMany({
      data: [
        { code: 'first_quiz', icon: '🎯', xpReward: 50, translations: { name: { UA: 'Перший квіз', PL: 'Pierwszy quiz', EN: 'First Quiz' }, description: { UA: 'Пройдіть свій перший квіз', PL: 'Ukończ swój pierwszy quiz', EN: 'Complete your first quiz' } } },
        { code: 'week_streak', icon: '🔥', xpReward: 100, translations: { name: { UA: 'Тиждень поспіль', PL: 'Tydzień z rzędu', EN: 'Week Streak' }, description: { UA: 'Навчайтесь 7 днів поспіль', PL: 'Ucz się przez 7 dni z rzędu', EN: 'Study for 7 days in a row' } } },
        { code: 'perfect_score', icon: '💯', xpReward: 75, translations: { name: { UA: 'Ідеальний результат', PL: 'Idealny wynik', EN: 'Perfect Score' }, description: { UA: 'Отримайте 100% в будь-якому квізі', PL: 'Zdobądź 100% w dowolnym quizie', EN: 'Get 100% in any quiz' } } },
      ]
    })
    console.log('  ✓ Achievement templates')
  }

  // UI Translations (тільки якщо немає)
  const existingUi = await prisma.uiTranslation.count()
  if (existingUi === 0) {
    const uiKeys = [
      { key: 'common.loading', translations: { UA: 'Завантаження...', PL: 'Ładowanie...', EN: 'Loading...' } },
      { key: 'common.save', translations: { UA: 'Зберегти', PL: 'Zapisz', EN: 'Save' } },
      { key: 'common.cancel', translations: { UA: 'Скасувати', PL: 'Anuluj', EN: 'Cancel' } },
      { key: 'common.delete', translations: { UA: 'Видалити', PL: 'Usuń', EN: 'Delete' } },
      { key: 'nav.dashboard', translations: { UA: 'Дашборд', PL: 'Panel', EN: 'Dashboard' } },
      { key: 'nav.materials', translations: { UA: 'Матеріали', PL: 'Materiały', EN: 'Materials' } },
      { key: 'nav.quiz', translations: { UA: 'Квізи', PL: 'Quiz', EN: 'Quiz' } },
      { key: 'nav.leaderboard', translations: { UA: 'Рейтинг', PL: 'Ranking', EN: 'Leaderboard' } },
      { key: 'nav.profile', translations: { UA: 'Профіль', PL: 'Profil', EN: 'Profile' } },
      { key: 'quiz.title', translations: { UA: 'Квізи', PL: 'Quiz', EN: 'Quizzes' } },
      { key: 'quiz.completed', translations: { UA: 'Квіз завершено!', PL: 'Quiz ukończony!', EN: 'Quiz completed!' } },
      { key: 'materials.title', translations: { UA: 'Матеріали', PL: 'Materiały', EN: 'Materials' } },
      { key: 'auth.login', translations: { UA: 'Вхід', PL: 'Logowanie', EN: 'Login' } },
      { key: 'auth.register', translations: { UA: 'Реєстрація', PL: 'Rejestracja', EN: 'Register' } },
    ]
    await prisma.uiTranslation.createMany({ data: uiKeys })
    console.log('  ✓ UI translations (basic set)')
  }

  console.log('\n✅ Seed completed successfully!')
  console.log('   Existing user data has been PRESERVED.')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
