// add-more-content.ts - Додає більше тем та матеріалів для всіх категорій
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Типи для перекладів - використовуємо Prisma.JsonValue для сумісності
type NameJson = { UA: string; PL: string; EN: string } & Prisma.InputJsonValue

interface TopicData {
  slug: string
  name: string
  nameJson: NameJson
  description: string
  descJson: NameJson
  category: 'Programming' | 'Mathematics' | 'Databases' | 'Networks'
  parentSlug?: string
  materials?: Array<{
    title: string
    titleJson: NameJson
    type: 'pdf' | 'video' | 'link' | 'text'
    url?: string
    content?: string
    contentJson?: NameJson
  }>
  quizzes?: Array<{
    title: string
    titleJson: NameJson
    durationSec: number
    questions: Array<{
      text: string
      textJson: NameJson
      explanation?: string
      explanationJson?: NameJson
      difficulty: 'Easy' | 'Medium' | 'Hard'
      options: Array<{ text: string, textJson: NameJson, correct?: boolean }>
    }>
  }>
}

async function upsertTopic(data: TopicData) {
  const existing = await prisma.topic.findUnique({ where: { slug: data.slug } })
  if (existing) {
    console.log(`  ↳ Topic "${data.slug}" exists, updating...`)
    return prisma.topic.update({
      where: { slug: data.slug },
      data: {
        name: data.name,
        nameJson: data.nameJson,
        description: data.description,
        descJson: data.descJson,
      }
    })
  }

  let parentId: string | null = null
  if (data.parentSlug) {
    const parent = await prisma.topic.findUnique({ where: { slug: data.parentSlug } })
    parentId = parent?.id ?? null
  }

  const topic = await prisma.topic.create({
    data: {
      slug: data.slug,
      name: data.name,
      nameJson: data.nameJson,
      description: data.description,
      descJson: data.descJson,
      category: data.category,
      parentId,
      status: 'Published',
      publishedAt: new Date(),
      materials: data.materials ? {
        create: data.materials.map(m => ({
          title: m.title,
          titleJson: m.titleJson,
          type: m.type,
          url: m.url,
          content: m.content,
          contentJson: m.contentJson,
          status: 'Published',
          publishedAt: new Date()
        }))
      } : undefined,
      quizzes: data.quizzes ? {
        create: data.quizzes.map(q => ({
          title: q.title,
          titleJson: q.titleJson,
          durationSec: q.durationSec,
          status: 'Published',
          publishedAt: new Date(),
          questions: {
            create: q.questions.map(qu => ({
              text: qu.text,
              textJson: qu.textJson,
              explanation: qu.explanation,
              explanationJson: qu.explanationJson,
              tags: [],
              difficulty: qu.difficulty,
              options: {
                create: qu.options.map(o => ({
                  text: o.text,
                  textJson: o.textJson,
                  correct: o.correct ?? false
                }))
              }
            }))
          }
        }))
      } : undefined
    }
  })
  console.log(`  ✓ Created topic "${data.slug}"`)
  return topic
}

