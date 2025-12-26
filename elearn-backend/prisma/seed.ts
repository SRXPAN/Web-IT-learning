import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main(){
  // Clean existing data to avoid unique slug/id conflicts on reseed
  await prisma.answer.deleteMany()
  await prisma.option.deleteMany()
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.material.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.user.deleteMany({ where: { email: { not: undefined } } })
  
  // Clean translation tables
  await prisma.uiTranslation.deleteMany()
  await prisma.dailyGoalTemplate.deleteMany()
  await prisma.weakSpotTemplate.deleteMany()
  await prisma.achievementTemplate.deleteMany()
  await prisma.categoryTranslation.deleteMany()

     // ===== Admin =====
   const hash = await bcrypt.hash('admin123', 10)
   const admin = await prisma.user.upsert({
     where: { email: 'admin@elearn.local' },
     update: {},
     create: {
       email: 'admin@elearn.local',
       name: 'Admin',
       password: hash,
       role: 'ADMIN'
     }
   })

  // ===== Programming root =====
  const algorithms = await prisma.topic.create({
    data: {
      slug: 'algorithms',
      name: 'Algorithms',
      nameJson: { UA: 'Алгоритми', PL: 'Algorytmy', EN: 'Algorithms' },
      description: 'Sorting and graphs',
      descJson: { UA: 'Сортування та графи', PL: 'Sortowanie i grafy', EN: 'Sorting and graphs' },
      category: 'Programming'
    }
  })

    // ----- Sorting subtopic
    await prisma.topic.create({
        data: {
            slug:'sorting',
            name:'Sorting',
            nameJson: { UA: 'Сортування', PL: 'Sortowanie', EN: 'Sorting' },
            description:'Quick/Merge/Heap',
            descJson: { UA: 'Quick/Merge/Heap сортування', PL: 'Sortowanie Quick/Merge/Heap', EN: 'Quick/Merge/Heap sorting' },
            category:'Programming',
            parentId: algorithms.id,
            materials:{ create:[
                    { title:'QuickSort – PDF', type:'pdf', url:'https://example.com/quicksort.pdf' },
                    { title:'Merge Sort – Video', type:'video', url:'https://www.youtube.com/watch?v=Ns7tGNbtvV4' },
                    { title:'Stability of sorting – Article', type:'link', url:'https://en.wikipedia.org/wiki/Sorting_algorithm' },
                ]},
            quizzes:{ create:[{
                    title:'Sorting Basics', durationSec:90,
                    questions:{ create:[
                            {
                                 text:'Середня складність QuickSort?',
                                 explanation:'QuickSort середньо працює за O(n log n) завдяки поділу масиву.',
                                 tags:['Sorting'], difficulty:'Easy',
                                 options:{ create:[
                                         { text:'O(n log n)', correct:true },
                                         { text:'O(n^2)' },
                                         { text:'O(log n)' }
                                     ]}
                            },
                            {
                                 text:'Стабільний алгоритм?',
                                 explanation:'MergeSort не змінює порядок рівних елементів.',
                                 tags:['Sorting'], difficulty:'Medium',
                                 options:{ create:[
                                         { text:'QuickSort' },
                                         { text:'MergeSort', correct:true },
                                         { text:'HeapSort' }
                                     ]}
                            },
                            {
                                 text:'Коли QuickSort стає O(n^2)?',
                                 explanation:'На вже відсортованих або майже відсортованих масивах без рандомізації.',
                                 tags:['Sorting'], difficulty:'Hard',
                                 options:{ create:[
                                         { text:'Коли всі елементи унікальні' },
                                         { text:'Коли півмасиву рівний іншому' },
                                         { text:'На вже відсортованому масиві', correct:true }
                                     ]}
                            },
                            {
                                 text:'Яка пам’ять у HeapSort?',
                                 explanation:'HeapSort потребує O(1) додаткової пам’яті.',
                                 tags:['Sorting'], difficulty:'Medium',
                                 options:{ create:[
                                         { text:'O(log n)' },
                                         { text:'O(n)' },
                                         { text:'O(1)', correct:true }
                                     ]}
                            },
                        ]}
                }]}
        }
    })

    // ----- Graphs subtopic
    await prisma.topic.create({
        data:{
            slug:'graphs',
            name:'Графи',
            description:'BFS/DFS/Dijkstra',
            category:'Programming',
            parentId: algorithms.id,
            materials:{ create:[
                    { title:'BFS & DFS – Video', type:'video', url:'https://www.youtube.com/watch?v=pcKY4hjDrxk' },
                    { title:'Найкоротші шляхи (Notion)', type:'link', url:'https://www.notion.so' },
                ]},
            quizzes:{ create:[{
                    title:'Graphs 101', durationSec:90,
                    questions:{ create:[
                            {
                                 text:'BFS обходить…',
                                 explanation:'BFS рухається по рівнях від стартової вершини.',
                                 tags:['Graphs'], difficulty:'Easy',
                                 options:{ create:[
                                         { text:'в глибину' },
                                         { text:'вшир', correct:true },
                                         { text:'випадково' }
                                     ]}
                            },
                            {
                                 text:'Яка структура даних лежить в основі BFS?',
                                 explanation:'BFS використовує чергу для зберігання сусідів поточних вершин.',
                                 tags:['Graphs'], difficulty:'Easy',
                                 options:{ create:[
                                         { text:'Стек' },
                                         { text:'Черга', correct:true },
                                         { text:'Купа' }
                                     ]}
                            },
                            {
                                 text:'Dijkstra не працює коректно коли…',
                                 explanation:'Алгоритм не підтримує ребра з від’ємною вагою.',
                                 tags:['Graphs'], difficulty:'Medium',
                                 options:{ create:[
                                         { text:'Є ребра з від’ємною вагою', correct:true },
                                         { text:'Граф орієнтований' },
                                         { text:'Є петлі' }
                                     ]}
                            }]}
                }]}
        }
    })

    // ===== OOP (root topic, no parent)
    await prisma.topic.create({
        data:{
            slug:'oop-basics',
            name:'Основи ООП',
            description:'Інкапсуляція, Наслідування, Поліморфізм',
            category:'Programming',
            materials:{ create:[
                    { title:'OOP – конспект', type:'text', content:'Інкапсуляція — приховування стану…' },
                    { title:'SOLID – стаття', type:'link', url:'https://example.com/solid' },
                ]},
            quizzes:{ create:[{
                    title:'OOP Basics', durationSec:80,
                    questions:{ create:[
                            {
                                 text:'Який принцип про «одну причину для змін»?',
                                 explanation:'SRP означає, що клас має одну зону відповідальності.',
                                 tags:['OOP'], difficulty:'Easy',
                                 options:{ create:[
                                         { text:'LSP' },
                                         { text:'SRP', correct:true },
                                         { text:'DIP' }
                                     ]}
                            },
                            {
                                 text:'Який принцип описує підстановку підтипів?',
                                 explanation:'LSP гарантує, що підкласи можна замінити базовим класом.',
                                 tags:['OOP'], difficulty:'Medium',
                                 options:{ create:[
                                         { text:'LSP', correct:true },
                                         { text:'ISP' },
                                         { text:'SRP' }
                                     ]}
                            },
                            {
                                 text:'Який патерн створює об’єкти без вказання конкретного класу?',
                                 explanation:'Factory Method інкапсулює створення об’єктів.',
                                 tags:['OOP'], difficulty:'Medium',
                                 options:{ create:[
                                         { text:'Observer' },
                                         { text:'Factory Method', correct:true },
                                         { text:'Strategy' }
                                     ]}
                            }]}
                }]}
        }
    })

    // ===== Mathematics
    await prisma.topic.create({
        data:{
            slug:'linear-algebra',
            name:'Лінійна алгебра',
            description:'Вектори, матриці, множення',
            category:'Mathematics',
            materials:{ create:[
                    { title:'Матриці – PDF', type:'pdf', url:'https://example.com/matrix.pdf' }
                ]}
        }
    })

    // ===== Databases
    await prisma.topic.create({
        data:{
            slug:'sql-basics',
            name:'SQL: основи',
            description:'SELECT, WHERE, JOIN',
            category:'Databases',
            materials:{ create:[
                    { title:'JOIN – пояснення', type:'text', content:'LEFT/RIGHT/INNER/FULL…' },
                    { title:'SQL навчальне відео', type:'video', url:'https://www.youtube.com/watch?v=27axs9dO7AE' }
                ]},
            quizzes:{ create:[{
                    title:'SQL Select & Join', durationSec:120,
                    questions:{ create:[
                            {
                                 text:'LEFT JOIN повертає…',
                                 explanation:'LEFT JOIN залишає всі рядки з лівої таблиці.',
                                 tags:['JOIN'], difficulty:'Easy',
                                 options:{ create:[
                                         { text:'усі з лівої', correct:true },
                                         { text:'тільки співпадіння' },
                                         { text:'усі з правої' }
                                     ]}
                            },
                            {
                                 text:'Який індекс прискорить WHERE email = ?',
                                 explanation:'B-Tree індекс на стовпці email дає O(log n) пошук.',
                                 tags:['Index'], difficulty:'Medium',
                                 options:{ create:[
                                         { text:'FULLTEXT' },
                                         { text:'BTREE', correct:true },
                                         { text:'HASH лише у PostgreSQL' }
                                     ]}
                            },
                            {
                                 text:'Що робить COUNT(*)?',
                                 explanation:'COUNT(*) підраховує всі рядки, не ігноруючи NULL.',
                                 tags:['Aggregate'], difficulty:'Easy',
                                 options:{ create:[
                                         { text:'Підраховує ненульові' },
                                         { text:'Підраховує лише числа' },
                                         { text:'Підраховує всі рядки', correct:true }
                                     ]}
                            },
                            {
                                 text:'Яка складність пошуку без індексу?',
                                 explanation:'Без індексу виконується повне сканування O(n).',
                                 tags:['Index'], difficulty:'Hard',
                                 options:{ create:[
                                         { text:'O(1)' },
                                         { text:'O(log n)' },
                                         { text:'O(n)', correct:true }
                                     ]}
                            }]}
                }]}
        }
    })

    // ===== Networks
    await prisma.topic.create({
        data:{
            slug:'osi-model',
            name:'OSI Model',
            nameJson: { UA: 'Модель OSI', PL: 'Model OSI', EN: 'OSI Model' },
            description:'7 layers',
            descJson: { UA: '7 шарів', PL: '7 warstw', EN: '7 layers' },
            category:'Networks',
            materials:{ create:[ { title:'OSI – Notion', type:'link', url:'https://www.notion.so' } ]}
        }
    })

    // ===== SEED TRANSLATIONS =====
    
    // Category translations
    await prisma.categoryTranslation.createMany({
      data: [
        { category: 'Programming', translations: { UA: 'Програмування', PL: 'Programowanie', EN: 'Programming' } },
        { category: 'Mathematics', translations: { UA: 'Математика', PL: 'Matematyka', EN: 'Mathematics' } },
        { category: 'Databases', translations: { UA: 'Бази даних', PL: 'Bazy danych', EN: 'Databases' } },
        { category: 'Networks', translations: { UA: 'Мережі', PL: 'Sieci', EN: 'Networks' } },
      ]
    })

    // Daily Goal Templates (all 50 goals)
    await prisma.dailyGoalTemplate.createMany({
      data: [
        // Quiz Goals (g1-g5)
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти 1 квіз', PL: 'Zrób 1 quiz', EN: 'Complete 1 quiz' } },
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти 2 квізи', PL: 'Zrób 2 quizy', EN: 'Complete 2 quizzes' } },
        { category: 'quiz', weight: 2, translations: { UA: 'Отримати 100% у квізі', PL: 'Zdobądź 100% w quizie', EN: 'Get 100% in a quiz' } },
        { category: 'quiz', weight: 2, translations: { UA: 'Пройти квіз без помилок', PL: 'Przejdź quiz bez błędów', EN: 'Pass quiz without mistakes' } },
        { category: 'quiz', weight: 1, translations: { UA: 'Відповісти на 10 питань', PL: 'Odpowiedz na 10 pytań', EN: 'Answer 10 questions' } },
        // Materials Goals (g6-g10)
        { category: 'materials', weight: 1, translations: { UA: 'Переглянути 3 матеріали', PL: 'Obejrzyj 3 materiały', EN: 'View 3 materials' } },
        { category: 'materials', weight: 1, translations: { UA: 'Прочитати 2 конспекти', PL: 'Przeczytaj 2 notatki', EN: 'Read 2 notes' } },
        { category: 'materials', weight: 1, translations: { UA: 'Подивитись 1 відео', PL: 'Obejrzyj 1 wideo', EN: 'Watch 1 video' } },
        { category: 'materials', weight: 1, translations: { UA: 'Завантажити 2 PDF файли', PL: 'Pobierz 2 pliki PDF', EN: 'Download 2 PDF files' } },
        { category: 'materials', weight: 2, translations: { UA: 'Переглянути 5 матеріалів', PL: 'Obejrzyj 5 materiałów', EN: 'View 5 materials' } },
        // Learning Goals (g11-g15)
        { category: 'learning', weight: 1, translations: { UA: 'Завчити нове поняття', PL: 'Naucz się nowej koncepcji', EN: 'Learn a new concept' } },
        { category: 'learning', weight: 1, translations: { UA: 'Повторити минулу тему', PL: 'Powtórz poprzedni temat', EN: 'Review previous topic' } },
        { category: 'learning', weight: 1, translations: { UA: 'Зробити нотатки з теми', PL: 'Zrób notatki z tematu', EN: 'Make notes on topic' } },
        { category: 'learning', weight: 2, translations: { UA: 'Вивчити 5 нових термінів', PL: 'Naucz się 5 nowych terminów', EN: 'Learn 5 new terms' } },
        { category: 'learning', weight: 1, translations: { UA: 'Завершити 1 розділ', PL: 'Ukończ 1 rozdział', EN: 'Complete 1 section' } },
        // Practice Goals (g16-g20)
        { category: 'practice', weight: 1, translations: { UA: 'Вирішити 3 задачі', PL: 'Rozwiąż 3 zadania', EN: 'Solve 3 problems' } },
        { category: 'practice', weight: 2, translations: { UA: 'Написати код алгоритму', PL: 'Napisz kod algorytmu', EN: 'Write algorithm code' } },
        { category: 'practice', weight: 1, translations: { UA: 'Практикувати 30 хвилин', PL: 'Ćwicz przez 30 minut', EN: 'Practice for 30 minutes' } },
        { category: 'practice', weight: 2, translations: { UA: 'Виконати практичне завдання', PL: 'Wykonaj zadanie praktyczne', EN: 'Complete practical task' } },
        { category: 'practice', weight: 1, translations: { UA: 'Реалізувати приклад з уроку', PL: 'Zaimplementuj przykład z lekcji', EN: 'Implement example from lesson' } },
        // Review Goals (g21-g25)
        { category: 'review', weight: 1, translations: { UA: 'Переглянути помилки у квізах', PL: 'Przejrzyj błędy w quizach', EN: 'Review quiz mistakes' } },
        { category: 'review', weight: 1, translations: { UA: 'Повторити слабкі теми', PL: 'Powtórz słabe tematy', EN: 'Review weak topics' } },
        { category: 'review', weight: 1, translations: { UA: 'Переглянути минулий урок', PL: 'Przejrzyj poprzednią lekcję', EN: 'Review previous lesson' } },
        { category: 'review', weight: 2, translations: { UA: 'Повторити ключові поняття', PL: 'Powtórz kluczowe pojęcia', EN: 'Review key concepts' } },
        { category: 'review', weight: 1, translations: { UA: 'Зробити підсумки тижня', PL: 'Zrób podsumowanie tygodnia', EN: 'Make weekly summary' } },
        // Additional Goals (g26-g30)
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти швидкий квіз за 5 хв', PL: 'Przejdź szybki quiz w 5 min', EN: 'Pass quick quiz in 5 min' } },
        { category: 'materials', weight: 1, translations: { UA: 'Вивчити новий підрозділ', PL: 'Naucz się nowej podsekcji', EN: 'Learn new subsection' } },
        { category: 'learning', weight: 2, translations: { UA: 'Зрозуміти складну тему', PL: 'Zrozum trudny temat', EN: 'Understand difficult topic' } },
        { category: 'practice', weight: 1, translations: { UA: 'Попрактикувати навички', PL: 'Poćwicz umiejętności', EN: 'Practice skills' } },
        { category: 'review', weight: 1, translations: { UA: 'Підготуватись до екзамену', PL: 'Przygotuj się do egzaminu', EN: 'Prepare for exam' } },
        // More diverse goals (g31-g35)
        { category: 'quiz', weight: 1, translations: { UA: 'Набрати 75% у будь-якому квізі', PL: 'Zdobądź 75% w dowolnym quizie', EN: 'Score 75% in any quiz' } },
        { category: 'materials', weight: 1, translations: { UA: 'Вивчити 3 різні типи матеріалів', PL: 'Naucz się 3 różnych typów materiałów', EN: 'Study 3 different material types' } },
        { category: 'learning', weight: 2, translations: { UA: 'Створити mind-map з теми', PL: 'Stwórz mapę myśli z tematu', EN: 'Create mind-map of topic' } },
        { category: 'practice', weight: 2, translations: { UA: 'Запрограмувати рішення задачі', PL: 'Zaprogramuj rozwiązanie problemu', EN: 'Code problem solution' } },
        { category: 'review', weight: 1, translations: { UA: 'Переглянути всі нотатки за тиждень', PL: 'Przejrzyj wszystkie notatki z tygodnia', EN: 'Review all weekly notes' } },
        // More goals (g36-g40)
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти 3 легких квізи', PL: 'Przejdź 3 łatwe quizy', EN: 'Pass 3 easy quizzes' } },
        { category: 'materials', weight: 1, translations: { UA: 'Дослідити нову категорію', PL: 'Zbadaj nową kategorię', EN: 'Explore new category' } },
        { category: 'learning', weight: 2, translations: { UA: 'Вивчити практичний приклад', PL: 'Naucz się praktycznego przykładu', EN: 'Learn practical example' } },
        { category: 'practice', weight: 1, translations: { UA: 'Вирішити середню задачу', PL: 'Rozwiąż średnie zadanie', EN: 'Solve medium problem' } },
        { category: 'review', weight: 1, translations: { UA: 'Повторити 2 минулі теми', PL: 'Powtórz 2 poprzednie tematy', EN: 'Review 2 past topics' } },
        // Final goals (g41-g45)
        { category: 'quiz', weight: 1, translations: { UA: 'Отримати бейдж за квіз', PL: 'Zdobądź odznakę za quiz', EN: 'Earn quiz badge' } },
        { category: 'materials', weight: 1, translations: { UA: 'Переглянути всі PDF у розділі', PL: 'Obejrzyj wszystkie PDF w sekcji', EN: 'View all PDFs in section' } },
        { category: 'learning', weight: 2, translations: { UA: 'Зробити конспект з 3 тем', PL: 'Zrób notatki z 3 tematów', EN: 'Make notes on 3 topics' } },
        { category: 'practice', weight: 2, translations: { UA: 'Написати 50 рядків коду', PL: 'Napisz 50 linii kodu', EN: 'Write 50 lines of code' } },
        { category: 'review', weight: 1, translations: { UA: 'Перевірити свої знання тестом', PL: 'Sprawdź swoją wiedzę testem', EN: 'Test your knowledge' } },
        // Last goals (g46-g50)
        { category: 'quiz', weight: 1, translations: { UA: 'Пройти складний квіз', PL: 'Przejdź trudny quiz', EN: 'Pass difficult quiz' } },
        { category: 'materials', weight: 1, translations: { UA: 'Вивчити відео-урок повністю', PL: 'Naucz się całej lekcji wideo', EN: 'Complete video lesson fully' } },
        { category: 'learning', weight: 2, translations: { UA: 'Вивчити алгоритм із прикладами', PL: 'Naucz się algorytmu z przykładami', EN: 'Learn algorithm with examples' } },
        { category: 'practice', weight: 1, translations: { UA: 'Виправити минулі помилки', PL: 'Popraw wcześniejsze błędy', EN: 'Fix previous mistakes' } },
        { category: 'review', weight: 1, translations: { UA: 'Підсумувати 3 вивчені теми', PL: 'Podsumuj 3 nauczone tematy', EN: 'Summarize 3 learned topics' } },
      ]
    })

    // Weak Spot Templates
    await prisma.weakSpotTemplate.createMany({
      data: [
        { 
          category: 'algorithms', 
          weight: 1, 
          translations: { 
            topic: { UA: 'Рекурсія', PL: 'Rekurencja', EN: 'Recursion' },
            advice: { UA: 'Перегляньте конспект та пройдіть додаткові тести', PL: 'Przejrzyj notatki i zrób dodatkowe testy', EN: 'Review notes and take additional tests' }
          }
        },
        { 
          category: 'sql', 
          weight: 1, 
          translations: { 
            topic: { UA: 'SQL INNER JOIN', PL: 'SQL INNER JOIN', EN: 'SQL INNER JOIN' },
            advice: { UA: 'Практикуйте з реальними прикладами даних', PL: 'Praktykuj z rzeczywistymi przykładami danych', EN: 'Practice with real data examples' }
          }
        },
        { 
          category: 'complexity', 
          weight: 1, 
          translations: { 
            topic: { UA: 'Big-O нотація', PL: 'Notacja Big-O', EN: 'Big-O Notation' },
            advice: { UA: 'Подивіться відео-пояснення та вирішіть 3 задачі', PL: 'Zobacz wyjaśnienie wideo i rozwiąż 3 zadania', EN: 'Watch video explanation and solve 3 problems' }
          }
        },
      ]
    })

    // Achievement Templates
    await prisma.achievementTemplate.createMany({
      data: [
        { 
          code: 'first_quiz', 
          icon: '🎯', 
          xpReward: 50,
          translations: { 
            name: { UA: 'Перший квіз', PL: 'Pierwszy quiz', EN: 'First Quiz' },
            description: { UA: 'Пройдіть свій перший квіз', PL: 'Ukończ swój pierwszy quiz', EN: 'Complete your first quiz' }
          }
        },
        { 
          code: 'week_streak', 
          icon: '🔥', 
          xpReward: 100,
          translations: { 
            name: { UA: 'Тиждень поспіль', PL: 'Tydzień z rzędu', EN: 'Week Streak' },
            description: { UA: 'Навчайтесь 7 днів поспіль', PL: 'Ucz się przez 7 dni z rzędu', EN: 'Study for 7 days in a row' }
          }
        },
        { 
          code: 'fast_answer', 
          icon: '⚡', 
          xpReward: 25,
          translations: { 
            name: { UA: 'Швидка відповідь', PL: 'Szybka odpowiedź', EN: 'Fast Answer' },
            description: { UA: 'Дайте правильну відповідь за 5 секунд', PL: 'Odpowiedz poprawnie w 5 sekund', EN: 'Answer correctly in 5 seconds' }
          }
        },
        { 
          code: 'sql_master', 
          icon: '🗃️', 
          xpReward: 200,
          translations: { 
            name: { UA: 'Майстер SQL', PL: 'Mistrz SQL', EN: 'SQL Master' },
            description: { UA: 'Пройдіть всі SQL квізи на 100%', PL: 'Ukończ wszystkie quizy SQL na 100%', EN: 'Complete all SQL quizzes with 100%' }
          }
        },
        { 
          code: 'perfect_score', 
          icon: '💯', 
          xpReward: 75,
          translations: { 
            name: { UA: 'Ідеальний результат', PL: 'Idealny wynik', EN: 'Perfect Score' },
            description: { UA: 'Отримайте 100% в будь-якому квізі', PL: 'Zdobądź 100% w dowolnym quizie', EN: 'Get 100% in any quiz' }
          }
        },
      ]
    })

    // ===== UI TRANSLATIONS (all ~170 keys) =====
    await prisma.uiTranslation.createMany({
      data: [
        // Common
        { key: 'app.name', translations: { UA: 'E-Learn', PL: 'E-Learn', EN: 'E-Learn' } },
        { key: 'common.loading', translations: { UA: 'Завантаження...', PL: 'Ładowanie...', EN: 'Loading...' } },
        { key: 'common.save', translations: { UA: 'Зберегти', PL: 'Zapisz', EN: 'Save' } },
        { key: 'common.cancel', translations: { UA: 'Скасувати', PL: 'Anuluj', EN: 'Cancel' } },
        { key: 'common.delete', translations: { UA: 'Видалити', PL: 'Usuń', EN: 'Delete' } },
        { key: 'common.edit', translations: { UA: 'Редагувати', PL: 'Edytuj', EN: 'Edit' } },
        { key: 'common.create', translations: { UA: 'Створити', PL: 'Utwórz', EN: 'Create' } },
        { key: 'common.close', translations: { UA: 'Закрити', PL: 'Zamknij', EN: 'Close' } },
        { key: 'common.continue', translations: { UA: 'Продовжити', PL: 'Kontynuuj', EN: 'Continue' } },
        { key: 'common.back', translations: { UA: 'Назад', PL: 'Wstecz', EN: 'Back' } },
        { key: 'common.completed', translations: { UA: 'Завершено', PL: 'Ukończono', EN: 'Completed' } },

        // Navigation
        { key: 'nav.dashboard', translations: { UA: 'Дашборд', PL: 'Panel', EN: 'Dashboard' } },
        { key: 'nav.materials', translations: { UA: 'Матеріали', PL: 'Materiały', EN: 'Materials' } },
        { key: 'nav.quiz', translations: { UA: 'Квізи', PL: 'Quiz', EN: 'Quiz' } },
        { key: 'nav.leaderboard', translations: { UA: 'Рейтинг', PL: 'Ranking', EN: 'Leaderboard' } },
        { key: 'nav.profile', translations: { UA: 'Профіль', PL: 'Profil', EN: 'Profile' } },
        { key: 'nav.editor', translations: { UA: 'Редактор', PL: 'Edytor', EN: 'Editor' } },
        { key: 'nav.login', translations: { UA: 'Увійти', PL: 'Zaloguj', EN: 'Login' } },
        { key: 'nav.register', translations: { UA: 'Реєстрація', PL: 'Rejestracja', EN: 'Register' } },
        { key: 'nav.logout', translations: { UA: 'Вийти', PL: 'Wyloguj', EN: 'Logout' } },

        // Dashboard
        { key: 'dashboard.welcome', translations: { UA: 'Вітаємо', PL: 'Witaj', EN: 'Welcome' } },
        { key: 'dashboard.level', translations: { UA: 'Рівень', PL: 'Poziom', EN: 'Level' } },
        { key: 'dashboard.nextLevel', translations: { UA: 'До наступного рівня', PL: 'Do następnego poziomu', EN: 'To next level' } },
        { key: 'dashboard.streak', translations: { UA: 'Стрік', PL: 'Seria', EN: 'Streak' } },
        { key: 'dashboard.days', translations: { UA: 'днів', PL: 'dni', EN: 'days' } },
        { key: 'dashboard.attempts', translations: { UA: 'Спроби', PL: 'Próby', EN: 'Attempts' } },
        { key: 'dashboard.time', translations: { UA: 'Час', PL: 'Czas', EN: 'Time' } },
        { key: 'dashboard.achievements', translations: { UA: 'Досягнення', PL: 'Osiągnięcia', EN: 'Achievements' } },
        { key: 'dashboard.dailyGoals', translations: { UA: 'Щоденні цілі', PL: 'Cele dzienne', EN: 'Daily Goals' } },
        { key: 'dashboard.continueLearning', translations: { UA: 'Продовжити навчання', PL: 'Kontynuuj naukę', EN: 'Continue Learning' } },
        { key: 'dashboard.recommended', translations: { UA: 'Рекомендовано підтягнути', PL: 'Zalecane do poprawy', EN: 'Recommended to improve' } },
        { key: 'dashboard.quickLinks', translations: { UA: 'Швидкі посилання', PL: 'Szybkie linki', EN: 'Quick Links' } },
        { key: 'dashboard.community', translations: { UA: 'Спільнота', PL: 'Społeczność', EN: 'Community' } },
        { key: 'dashboard.tipOfDay', translations: { UA: 'Порада дня', PL: 'Porada dnia', EN: 'Tip of the day' } },
        { key: 'dashboard.tipMessage', translations: { UA: 'Приділяйте 15 хвилин щодня практиці — це покращить результати на 40%!', PL: 'Poświęcaj 15 minut dziennie na praktykę — to poprawi wyniki o 40%!', EN: 'Spend 15 minutes daily on practice — it will improve results by 40%!' } },
        { key: 'dashboard.done', translations: { UA: 'Виконано', PL: 'Ukończone', EN: 'Done' } },
        { key: 'dashboard.pending', translations: { UA: 'В процесі', PL: 'W toku', EN: 'Pending' } },
        { key: 'dashboard.keepStreak', translations: { UA: 'Продовжуй навчатися щодня, щоб зберегти стрік!', PL: 'Ucz się codziennie, aby utrzymać serię!', EN: 'Keep learning daily to maintain your streak!' } },
        { key: 'dashboard.goToCourseChat', translations: { UA: 'Перейти до чату курсу', PL: 'Przejdź do czatu kursu', EN: 'Go to course chat' } },
        { key: 'dashboard.last7days', translations: { UA: '7 днів', PL: '7 dni', EN: '7 days' } },

        // Materials
        { key: 'materials.title', translations: { UA: 'Матеріали', PL: 'Materiały', EN: 'Materials' } },
        { key: 'materials.all', translations: { UA: 'Усі', PL: 'Wszystkie', EN: 'All' } },
        { key: 'materials.pdf', translations: { UA: 'PDF', PL: 'PDF', EN: 'PDF' } },
        { key: 'materials.video', translations: { UA: 'Відео', PL: 'Wideo', EN: 'Video' } },
        { key: 'materials.text', translations: { UA: 'Текст', PL: 'Tekst', EN: 'Text' } },
        { key: 'materials.link', translations: { UA: 'Посилання', PL: 'Link', EN: 'Link' } },
        { key: 'materials.progress', translations: { UA: 'Прогрес', PL: 'Postęp', EN: 'Progress' } },
        { key: 'materials.open', translations: { UA: 'Відкрити', PL: 'Otwórz', EN: 'Open' } },
        { key: 'materials.viewed', translations: { UA: 'Переглянуто', PL: 'Obejrzane', EN: 'Viewed' } },
        { key: 'materials.sections', translations: { UA: 'Розділи', PL: 'Sekcje', EN: 'Sections' } },
        { key: 'materials.searchPlaceholder', translations: { UA: 'Пошук матеріалів...', PL: 'Szukaj materiałów...', EN: 'Search materials...' } },
        { key: 'materials.suggestedNext', translations: { UA: 'Рекомендовано далі', PL: 'Polecane dalej', EN: 'Suggested next' } },

        // Categories
        { key: 'category.programming', translations: { UA: 'Програмування', PL: 'Programowanie', EN: 'Programming' } },
        { key: 'category.mathematics', translations: { UA: 'Математика', PL: 'Matematyka', EN: 'Mathematics' } },
        { key: 'category.databases', translations: { UA: 'Бази даних', PL: 'Bazy danych', EN: 'Databases' } },
        { key: 'category.networks', translations: { UA: 'Мережі', PL: 'Sieci', EN: 'Networks' } },

        // Quiz
        { key: 'quiz.title', translations: { UA: 'Квізи', PL: 'Quiz', EN: 'Quizzes' } },
        { key: 'quiz.mode', translations: { UA: 'Режим', PL: 'Tryb', EN: 'Mode' } },
        { key: 'quiz.practice', translations: { UA: 'Практика', PL: 'Praktyka', EN: 'Practice' } },
        { key: 'quiz.exam', translations: { UA: 'Екзамен', PL: 'Egzamin', EN: 'Exam' } },
        { key: 'quiz.selectQuiz', translations: { UA: 'Обери квіз', PL: 'Wybierz quiz', EN: 'Select quiz' } },
        { key: 'quiz.question', translations: { UA: 'Питання', PL: 'Pytanie', EN: 'Question' } },
        { key: 'quiz.of', translations: { UA: 'з', PL: 'z', EN: 'of' } },
        { key: 'quiz.time', translations: { UA: 'Час', PL: 'Czas', EN: 'Time' } },
        { key: 'quiz.result', translations: { UA: 'Результат', PL: 'Wynik', EN: 'Result' } },
        { key: 'quiz.completed', translations: { UA: 'Квіз завершено!', PL: 'Quiz ukończony!', EN: 'Quiz completed!' } },
        { key: 'quiz.congratulations', translations: { UA: 'Вітаємо з завершенням квізу!', PL: 'Gratulacje ukończenia quizu!', EN: 'Congratulations on completing the quiz!' } },
        { key: 'quiz.correctAnswers', translations: { UA: 'правильних відповідей', PL: 'poprawnych odpowiedzi', EN: 'correct answers' } },
        { key: 'quiz.tryAgain', translations: { UA: 'Спробувати знову', PL: 'Spróbuj ponownie', EN: 'Try again' } },
        { key: 'quiz.backToMaterials', translations: { UA: 'Повернутись до матеріалів', PL: 'Powrót do materiałów', EN: 'Back to materials' } },
        { key: 'quiz.hints', translations: { UA: 'Підказки', PL: 'Podpowiedzi', EN: 'Hints' } },
        { key: 'quiz.checklist', translations: { UA: 'Чек-лист', PL: 'Lista kontrolna', EN: 'Checklist' } },
        { key: 'quiz.answer', translations: { UA: 'Відповісти', PL: 'Odpowiedz', EN: 'Answer' } },
        { key: 'quiz.skip', translations: { UA: 'Пропустити', PL: 'Pomiń', EN: 'Skip' } },
        { key: 'quiz.next', translations: { UA: 'Далі', PL: 'Dalej', EN: 'Next' } },
        { key: 'quiz.finish', translations: { UA: 'Завершити квіз', PL: 'Zakończ quiz', EN: 'Finish quiz' } },
        { key: 'quiz.explanation', translations: { UA: 'Пояснення', PL: 'Wyjaśnienie', EN: 'Explanation' } },
        { key: 'quiz.loading', translations: { UA: 'Завантаження квізу...', PL: 'Ładowanie quizu...', EN: 'Loading quiz...' } },
        { key: 'quiz.explanationImmediate', translations: { UA: 'Пояснення одразу', PL: 'Wyjaśnienie od razu', EN: 'Instant explanation' } },
        { key: 'quiz.questionUnavailable', translations: { UA: 'Питання недоступне', PL: 'Pytanie niedostępne', EN: 'Question unavailable' } },
        { key: 'quiz.showAnswer', translations: { UA: 'Показати відповідь', PL: 'Pokaż odpowiedź', EN: 'Show answer' } },
        { key: 'quiz.nextQuestion', translations: { UA: 'Наступне питання', PL: 'Następne pytanie', EN: 'Next question' } },
        { key: 'quiz.hint.practice', translations: { UA: 'У режимі Практика ти отримуєш пояснення одразу', PL: 'W trybie Praktyka dostajesz wyjaśnienie od razu', EN: 'In Practice mode you get explanation immediately' } },
        { key: 'quiz.hint.exam', translations: { UA: 'У режимі Екзамен час обмежений і немає підказок', PL: 'W trybie Egzamin czas jest ograniczony i bez podpowiedzi', EN: 'In Exam mode time is limited and no hints' } },
        { key: 'quiz.hint.reviewMaterials', translations: { UA: 'Переглядай матеріали перед проходженням квізу', PL: 'Przejrzyj materiały przed quizem', EN: 'Review materials before taking the quiz' } },
        { key: 'quiz.checklist.reviewMaterials', translations: { UA: 'Переглянути матеріали', PL: 'Przejrzyj materiały', EN: 'Review materials' } },
        { key: 'quiz.checklist.pickMode', translations: { UA: 'Вибрати режим квізу', PL: 'Wybierz tryb quizu', EN: 'Choose quiz mode' } },
        { key: 'quiz.checklist.answerAll', translations: { UA: 'Відповісти на всі питання', PL: 'Odpowiedz na wszystkie pytania', EN: 'Answer all questions' } },
        { key: 'quiz.checklist.score75', translations: { UA: 'Отримати ≥75% правильних', PL: 'Zdobądź ≥75% poprawnych', EN: 'Score ≥75% correct' } },
        { key: 'quiz.noQuizzes', translations: { UA: 'Немає доступних квізів', PL: 'Brak dostępnych quizów', EN: 'No quizzes available' } },
        { key: 'quiz.history', translations: { UA: 'Історія спроб', PL: 'Historia prób', EN: 'Attempt history' } },
        { key: 'quiz.noHistory', translations: { UA: 'Ще немає спроб', PL: 'Brak prób', EN: 'No attempts yet' } },
        { key: 'quiz.loadingQuestion', translations: { UA: 'Завантаження питання...', PL: 'Ładowanie pytania...', EN: 'Loading question...' } },
        { key: 'quiz.error', translations: { UA: 'Сталася помилка. Спробуйте інший квіз.', PL: 'Wystąpił błąd. Spróbuj inny quiz.', EN: 'An error occurred. Try another quiz.' } },

        // Lesson
        { key: 'lesson.breadcrumb.algorithms', translations: { UA: 'Алгоритми', PL: 'Algorytmy', EN: 'Algorithms' } },
        { key: 'lesson.breadcrumb.search', translations: { UA: 'Пошук', PL: 'Wyszukiwanie', EN: 'Search' } },
        { key: 'lesson.breadcrumb.binarySearch', translations: { UA: 'Бінарний пошук', PL: 'Wyszukiwanie binarne', EN: 'Binary Search' } },
        { key: 'lesson.toc', translations: { UA: 'Зміст', PL: 'Spis treści', EN: 'Contents' } },
        { key: 'lesson.progress', translations: { UA: 'Прогрес', PL: 'Postęp', EN: 'Progress' } },
        { key: 'lesson.progressRequirement', translations: { UA: 'Умова завершення: переглянути ≥1 матеріал + квіз ≥75%', PL: 'Warunek: obejrzeć ≥1 materiał + quiz ≥75%', EN: 'Requirement: view ≥1 material + quiz ≥75%' } },
        { key: 'lesson.content.notes', translations: { UA: 'Конспект', PL: 'Notatki', EN: 'Notes' } },
        { key: 'lesson.content.video', translations: { UA: 'Відео', PL: 'Wideo', EN: 'Video' } },
        { key: 'lesson.content.quiz', translations: { UA: 'Квіз', PL: 'Quiz', EN: 'Quiz' } },
        { key: 'lesson.content.code', translations: { UA: 'Практика коду', PL: 'Praktyka kodu', EN: 'Code practice' } },
        { key: 'lesson.questionCounter', translations: { UA: 'Питання', PL: 'Pytanie', EN: 'Question' } },
        { key: 'lesson.explanationTitle', translations: { UA: 'Пояснення', PL: 'Wyjaśnienie', EN: 'Explanation' } },
        { key: 'lesson.placeholder', translations: { UA: 'Контент буде тут', PL: 'Treść będzie tutaj', EN: 'Content will be here' } },
        { key: 'lesson.run', translations: { UA: 'Запустити', PL: 'Uruchom', EN: 'Run' } },
        { key: 'lesson.tests', translations: { UA: 'Тести', PL: 'Testy', EN: 'Tests' } },
        { key: 'lesson.testTitle', translations: { UA: 'Тест', PL: 'Test', EN: 'Test' } },
        { key: 'lesson.hint.sortedOnly', translations: { UA: 'Бінарний пошук працює лише на відсортованих масивах', PL: 'Wyszukiwanie binarne działa tylko na posortowanych tablicach', EN: 'Binary search works only on sorted arrays' } },
        { key: 'lesson.hint.splitHalf', translations: { UA: 'На кожному кроці масив ділиться навпіл', PL: 'Na każdym kroku tablica dzieli się na pół', EN: 'Each step splits the array in half' } },
        { key: 'lesson.hint.complexity', translations: { UA: 'Складність завжди O(log n) у гіршому випадку', PL: 'Złożoność to zawsze O(log n) w najgorszym przypadku', EN: 'Complexity is always O(log n) in worst case' } },

        // Profile
        { key: 'profile.title', translations: { UA: 'Профіль', PL: 'Profil', EN: 'Profile' } },
        { key: 'profile.name', translations: { UA: "Ім'я", PL: 'Imię', EN: 'Name' } },
        { key: 'profile.email', translations: { UA: 'Email', PL: 'Email', EN: 'Email' } },
        { key: 'profile.xp', translations: { UA: 'XP', PL: 'XP', EN: 'XP' } },
        { key: 'profile.badges', translations: { UA: 'Бейджі', PL: 'Odznaki', EN: 'Badges' } },
        { key: 'profile.settings', translations: { UA: 'Налаштування', PL: 'Ustawienia', EN: 'Settings' } },
        { key: 'profile.language', translations: { UA: 'Мова інтерфейсу', PL: 'Język interfejsu', EN: 'Interface language' } },
        { key: 'profile.theme', translations: { UA: 'Тема', PL: 'Motyw', EN: 'Theme' } },
        { key: 'profile.light', translations: { UA: 'Світла', PL: 'Jasny', EN: 'Light' } },
        { key: 'profile.dark', translations: { UA: 'Темна', PL: 'Ciemny', EN: 'Dark' } },

        // Auth
        { key: 'auth.login', translations: { UA: 'Вхід', PL: 'Logowanie', EN: 'Login' } },
        { key: 'auth.register', translations: { UA: 'Реєстрація', PL: 'Rejestracja', EN: 'Register' } },
        { key: 'auth.password', translations: { UA: 'Пароль', PL: 'Hasło', EN: 'Password' } },
        { key: 'auth.signIn', translations: { UA: 'Увійти', PL: 'Zaloguj się', EN: 'Sign in' } },
        { key: 'auth.createAccount', translations: { UA: 'Створити акаунт', PL: 'Utwórz konto', EN: 'Create account' } },

        // Editor
        { key: 'editor.topics', translations: { UA: 'Теми', PL: 'Tematy', EN: 'Topics' } },
        { key: 'editor.materials', translations: { UA: 'Матеріали', PL: 'Materiały', EN: 'Materials' } },
        { key: 'editor.quizzes', translations: { UA: 'Квізи', PL: 'Quizy', EN: 'Quizzes' } },
        { key: 'editor.create', translations: { UA: 'Створити', PL: 'Utwórz', EN: 'Create' } },
        { key: 'editor.edit', translations: { UA: 'Редагувати', PL: 'Edytuj', EN: 'Edit' } },
        { key: 'editor.delete', translations: { UA: 'Видалити', PL: 'Usuń', EN: 'Delete' } },

        // Dashboard Content
        { key: 'dashboard.course.algorithms', translations: { UA: 'Основи Алгоритмів', PL: 'Podstawy Algorytmów', EN: 'Algorithm Basics' } },
        { key: 'dashboard.course.sql', translations: { UA: 'SQL для початківців', PL: 'SQL dla początkujących', EN: 'SQL for Beginners' } },
        { key: 'dashboard.lesson.quicksort', translations: { UA: 'Урок 5: QuickSort', PL: 'Lekcja 5: QuickSort', EN: 'Lesson 5: QuickSort' } },
        { key: 'dashboard.lesson.joins', translations: { UA: 'Урок 3: JOIN операції', PL: 'Lekcja 3: Operacje JOIN', EN: 'Lesson 3: JOIN Operations' } },
        { key: 'dashboard.goal.quiz', translations: { UA: 'Пройти 1 квіз', PL: 'Zrób 1 quiz', EN: 'Complete 1 quiz' } },
        { key: 'dashboard.goal.materials', translations: { UA: 'Переглянути 3 матеріали', PL: 'Obejrzyj 3 materiały', EN: 'View 3 materials' } },
        { key: 'dashboard.goal.concept', translations: { UA: 'Завчити нове поняття', PL: 'Naucz się nowej koncepcji', EN: 'Learn a new concept' } },
        { key: 'dashboard.weak.recursion', translations: { UA: 'Рекурсія', PL: 'Rekurencja', EN: 'Recursion' } },
        { key: 'dashboard.weak.recursion.advice', translations: { UA: 'Перегляньте конспект та пройдіть додаткові тести', PL: 'Przejrzyj notatki i zrób dodatkowe testy', EN: 'Review notes and take additional tests' } },
        { key: 'dashboard.weak.sqlJoin', translations: { UA: 'SQL INNER JOIN', PL: 'SQL INNER JOIN', EN: 'SQL INNER JOIN' } },
        { key: 'dashboard.weak.sqlJoin.advice', translations: { UA: 'Практикуйте з реальними прикладами даних', PL: 'Praktykuj z rzeczywistymi przykładami danych', EN: 'Practice with real data examples' } },
        { key: 'dashboard.weak.bigO', translations: { UA: 'Big-O нотація', PL: 'Notacja Big-O', EN: 'Big-O Notation' } },
        { key: 'dashboard.weak.bigO.advice', translations: { UA: 'Подивіться відео-пояснення та вирішіть 3 задачі', PL: 'Zobacz wyjaśnienie wideo i rozwiąż 3 zadania', EN: 'Watch video explanation and solve 3 problems' } },
        { key: 'dashboard.achievement.firstQuiz', translations: { UA: 'Перший квіз', PL: 'Pierwszy quiz', EN: 'First Quiz' } },
        { key: 'dashboard.achievement.weekStreak', translations: { UA: 'Тиждень поспіль', PL: 'Tydzień z rzędu', EN: 'Week Streak' } },
        { key: 'dashboard.achievement.fastAnswer', translations: { UA: 'Швидка відповідь', PL: 'Szybka odpowiedź', EN: 'Fast Answer' } },
        { key: 'dashboard.achievement.sqlMaster', translations: { UA: 'Майстер SQL', PL: 'Mistrz SQL', EN: 'SQL Master' } },
        { key: 'dashboard.weekday.mon', translations: { UA: 'Пн', PL: 'Pn', EN: 'Mon' } },
        { key: 'dashboard.weekday.tue', translations: { UA: 'Вт', PL: 'Wt', EN: 'Tue' } },
        { key: 'dashboard.weekday.wed', translations: { UA: 'Ср', PL: 'Śr', EN: 'Wed' } },
        { key: 'dashboard.weekday.thu', translations: { UA: 'Чт', PL: 'Cz', EN: 'Thu' } },
        { key: 'dashboard.weekday.fri', translations: { UA: 'Пт', PL: 'Pt', EN: 'Fri' } },
        { key: 'dashboard.weekday.sat', translations: { UA: 'Сб', PL: 'So', EN: 'Sat' } },
        { key: 'dashboard.weekday.sun', translations: { UA: 'Нд', PL: 'Nd', EN: 'Sun' } },
      ]
    })

    console.log('Seed OK (admin + all translations created)')
}

main().catch(e=>{ console.error(e); process.exit(1) })
    .finally(()=> prisma.$disconnect())