async function main() {
  console.log('🚀 Adding more content with translations...\n')

  // =============================================
  // PROGRAMMING - More topics
  // =============================================
  console.log('📚 PROGRAMMING topics:')
  
  // Data Structures (root)
  await upsertTopic({
    slug: 'data-structures',
    name: 'Data Structures',
    nameJson: { UA: 'Структури даних', PL: 'Struktury danych', EN: 'Data Structures' },
    description: 'Arrays, Lists, Trees, Hash Tables',
    descJson: { UA: 'Масиви, списки, дерева, хеш-таблиці', PL: 'Tablice, listy, drzewa, tablice haszujące', EN: 'Arrays, Lists, Trees, Hash Tables' },
    category: 'Programming',
    materials: [
      {
        title: 'Data Structures Overview',
        titleJson: { UA: 'Огляд структур даних', PL: 'Przegląd struktur danych', EN: 'Data Structures Overview' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM'
      }
    ]
  })

  // Arrays subtopic
  await upsertTopic({
    slug: 'arrays',
    name: 'Arrays',
    nameJson: { UA: 'Масиви', PL: 'Tablice', EN: 'Arrays' },
    description: 'Static and dynamic arrays',
    descJson: { UA: 'Статичні та динамічні масиви', PL: 'Tablice statyczne i dynamiczne', EN: 'Static and dynamic arrays' },
    category: 'Programming',
    parentSlug: 'data-structures',
    materials: [
      {
        title: 'Arrays in Programming',
        titleJson: { UA: 'Масиви в програмуванні', PL: 'Tablice w programowaniu', EN: 'Arrays in Programming' },
        type: 'text',
        content: 'Arrays are fundamental data structures...',
        contentJson: { 
          UA: 'Масиви — це фундаментальні структури даних, які зберігають елементи послідовно в пам\'яті.',
          PL: 'Tablice to podstawowe struktury danych przechowujące elementy sekwencyjnie w pamięci.',
          EN: 'Arrays are fundamental data structures that store elements sequentially in memory.'
        }
      },
      {
        title: 'Array Operations - PDF',
        titleJson: { UA: 'Операції з масивами - PDF', PL: 'Operacje na tablicach - PDF', EN: 'Array Operations - PDF' },
        type: 'pdf',
        url: 'https://example.com/arrays.pdf'
      }
    ],
    quizzes: [{
      title: 'Arrays Quiz',
      titleJson: { UA: 'Квіз: Масиви', PL: 'Quiz: Tablice', EN: 'Arrays Quiz' },
      durationSec: 60,
      questions: [
        {
          text: 'What is the time complexity of accessing an array element by index?',
          textJson: { 
            UA: 'Яка часова складність доступу до елемента масиву за індексом?',
            PL: 'Jaka jest złożoność czasowa dostępu do elementu tablicy po indeksie?',
            EN: 'What is the time complexity of accessing an array element by index?'
          },
          explanation: 'Array access by index is O(1) because elements are stored contiguously.',
          explanationJson: {
            UA: 'Доступ до масиву за індексом — O(1), оскільки елементи зберігаються послідовно.',
            PL: 'Dostęp do tablicy po indeksie to O(1), ponieważ elementy są przechowywane sekwencyjnie.',
            EN: 'Array access by index is O(1) because elements are stored contiguously.'
          },
          difficulty: 'Easy',
          options: [
            { text: 'O(1)', textJson: { UA: 'O(1)', PL: 'O(1)', EN: 'O(1)' }, correct: true },
            { text: 'O(n)', textJson: { UA: 'O(n)', PL: 'O(n)', EN: 'O(n)' } },
            { text: 'O(log n)', textJson: { UA: 'O(log n)', PL: 'O(log n)', EN: 'O(log n)' } }
          ]
        }
      ]
    }]
  })

  // Linked Lists subtopic
  await upsertTopic({
    slug: 'linked-lists',
    name: 'Linked Lists',
    nameJson: { UA: 'Зв\'язані списки', PL: 'Listy połączone', EN: 'Linked Lists' },
    description: 'Singly and doubly linked lists',
    descJson: { UA: 'Односпрямовані та двоспрямовані списки', PL: 'Listy jednokierunkowe i dwukierunkowe', EN: 'Singly and doubly linked lists' },
    category: 'Programming',
    parentSlug: 'data-structures',
    materials: [
      {
        title: 'Linked Lists Explained',
        titleJson: { UA: 'Пояснення зв\'язаних списків', PL: 'Wyjaśnienie list połączonych', EN: 'Linked Lists Explained' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=WwfhLC16bis'
      }
    ]
  })

  // Trees subtopic
  await upsertTopic({
    slug: 'trees',
    name: 'Trees',
    nameJson: { UA: 'Дерева', PL: 'Drzewa', EN: 'Trees' },
    description: 'Binary trees, BST, AVL',
    descJson: { UA: 'Бінарні дерева, BST, AVL', PL: 'Drzewa binarne, BST, AVL', EN: 'Binary trees, BST, AVL' },
    category: 'Programming',
    parentSlug: 'data-structures',
    materials: [
      {
        title: 'Binary Trees Tutorial',
        titleJson: { UA: 'Підручник з бінарних дерев', PL: 'Samouczek drzew binarnych', EN: 'Binary Trees Tutorial' },
        type: 'link',
        url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/'
      }
    ]
  })

  // Design Patterns (root)
  await upsertTopic({
    slug: 'design-patterns',
    name: 'Design Patterns',
    nameJson: { UA: 'Шаблони проектування', PL: 'Wzorce projektowe', EN: 'Design Patterns' },
    description: 'Creational, Structural, Behavioral patterns',
    descJson: { UA: 'Породжуючі, структурні, поведінкові патерни', PL: 'Wzorce kreacyjne, strukturalne, behawioralne', EN: 'Creational, Structural, Behavioral patterns' },
    category: 'Programming',
    materials: [
      {
        title: 'Design Patterns Introduction',
        titleJson: { UA: 'Вступ до шаблонів проектування', PL: 'Wprowadzenie do wzorców projektowych', EN: 'Design Patterns Introduction' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=v9ejT8FO-7I'
      }
    ]
  })

  // Singleton pattern
  await upsertTopic({
    slug: 'singleton-pattern',
    name: 'Singleton',
    nameJson: { UA: 'Одинак (Singleton)', PL: 'Singleton', EN: 'Singleton' },
    description: 'Ensure a class has only one instance',
    descJson: { UA: 'Гарантує, що клас має лише один екземпляр', PL: 'Zapewnia, że klasa ma tylko jedną instancję', EN: 'Ensure a class has only one instance' },
    category: 'Programming',
    parentSlug: 'design-patterns',
    materials: [
      {
        title: 'Singleton Pattern Explained',
        titleJson: { UA: 'Пояснення патерну Singleton', PL: 'Wyjaśnienie wzorca Singleton', EN: 'Singleton Pattern Explained' },
        type: 'text',
        content: 'Singleton pattern ensures only one instance...',
        contentJson: {
          UA: 'Патерн Singleton гарантує, що клас має лише один екземпляр і надає глобальну точку доступу до нього.',
          PL: 'Wzorzec Singleton zapewnia, że klasa ma tylko jedną instancję i udostępnia globalny punkt dostępu do niej.',
          EN: 'Singleton pattern ensures that a class has only one instance and provides a global point of access to it.'
        }
      }
    ]
  })

  // Observer pattern
  await upsertTopic({
    slug: 'observer-pattern',
    name: 'Observer',
    nameJson: { UA: 'Спостерігач (Observer)', PL: 'Obserwator', EN: 'Observer' },
    description: 'Define subscription mechanism',
    descJson: { UA: 'Визначає механізм підписки', PL: 'Definiuje mechanizm subskrypcji', EN: 'Define subscription mechanism' },
    category: 'Programming',
    parentSlug: 'design-patterns'
  })

  // =============================================
  // MATHEMATICS - More topics
  // =============================================
  console.log('\n📐 MATHEMATICS topics:')

  // Calculus (root)
  await upsertTopic({
    slug: 'calculus',
    name: 'Calculus',
    nameJson: { UA: 'Математичний аналіз', PL: 'Rachunek różniczkowy', EN: 'Calculus' },
    description: 'Derivatives, integrals, limits',
    descJson: { UA: 'Похідні, інтеграли, границі', PL: 'Pochodne, całki, granice', EN: 'Derivatives, integrals, limits' },
    category: 'Mathematics',
    materials: [
      {
        title: 'Calculus Basics',
        titleJson: { UA: 'Основи математичного аналізу', PL: 'Podstawy rachunku różniczkowego', EN: 'Calculus Basics' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM'
      }
    ]
  })

  // Derivatives subtopic
  await upsertTopic({
    slug: 'derivatives',
    name: 'Derivatives',
    nameJson: { UA: 'Похідні', PL: 'Pochodne', EN: 'Derivatives' },
    description: 'Rate of change, differentiation rules',
    descJson: { UA: 'Швидкість зміни, правила диференціювання', PL: 'Szybkość zmiany, reguły różniczkowania', EN: 'Rate of change, differentiation rules' },
    category: 'Mathematics',
    parentSlug: 'calculus',
    materials: [
      {
        title: 'Derivatives Explained',
        titleJson: { UA: 'Пояснення похідних', PL: 'Wyjaśnienie pochodnych', EN: 'Derivatives Explained' },
        type: 'text',
        content: 'A derivative represents the rate of change...',
        contentJson: {
          UA: 'Похідна представляє швидкість зміни функції в точці.',
          PL: 'Pochodna reprezentuje szybkość zmiany funkcji w punkcie.',
          EN: 'A derivative represents the rate of change of a function at a point.'
        }
      }
    ],
    quizzes: [{
      title: 'Derivatives Quiz',
      titleJson: { UA: 'Квіз: Похідні', PL: 'Quiz: Pochodne', EN: 'Derivatives Quiz' },
      durationSec: 90,
      questions: [
        {
          text: 'What is the derivative of x²?',
          textJson: { UA: 'Яка похідна від x²?', PL: 'Jaka jest pochodna x²?', EN: 'What is the derivative of x²?' },
          explanation: 'Using the power rule: d/dx(x^n) = n*x^(n-1)',
          explanationJson: {
            UA: 'За правилом степеня: d/dx(x^n) = n*x^(n-1)',
            PL: 'Według reguły potęgi: d/dx(x^n) = n*x^(n-1)',
            EN: 'Using the power rule: d/dx(x^n) = n*x^(n-1)'
          },
          difficulty: 'Easy',
          options: [
            { text: '2x', textJson: { UA: '2x', PL: '2x', EN: '2x' }, correct: true },
            { text: 'x', textJson: { UA: 'x', PL: 'x', EN: 'x' } },
            { text: '2', textJson: { UA: '2', PL: '2', EN: '2' } }
          ]
        }
      ]
    }]
  })

  // Integrals subtopic
  await upsertTopic({
    slug: 'integrals',
    name: 'Integrals',
    nameJson: { UA: 'Інтеграли', PL: 'Całki', EN: 'Integrals' },
    description: 'Definite and indefinite integrals',
    descJson: { UA: 'Визначені та невизначені інтеграли', PL: 'Całki oznaczone i nieoznaczone', EN: 'Definite and indefinite integrals' },
    category: 'Mathematics',
    parentSlug: 'calculus'
  })

  // Probability (root)
  await upsertTopic({
    slug: 'probability',
    name: 'Probability',
    nameJson: { UA: 'Теорія ймовірностей', PL: 'Rachunek prawdopodobieństwa', EN: 'Probability' },
    description: 'Random events, distributions',
    descJson: { UA: 'Випадкові події, розподіли', PL: 'Zdarzenia losowe, rozkłady', EN: 'Random events, distributions' },
    category: 'Mathematics',
    materials: [
      {
        title: 'Probability Introduction',
        titleJson: { UA: 'Вступ до теорії ймовірностей', PL: 'Wprowadzenie do rachunku prawdopodobieństwa', EN: 'Probability Introduction' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=uzkc-qNVoOk'
      }
    ]
  })

  // Discrete Math (root)
  await upsertTopic({
    slug: 'discrete-math',
    name: 'Discrete Mathematics',
    nameJson: { UA: 'Дискретна математика', PL: 'Matematyka dyskretna', EN: 'Discrete Mathematics' },
    description: 'Logic, sets, combinatorics',
    descJson: { UA: 'Логіка, множини, комбінаторика', PL: 'Logika, zbiory, kombinatoryka', EN: 'Logic, sets, combinatorics' },
    category: 'Mathematics',
    materials: [
      {
        title: 'Discrete Math Overview',
        titleJson: { UA: 'Огляд дискретної математики', PL: 'Przegląd matematyki dyskretnej', EN: 'Discrete Math Overview' },
        type: 'link',
        url: 'https://www.khanacademy.org/computing/computer-science/cryptography/comp-number-theory'
      }
    ]
  })

  // =============================================
  // DATABASES - More topics  
  // =============================================
  console.log('\n🗄️ DATABASES topics:')

  // NoSQL (root)
  await upsertTopic({
    slug: 'nosql',
    name: 'NoSQL Databases',
    nameJson: { UA: 'NoSQL бази даних', PL: 'Bazy danych NoSQL', EN: 'NoSQL Databases' },
    description: 'MongoDB, Redis, Cassandra',
    descJson: { UA: 'MongoDB, Redis, Cassandra', PL: 'MongoDB, Redis, Cassandra', EN: 'MongoDB, Redis, Cassandra' },
    category: 'Databases',
    materials: [
      {
        title: 'NoSQL vs SQL',
        titleJson: { UA: 'NoSQL проти SQL', PL: 'NoSQL vs SQL', EN: 'NoSQL vs SQL' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ZS_kXvOeQ5Y'
      }
    ]
  })

  // MongoDB subtopic
  await upsertTopic({
    slug: 'mongodb',
    name: 'MongoDB',
    nameJson: { UA: 'MongoDB', PL: 'MongoDB', EN: 'MongoDB' },
    description: 'Document database fundamentals',
    descJson: { UA: 'Основи документної бази даних', PL: 'Podstawy bazy dokumentów', EN: 'Document database fundamentals' },
    category: 'Databases',
    parentSlug: 'nosql',
    materials: [
      {
        title: 'MongoDB Tutorial',
        titleJson: { UA: 'Підручник MongoDB', PL: 'Samouczek MongoDB', EN: 'MongoDB Tutorial' },
        type: 'link',
        url: 'https://www.mongodb.com/docs/manual/tutorial/'
      }
    ]
  })

  // Redis subtopic
  await upsertTopic({
    slug: 'redis',
    name: 'Redis',
    nameJson: { UA: 'Redis', PL: 'Redis', EN: 'Redis' },
    description: 'In-memory data store',
    descJson: { UA: 'Сховище даних в пам\'яті', PL: 'Przechowywanie danych w pamięci', EN: 'In-memory data store' },
    category: 'Databases',
    parentSlug: 'nosql'
  })

  // Database Design (root)
  await upsertTopic({
    slug: 'database-design',
    name: 'Database Design',
    nameJson: { UA: 'Проектування баз даних', PL: 'Projektowanie baz danych', EN: 'Database Design' },
    description: 'Normalization, ER diagrams',
    descJson: { UA: 'Нормалізація, ER-діаграми', PL: 'Normalizacja, diagramy ER', EN: 'Normalization, ER diagrams' },
    category: 'Databases',
    materials: [
      {
        title: 'Database Normalization',
        titleJson: { UA: 'Нормалізація баз даних', PL: 'Normalizacja baz danych', EN: 'Database Normalization' },
        type: 'text',
        content: 'Database normalization reduces data redundancy...',
        contentJson: {
          UA: 'Нормалізація баз даних зменшує надлишковість даних та покращує цілісність.',
          PL: 'Normalizacja baz danych redukuje redundancję danych i poprawia integralność.',
          EN: 'Database normalization reduces data redundancy and improves data integrity.'
        }
      }
    ],
    quizzes: [{
      title: 'Database Design Quiz',
      titleJson: { UA: 'Квіз: Проектування БД', PL: 'Quiz: Projektowanie BD', EN: 'Database Design Quiz' },
      durationSec: 120,
      questions: [
        {
          text: 'What does 3NF stand for?',
          textJson: { UA: 'Що означає 3NF?', PL: 'Co oznacza 3NF?', EN: 'What does 3NF stand for?' },
          explanation: '3NF is Third Normal Form in database normalization.',
          explanationJson: {
            UA: '3NF — це третя нормальна форма в нормалізації баз даних.',
            PL: '3NF to trzecia postać normalna w normalizacji baz danych.',
            EN: '3NF is Third Normal Form in database normalization.'
          },
          difficulty: 'Medium',
          options: [
            { text: 'Third Normal Form', textJson: { UA: 'Третя нормальна форма', PL: 'Trzecia postać normalna', EN: 'Third Normal Form' }, correct: true },
            { text: 'Third Network Format', textJson: { UA: 'Третій мережевий формат', PL: 'Trzeci format sieciowy', EN: 'Third Network Format' } },
            { text: 'Three Node Framework', textJson: { UA: 'Три вузли фреймворку', PL: 'Trzy węzły frameworku', EN: 'Three Node Framework' } }
          ]
        }
      ]
    }]
  })

  // =============================================
  // NETWORKS - More topics
  // =============================================
  console.log('\n🌐 NETWORKS topics:')

  // TCP/IP (root)
  await upsertTopic({
    slug: 'tcp-ip',
    name: 'TCP/IP Protocol',
    nameJson: { UA: 'Протокол TCP/IP', PL: 'Protokół TCP/IP', EN: 'TCP/IP Protocol' },
    description: 'Internet protocol suite',
    descJson: { UA: 'Набір інтернет-протоколів', PL: 'Zestaw protokołów internetowych', EN: 'Internet protocol suite' },
    category: 'Networks',
    materials: [
      {
        title: 'TCP/IP Explained',
        titleJson: { UA: 'Пояснення TCP/IP', PL: 'Wyjaśnienie TCP/IP', EN: 'TCP/IP Explained' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=PpsEaqJV_A0'
      }
    ]
  })

  // HTTP subtopic
  await upsertTopic({
    slug: 'http-protocol',
    name: 'HTTP/HTTPS',
    nameJson: { UA: 'HTTP/HTTPS', PL: 'HTTP/HTTPS', EN: 'HTTP/HTTPS' },
    description: 'Web communication protocols',
    descJson: { UA: 'Протоколи веб-комунікації', PL: 'Protokoły komunikacji webowej', EN: 'Web communication protocols' },
    category: 'Networks',
    parentSlug: 'tcp-ip',
    materials: [
      {
        title: 'HTTP Methods',
        titleJson: { UA: 'Методи HTTP', PL: 'Metody HTTP', EN: 'HTTP Methods' },
        type: 'text',
        content: 'GET, POST, PUT, DELETE...',
        contentJson: {
          UA: 'GET — отримати, POST — створити, PUT — оновити, DELETE — видалити.',
          PL: 'GET — pobierz, POST — utwórz, PUT — aktualizuj, DELETE — usuń.',
          EN: 'GET — retrieve, POST — create, PUT — update, DELETE — delete.'
        }
      }
    ],
    quizzes: [{
      title: 'HTTP Quiz',
      titleJson: { UA: 'Квіз: HTTP', PL: 'Quiz: HTTP', EN: 'HTTP Quiz' },
      durationSec: 60,
      questions: [
        {
          text: 'Which HTTP method is used to retrieve data?',
          textJson: { UA: 'Який HTTP метод використовується для отримання даних?', PL: 'Która metoda HTTP służy do pobierania danych?', EN: 'Which HTTP method is used to retrieve data?' },
          difficulty: 'Easy',
          options: [
            { text: 'GET', textJson: { UA: 'GET', PL: 'GET', EN: 'GET' }, correct: true },
            { text: 'POST', textJson: { UA: 'POST', PL: 'POST', EN: 'POST' } },
            { text: 'DELETE', textJson: { UA: 'DELETE', PL: 'DELETE', EN: 'DELETE' } }
          ]
        }
      ]
    }]
  })

  // DNS subtopic
  await upsertTopic({
    slug: 'dns',
    name: 'DNS',
    nameJson: { UA: 'DNS', PL: 'DNS', EN: 'DNS' },
    description: 'Domain Name System',
    descJson: { UA: 'Система доменних імен', PL: 'System nazw domenowych', EN: 'Domain Name System' },
    category: 'Networks',
    parentSlug: 'tcp-ip'
  })

  // Network Security (root)
  await upsertTopic({
    slug: 'network-security',
    name: 'Network Security',
    nameJson: { UA: 'Мережева безпека', PL: 'Bezpieczeństwo sieci', EN: 'Network Security' },
    description: 'Firewalls, VPN, encryption',
    descJson: { UA: 'Фаєрволи, VPN, шифрування', PL: 'Firewalle, VPN, szyfrowanie', EN: 'Firewalls, VPN, encryption' },
    category: 'Networks',
    materials: [
      {
        title: 'Network Security Basics',
        titleJson: { UA: 'Основи мережевої безпеки', PL: 'Podstawy bezpieczeństwa sieci', EN: 'Network Security Basics' },
        type: 'video',
        url: 'https://www.youtube.com/watch?v=sdpxddDzXfE'
      }
    ]
  })

  // Wireless Networks (root)
  await upsertTopic({
    slug: 'wireless',
    name: 'Wireless Networks',
    nameJson: { UA: 'Бездротові мережі', PL: 'Sieci bezprzewodowe', EN: 'Wireless Networks' },
    description: 'WiFi, Bluetooth, 5G',
    descJson: { UA: 'WiFi, Bluetooth, 5G', PL: 'WiFi, Bluetooth, 5G', EN: 'WiFi, Bluetooth, 5G' },
    category: 'Networks'
  })

  console.log('\n✅ Content added successfully!')
  
  // Summary
  const counts = {
    topics: await prisma.topic.count(),
    materials: await prisma.material.count(),
    quizzes: await prisma.quiz.count(),
    questions: await prisma.question.count()
  }
  console.log('\n📊 Database summary:')
  console.log(`   Topics:    ${counts.topics}`)
  console.log(`   Materials: ${counts.materials}`)
  console.log(`   Quizzes:   ${counts.quizzes}`)
  console.log(`   Questions: ${counts.questions}`)

  await prisma.$disconnect()
}

main().catch(console.error)
