import { Lang } from '@/store/i18n'

/**
 * TranslationKey - all available translation keys
 * Primary source: Database (UiTranslation table)
 * This file serves as TypeScript type definition and fallback
 */
export type TranslationKey = 
  // Common
  | 'app.name'
  | 'common.loading'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.close'
  | 'common.continue'
  | 'common.back'
  | 'common.completed'
  
  // Navigation
  | 'nav.dashboard'
  | 'nav.materials'
  | 'nav.quiz'
  | 'nav.leaderboard'
  | 'nav.profile'
  | 'nav.editor'
  | 'nav.login'
  | 'nav.register'
  | 'nav.logout'
  
  // Dashboard
  | 'dashboard.welcome'
  | 'dashboard.level'
  | 'dashboard.nextLevel'
  | 'dashboard.streak'
  | 'dashboard.days'
  | 'dashboard.attempts'
  | 'dashboard.time'
  | 'dashboard.achievements'
  | 'dashboard.dailyGoals'
  | 'dashboard.continueLearning'
  | 'dashboard.recommended'
  | 'dashboard.quickLinks'
  | 'dashboard.community'
  | 'dashboard.tipOfDay'
  | 'dashboard.tipMessage'
  | 'dashboard.done'
  | 'dashboard.pending'
  | 'dashboard.keepStreak'
  | 'dashboard.goToCourseChat'
  | 'dashboard.last7days'
  
  // Materials
  | 'materials.title'
  | 'materials.all'
  | 'materials.pdf'
  | 'materials.video'
  | 'materials.text'
  | 'materials.link'
  | 'materials.progress'
  | 'materials.open'
  | 'materials.viewed'
  | 'materials.sections'
  | 'materials.searchPlaceholder'
  | 'materials.suggestedNext'
  | 'materials.section'
  | 'materials.materialsCount'
  | 'materials.completedCount'
  | 'materials.chooseSectionTitle'
  | 'materials.chooseSectionDesc'
  | 'materials.subtopics'
  | 'materials.showAll'
  | 'materials.categoriesAvailable'
  | 'materials.completed'
  | 'materials.mainSection'
  | 'materials.subSection'
  | 'materials.noMaterials'
  | 'materials.openExternal'
  | 'materials.download'
  | 'materials.openInNewTab'
  | 'materials.externalLink'
  | 'materials.externalLinkDesc'
  | 'materials.goToResource'
  | 'materials.noContent'
  | 'materials.viewTime'
  | 'materials.viewAllMaterials'
  | 'materials.remaining'
  
  // Categories
  | 'category.programming'
  | 'category.mathematics'
  | 'category.databases'
  | 'category.networks'
  | 'category.webDevelopment'
  | 'category.mobileDevelopment'
  | 'category.machineLearning'
  | 'category.security'
  | 'category.devops'
  | 'category.operatingSystems'
  
  // Quiz
  | 'quiz.title'
  | 'quiz.mode'
  | 'quiz.practice'
  | 'quiz.exam'
  | 'quiz.selectQuiz'
  | 'quiz.question'
  | 'quiz.of'
  | 'quiz.time'
  | 'quiz.result'
  | 'quiz.completed'
  | 'quiz.congratulations'
  | 'quiz.correctAnswers'
  | 'quiz.tryAgain'
  | 'quiz.backToMaterials'
  | 'quiz.hints'
  | 'quiz.checklist'
  | 'quiz.answer'
  | 'quiz.skip'
  | 'quiz.next'
  | 'quiz.finish'
  | 'quiz.explanation'
  | 'quiz.loading'
  | 'quiz.explanationImmediate'
  | 'quiz.questionUnavailable'
  | 'quiz.showAnswer'
  | 'quiz.nextQuestion'
  | 'quiz.hint.practice'
  | 'quiz.hint.exam'
  | 'quiz.hint.reviewMaterials'
  | 'quiz.checklist.reviewMaterials'
  | 'quiz.checklist.pickMode'
  | 'quiz.checklist.answerAll'
  | 'quiz.checklist.score75'
  | 'quiz.noQuizzes'
  | 'quiz.history'
  | 'quiz.noHistory'
  | 'quiz.loadingQuestion'
  | 'quiz.error'
  | 'quiz.start'
  | 'quiz.tryAgainMessage'
  
  // Lesson
  | 'lesson.breadcrumb.algorithms'
  | 'lesson.breadcrumb.search'
  | 'lesson.breadcrumb.binarySearch'
  | 'lesson.toc'
  | 'lesson.progress'
  | 'lesson.progressRequirement'
  | 'lesson.content.notes'
  | 'lesson.content.video'
  | 'lesson.content.quiz'
  | 'lesson.content.code'
  | 'lesson.questionCounter'
  | 'lesson.explanationTitle'
  | 'lesson.placeholder'
  | 'lesson.run'
  | 'lesson.tests'
  | 'lesson.testTitle'
  | 'lesson.hint.sortedOnly'
  | 'lesson.hint.splitHalf'
  | 'lesson.hint.complexity'
  | 'lesson.step'
  
  // Profile
  | 'profile.title'
  | 'profile.name'
  | 'profile.email'
  | 'profile.xp'
  | 'profile.badges'
  | 'profile.settings'
  | 'profile.language'
  | 'profile.theme'
  | 'profile.light'
  | 'profile.dark'
  
  // Auth
  | 'auth.login'
  | 'auth.register'
  | 'auth.password'
  | 'auth.signIn'
  | 'auth.createAccount'
  
  // Editor
  | 'editor.topics'
  | 'editor.materials'
  | 'editor.quizzes'
  | 'editor.create'
  | 'editor.edit'
  | 'editor.delete'

  // Dashboard Content
  | 'dashboard.course.algorithms'
  | 'dashboard.course.sql'
  | 'dashboard.lesson.quicksort'
  | 'dashboard.lesson.joins'
  | 'dashboard.goal.quiz'
  | 'dashboard.goal.materials'
  | 'dashboard.goal.concept'
  | 'dashboard.weak.recursion'
  | 'dashboard.weak.recursion.advice'
  | 'dashboard.weak.sqlJoin'
  | 'dashboard.weak.sqlJoin.advice'
  | 'dashboard.weak.bigO'
  | 'dashboard.weak.bigO.advice'
  | 'dashboard.achievement.firstQuiz'
  | 'dashboard.achievement.weekStreak'
  | 'dashboard.achievement.fastAnswer'
  | 'dashboard.achievement.sqlMaster'
  | 'dashboard.weekday.mon'
  | 'dashboard.weekday.tue'
  | 'dashboard.weekday.wed'
  | 'dashboard.weekday.thu'
  | 'dashboard.weekday.fri'
  | 'dashboard.weekday.sat'
  | 'dashboard.weekday.sun'

type Translations = Record<Lang, Record<TranslationKey, string>>

/**
 * Local translations - used as fallback when API is unavailable
 * Primary data source is now PostgreSQL database (UiTranslation table)
 */
export const translations: Translations = {
  UA: {
    // Common
    'app.name': 'E-Learn',
    'common.loading': 'Завантаження...',
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.delete': 'Видалити',
    'common.edit': 'Редагувати',
    'common.create': 'Створити',
    'common.close': 'Закрити',
    'common.continue': 'Продовжити',
    'common.back': 'Назад',
    'common.completed': 'Завершено',
    
    // Navigation
    'nav.dashboard': 'Дашборд',
    'nav.materials': 'Матеріали',
    'nav.quiz': 'Квізи',
    'nav.leaderboard': 'Рейтинг',
    'nav.profile': 'Профіль',
    'nav.editor': 'Редактор',
    'nav.login': 'Увійти',
    'nav.register': 'Реєстрація',
    'nav.logout': 'Вийти',
    
    // Dashboard
    'dashboard.welcome': 'Вітаємо',
    'dashboard.level': 'Рівень',
    'dashboard.nextLevel': 'До наступного рівня',
    'dashboard.streak': 'Стрік',
    'dashboard.days': 'днів',
    'dashboard.attempts': 'Спроби',
    'dashboard.time': 'Час',
    'dashboard.achievements': 'Досягнення',
    'dashboard.dailyGoals': 'Щоденні цілі',
    'dashboard.continueLearning': 'Продовжити навчання',
    'dashboard.recommended': 'Рекомендовано підтягнути',
    'dashboard.quickLinks': 'Швидкі посилання',
    'dashboard.community': 'Спільнота',
    'dashboard.tipOfDay': 'Порада дня',
    'dashboard.tipMessage': 'Приділяйте 15 хвилин щодня практиці — це покращить результати на 40%!',

    'dashboard.done': 'Виконано',
    'dashboard.pending': 'В процесі',
    'dashboard.keepStreak': 'Продовжуй навчатися щодня, щоб зберегти стрік!',
    'dashboard.goToCourseChat': 'Перейти до чату курсу',
    
    // Materials
    'materials.title': 'Матеріали',
    'materials.all': 'Усі',
    'materials.pdf': 'PDF',
    'materials.video': 'Відео',
    'materials.text': 'Текст',
    'materials.link': 'Посилання',
    'materials.progress': 'Прогрес',
    'materials.open': 'Відкрити',
    'materials.viewed': 'Переглянуто',
    'materials.sections': 'Розділи',
    'materials.searchPlaceholder': 'Пошук матеріалів...',
    'materials.suggestedNext': 'Рекомендовано далі',
    'materials.section': 'Розділ',
    'materials.materialsCount': 'Матеріалів',
    'materials.completedCount': 'Пройдено',
    'materials.chooseSectionTitle': 'Обери розділ і розпочни маршрут',
    'materials.chooseSectionDesc': 'Кожен розділ містить конспекти, відео та міні-задачі. Рухайся послідовно та повертайся, щоб повторювати.',
    'materials.subtopics': 'Підтеми',
    'materials.showAll': 'Показати всі',
    'materials.categoriesAvailable': 'категорій доступно',
    'materials.completed': 'Завершено',
    'materials.mainSection': 'Основний розділ',
    'materials.subSection': 'Підрозділ',
    'materials.noMaterials': 'Матеріали відсутні',
    'materials.openExternal': 'Відкрити',
    'materials.download': 'Завантажити',
    'materials.openInNewTab': 'Відкрити у новій вкладці',
    'materials.externalLink': 'Зовнішнє посилання',
    'materials.externalLinkDesc': 'Цей матеріал знаходиться на зовнішньому ресурсі',
    'materials.goToResource': 'Перейти до ресурсу',
    'materials.noContent': 'Контент недоступний',
    'materials.viewTime': 'Час перегляду',
    'materials.viewAllMaterials': 'Перегляньте всі матеріали, щоб розблокувати тест',
    'materials.remaining': 'Залишилось',
    
    // Categories
    'category.programming': 'Програмування',
    'category.mathematics': 'Математика',
    'category.databases': 'Бази даних',
    'category.networks': 'Мережі',
    'category.webDevelopment': 'Веб-розробка',
    'category.mobileDevelopment': 'Мобільна розробка',
    'category.machineLearning': 'Машинне навчання',
    'category.security': 'Кібербезпека',
    'category.devops': 'DevOps',
    'category.operatingSystems': 'Операційні системи',
    
    // Quiz
    'quiz.title': 'Квізи',
    'quiz.mode': 'Режим',
    'quiz.practice': 'Практика',
    'quiz.exam': 'Екзамен',
    'quiz.selectQuiz': 'Обери квіз',
    'quiz.question': 'Питання',
    'quiz.of': 'з',
    'quiz.time': 'Час',
    'quiz.result': 'Результат',
    'quiz.completed': 'Квіз завершено!',
    'quiz.congratulations': 'Вітаємо з завершенням квізу!',
    'quiz.correctAnswers': 'правильних відповідей',
    'quiz.tryAgain': 'Спробувати знову',
    'quiz.backToMaterials': 'Повернутись до матеріалів',
    'quiz.hints': 'Підказки',
    'quiz.checklist': 'Чек-лист',
    'quiz.answer': 'Відповісти',
    'quiz.skip': 'Пропустити',
    'quiz.next': 'Далі',
    'quiz.finish': 'Завершити квіз',
    'quiz.explanation': 'Пояснення',
    'quiz.loading': 'Завантаження квізу...',
    'quiz.explanationImmediate': 'Пояснення одразу',
    'quiz.questionUnavailable': 'Питання недоступне',
    'quiz.showAnswer': 'Показати відповідь',
    'quiz.nextQuestion': 'Наступне питання',
    'quiz.hint.practice': 'У режимі Практика ти отримуєш пояснення одразу',
    'quiz.hint.exam': 'У режимі Екзамен час обмежений і немає підказок',
    'quiz.hint.reviewMaterials': 'Переглядай матеріали перед проходженням квізу',
    'quiz.checklist.reviewMaterials': 'Переглянути матеріали',
    'quiz.checklist.pickMode': 'Вибрати режим квізу',
    'quiz.checklist.answerAll': 'Відповісти на всі питання',
    'quiz.checklist.score75': 'Отримати ≥75% правильних',
    'quiz.noQuizzes': 'Немає доступних квізів',
    'quiz.history': 'Історія спроб',
    'quiz.noHistory': 'Ще немає спроб',
    'quiz.loadingQuestion': 'Завантаження питання...',
    'quiz.error': 'Сталася помилка. Спробуйте інший квіз.',
    'quiz.start': 'Почати тест',
    'quiz.tryAgainMessage': 'Спробуйте ще раз',
    
    // Lesson
    'lesson.breadcrumb.algorithms': 'Алгоритми',
    'lesson.breadcrumb.search': 'Пошук',
    'lesson.breadcrumb.binarySearch': 'Бінарний пошук',
    'lesson.toc': 'Зміст',
    'lesson.progress': 'Прогрес',
    'lesson.progressRequirement': 'Умова завершення: переглянути ≥1 матеріал + квіз ≥75%',
    'lesson.content.notes': 'Конспект',
    'lesson.content.video': 'Відео',
    'lesson.content.quiz': 'Квіз',
    'lesson.content.code': 'Практика коду',
    'lesson.questionCounter': 'Питання',
    'lesson.explanationTitle': 'Пояснення',
    'lesson.placeholder': 'Контент буде тут',
    'lesson.run': 'Запустити',
    'lesson.tests': 'Тести',
    'lesson.testTitle': 'Тест',
    'lesson.hint.sortedOnly': 'Бінарний пошук працює лише на відсортованих масивах',
    'lesson.hint.splitHalf': 'На кожному кроці масив ділиться навпіл',
    'lesson.hint.complexity': 'Складність завжди O(log n) у гіршому випадку',
    'lesson.step': 'Крок',
    
    // Profile
    'profile.title': 'Профіль',
    'profile.name': "Ім'я",
    'profile.email': 'Email',
    'profile.xp': 'XP',
    'profile.badges': 'Бейджі',
    'profile.settings': 'Налаштування',
    'profile.language': 'Мова інтерфейсу',
    'profile.theme': 'Тема',
    'profile.light': 'Світла',
    'profile.dark': 'Темна',
    
    // Auth
    'auth.login': 'Вхід',
    'auth.register': 'Реєстрація',
    'auth.password': 'Пароль',
    'auth.signIn': 'Увійти',
    'auth.createAccount': 'Створити акаунт',
    
    // Editor
    'editor.topics': 'Теми',
    'editor.materials': 'Матеріали',
    'editor.quizzes': 'Квізи',
    'editor.create': 'Створити',
    'editor.edit': 'Редагувати',
    'editor.delete': 'Видалити',

    // Dashboard Content
    'dashboard.course.algorithms': 'Основи Алгоритмів',
    'dashboard.course.sql': 'SQL для початківців',
    'dashboard.lesson.quicksort': 'Урок 5: QuickSort',
    'dashboard.lesson.joins': 'Урок 3: JOIN операції',
    'dashboard.goal.quiz': 'Пройти 1 квіз',
    'dashboard.goal.materials': 'Переглянути 3 матеріали',
    'dashboard.goal.concept': 'Завчити нове поняття',
    'dashboard.weak.recursion': 'Рекурсія',
    'dashboard.weak.recursion.advice': 'Перегляньте конспект та пройдіть додаткові тести',
    'dashboard.weak.sqlJoin': 'SQL INNER JOIN',
    'dashboard.weak.sqlJoin.advice': 'Практикуйте з реальними прикладами даних',
    'dashboard.weak.bigO': 'Big-O нотація',
    'dashboard.weak.bigO.advice': 'Подивіться відео-пояснення та вирішіть 3 задачі',
    'dashboard.achievement.firstQuiz': 'Перший квіз',
    'dashboard.achievement.weekStreak': 'Тиждень поспіль',
    'dashboard.achievement.fastAnswer': 'Швидка відповідь',
    'dashboard.achievement.sqlMaster': 'Майстер SQL',
    'dashboard.weekday.mon': 'Пн',
    'dashboard.weekday.tue': 'Вт',
    'dashboard.weekday.wed': 'Ср',
    'dashboard.weekday.thu': 'Чт',
    'dashboard.weekday.fri': 'Пт',
    'dashboard.weekday.sat': 'Сб',
    'dashboard.weekday.sun': 'Нд',
    'dashboard.last7days': '7 днів',
  },
  
  PL: {
    // Common
    'app.name': 'E-Learn',
    'common.loading': 'Ładowanie...',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.delete': 'Usuń',
    'common.edit': 'Edytuj',
    'common.create': 'Utwórz',
    'common.close': 'Zamknij',
    'common.continue': 'Kontynuuj',
    'common.back': 'Wstecz',
    'common.completed': 'Ukończono',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.materials': 'Materiały',
    'nav.quiz': 'Quiz',
    'nav.leaderboard': 'Ranking',
    'nav.profile': 'Profil',
    'nav.editor': 'Edytor',
    'nav.login': 'Zaloguj',
    'nav.register': 'Rejestracja',
    'nav.logout': 'Wyloguj',
    
    // Dashboard
    'dashboard.welcome': 'Witaj',
    'dashboard.level': 'Poziom',
    'dashboard.nextLevel': 'Do następnego poziomu',
    'dashboard.streak': 'Seria',
    'dashboard.days': 'dni',
    'dashboard.attempts': 'Próby',
    'dashboard.time': 'Czas',
    'dashboard.achievements': 'Osiągnięcia',
    'dashboard.dailyGoals': 'Cele dzienne',
    'dashboard.continueLearning': 'Kontynuuj naukę',
    'dashboard.recommended': 'Zalecane do poprawy',
    'dashboard.quickLinks': 'Szybkie linki',
    'dashboard.community': 'Społeczność',
    'dashboard.tipOfDay': 'Porada dnia',
    'dashboard.tipMessage': 'Poświęcaj 15 minut dziennie na praktykę — to poprawi wyniki o 40%!',

    'dashboard.done': 'Ukończone',
    'dashboard.pending': 'W toku',
    'dashboard.keepStreak': 'Ucz się codziennie, aby utrzymać serię!',
    'dashboard.goToCourseChat': 'Przejdź do czatu kursu',
    
    // Materials
    'materials.title': 'Materiały',
    'materials.all': 'Wszystkie',
    'materials.pdf': 'PDF',
    'materials.video': 'Wideo',
    'materials.text': 'Tekst',
    'materials.link': 'Link',
    'materials.progress': 'Postęp',
    'materials.open': 'Otwórz',
    'materials.viewed': 'Obejrzane',
    'materials.sections': 'Sekcje',
    'materials.searchPlaceholder': 'Szukaj materiałów...',
    'materials.suggestedNext': 'Polecane dalej',
    'materials.section': 'Sekcja',
    'materials.materialsCount': 'Materiałów',
    'materials.completedCount': 'Ukończono',
    'materials.chooseSectionTitle': 'Wybierz sekcję i zacznij naukę',
    'materials.chooseSectionDesc': 'Każda sekcja zawiera notatki, filmy i mini-zadania. Ucz się po kolei i wracaj do powtórek.',
    'materials.subtopics': 'Podtematy',
    'materials.showAll': 'Pokaż wszystko',
    'materials.categoriesAvailable': 'dostępnych kategorii',
    'materials.completed': 'Ukończono',
    'materials.mainSection': 'Główna sekcja',
    'materials.subSection': 'Podsekcja',
    'materials.noMaterials': 'Brak materiałów',
    'materials.openExternal': 'Otwórz',
    'materials.download': 'Pobierz',
    'materials.openInNewTab': 'Otwórz w nowej karcie',
    'materials.externalLink': 'Link zewnętrzny',
    'materials.externalLinkDesc': 'Ten materiał znajduje się na zewnętrznym zasobie',
    'materials.goToResource': 'Przejdź do zasobu',
    'materials.noContent': 'Treść niedostępna',
    'materials.viewTime': 'Czas oglądania',
    'materials.viewAllMaterials': 'Obejrzyj wszystkie materiały, aby odblokować test',
    'materials.remaining': 'Pozostało',
    
    // Categories
    'category.programming': 'Programowanie',
    'category.mathematics': 'Matematyka',
    'category.databases': 'Bazy danych',
    'category.networks': 'Sieci',
    'category.webDevelopment': 'Tworzenie stron',
    'category.mobileDevelopment': 'Rozwój mobilny',
    'category.machineLearning': 'Uczenie maszynowe',
    'category.security': 'Cyberbezpieczeństwo',
    'category.devops': 'DevOps',
    'category.operatingSystems': 'Systemy operacyjne',
    
    // Quiz
    'quiz.title': 'Quiz',
    'quiz.mode': 'Tryb',
    'quiz.practice': 'Praktyka',
    'quiz.exam': 'Egzamin',
    'quiz.selectQuiz': 'Wybierz quiz',
    'quiz.question': 'Pytanie',
    'quiz.of': 'z',
    'quiz.time': 'Czas',
    'quiz.result': 'Wynik',
    'quiz.completed': 'Quiz ukończony!',
    'quiz.congratulations': 'Gratulacje ukończenia quizu!',
    'quiz.correctAnswers': 'poprawnych odpowiedzi',
    'quiz.tryAgain': 'Spróbuj ponownie',
    'quiz.backToMaterials': 'Powrót do materiałów',
    'quiz.hints': 'Podpowiedzi',
    'quiz.checklist': 'Lista kontrolna',
    'quiz.answer': 'Odpowiedz',
    'quiz.skip': 'Pomiń',
    'quiz.next': 'Dalej',
    'quiz.finish': 'Zakończ quiz',
    'quiz.explanation': 'Wyjaśnienie',
    'quiz.loading': 'Ładowanie quizu...',
    'quiz.explanationImmediate': 'Wyjaśnienie od razu',
    'quiz.questionUnavailable': 'Pytanie niedostępne',
    'quiz.showAnswer': 'Pokaż odpowiedź',
    'quiz.nextQuestion': 'Następne pytanie',
    'quiz.hint.practice': 'W trybie Praktyka dostajesz wyjaśnienie od razu',
    'quiz.hint.exam': 'W trybie Egzamin czas jest ograniczony i bez podpowiedzi',
    'quiz.hint.reviewMaterials': 'Przejrzyj materiały przed quizem',
    'quiz.checklist.reviewMaterials': 'Przejrzyj materiały',
    'quiz.checklist.pickMode': 'Wybierz tryb quizu',
    'quiz.checklist.answerAll': 'Odpowiedz na wszystkie pytania',
    'quiz.checklist.score75': 'Zdobądź ≥75% poprawnych',
    'quiz.noQuizzes': 'Brak dostępnych quizów',
    'quiz.history': 'Historia prób',
    'quiz.noHistory': 'Brak prób',
    'quiz.loadingQuestion': 'Ładowanie pytania...',
    'quiz.error': 'Wystąpił błąd. Spróbuj inny quiz.',
    'quiz.start': 'Rozpocznij test',
    'quiz.tryAgainMessage': 'Spróbuj ponownie',
    
    // Lesson
    'lesson.breadcrumb.algorithms': 'Algoryтми',
    'lesson.breadcrumb.search': 'Wyszukiwanie',
    'lesson.breadcrumb.binarySearch': 'Wyszukiwanie binarne',
    'lesson.toc': 'Spis treści',
    'lesson.progress': 'Postęp',
    'lesson.progressRequirement': 'Warunek: obejrzeć ≥1 materiał + quiz ≥75%',
    'lesson.content.notes': 'Notatki',
    'lesson.content.video': 'Wideo',
    'lesson.content.quiz': 'Quiz',
    'lesson.content.code': 'Praktyka kodu',
    'lesson.questionCounter': 'Pytanie',
    'lesson.explanationTitle': 'Wyjaśnienie',
    'lesson.placeholder': 'Treść będzie tutaj',
    'lesson.run': 'Uruchom',
    'lesson.tests': 'Testy',
    'lesson.testTitle': 'Test',
    'lesson.hint.sortedOnly': 'Wyszukiwanie binarne działa tylko na posortowanych tablicach',
    'lesson.hint.splitHalf': 'Na każdym kroku tablica dzieli się na pół',
    'lesson.hint.complexity': 'Złożoność to zawsze O(log n) w najgorszym przypadku',
    'lesson.step': 'Krok',
    
    // Profile
    'profile.title': 'Profil',
    'profile.name': 'Imię',
    'profile.email': 'Email',
    'profile.xp': 'XP',
    'profile.badges': 'Odznaki',
    'profile.settings': 'Ustawienia',
    'profile.language': 'Język interfejsu',
    'profile.theme': 'Motyw',
    'profile.light': 'Jasny',
    'profile.dark': 'Ciemny',
    
    // Auth
    'auth.login': 'Logowanie',
    'auth.register': 'Rejestracja',
    'auth.password': 'Hasło',
    'auth.signIn': 'Zaloguj się',
    'auth.createAccount': 'Utwórz konto',
    
    // Editor
    'editor.topics': 'Tematy',
    'editor.materials': 'Materiały',
    'editor.quizzes': 'Quizy',
    'editor.create': 'Utwórz',
    'editor.edit': 'Edytuj',
    'editor.delete': 'Usuń',

    // Dashboard Content
    'dashboard.course.algorithms': 'Podstawy Algorytmów',
    'dashboard.course.sql': 'SQL dla początkujących',
    'dashboard.lesson.quicksort': 'Lekcja 5: QuickSort',
    'dashboard.lesson.joins': 'Lekcja 3: Operacje JOIN',
    'dashboard.goal.quiz': 'Zrób 1 quiz',
    'dashboard.goal.materials': 'Obejrzyj 3 materiały',
    'dashboard.goal.concept': 'Naucz się nowej koncepcji',
    'dashboard.weak.recursion': 'Rekurencja',
    'dashboard.weak.recursion.advice': 'Przejrzyj notatki i zrób dodatkowe testy',
    'dashboard.weak.sqlJoin': 'SQL INNER JOIN',
    'dashboard.weak.sqlJoin.advice': 'Praktykuj z rzeczywistymi przykładami danych',
    'dashboard.weak.bigO': 'Notacja Big-O',
    'dashboard.weak.bigO.advice': 'Zobacz wyjaśnienie wideo i rozwiąż 3 zadania',
    'dashboard.achievement.firstQuiz': 'Pierwszy quiz',
    'dashboard.achievement.weekStreak': 'Tydzień z rzędu',
    'dashboard.achievement.fastAnswer': 'Szybka odpowiedź',
    'dashboard.achievement.sqlMaster': 'Mistrz SQL',
    'dashboard.weekday.mon': 'Pn',
    'dashboard.weekday.tue': 'Wt',
    'dashboard.weekday.wed': 'Śr',
    'dashboard.weekday.thu': 'Cz',
    'dashboard.weekday.fri': 'Pt',
    'dashboard.weekday.sat': 'So',
    'dashboard.weekday.sun': 'Nd',
    'dashboard.last7days': '7 dni',
  },
  
  EN: {
    // Common
    'app.name': 'E-Learn',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.close': 'Close',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.completed': 'Completed',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.materials': 'Materials',
    'nav.quiz': 'Quiz',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',
    'nav.editor': 'Editor',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.level': 'Level',
    'dashboard.nextLevel': 'To next level',
    'dashboard.streak': 'Streak',
    'dashboard.days': 'days',
    'dashboard.attempts': 'Attempts',
    'dashboard.time': 'Time',
    'dashboard.achievements': 'Achievements',
    'dashboard.dailyGoals': 'Daily Goals',
    'dashboard.continueLearning': 'Continue Learning',
    'dashboard.recommended': 'Recommended to improve',
    'dashboard.quickLinks': 'Quick Links',
    'dashboard.community': 'Community',
    'dashboard.tipOfDay': 'Tip of the day',
    'dashboard.tipMessage': 'Spend 15 minutes daily on practice — it will improve results by 40%!',

    'dashboard.done': 'Done',
    'dashboard.pending': 'Pending',
    'dashboard.keepStreak': 'Keep learning daily to maintain your streak!',
    'dashboard.goToCourseChat': 'Go to course chat',
    
    // Materials
    'materials.title': 'Materials',
    'materials.all': 'All',
    'materials.pdf': 'PDF',
    'materials.video': 'Video',
    'materials.text': 'Text',
    'materials.link': 'Link',
    'materials.progress': 'Progress',
    'materials.open': 'Open',
    'materials.viewed': 'Viewed',
    'materials.sections': 'Sections',
    'materials.searchPlaceholder': 'Search materials...',
    'materials.suggestedNext': 'Suggested next',
    'materials.section': 'Section',
    'materials.materialsCount': 'Materials',
    'materials.completedCount': 'Completed',
    'materials.chooseSectionTitle': 'Choose a section and start learning',
    'materials.chooseSectionDesc': 'Each section contains notes, videos and mini-tasks. Move sequentially and come back to review.',
    'materials.subtopics': 'Subtopics',
    'materials.showAll': 'Show all',
    'materials.categoriesAvailable': 'categories available',
    'materials.completed': 'Completed',
    'materials.mainSection': 'Main section',
    'materials.subSection': 'Subsection',
    'materials.noMaterials': 'No materials available',
    'materials.openExternal': 'Open',
    'materials.download': 'Download',
    'materials.openInNewTab': 'Open in new tab',
    'materials.externalLink': 'External link',
    'materials.externalLinkDesc': 'This material is located on an external resource',
    'materials.goToResource': 'Go to resource',
    'materials.noContent': 'Content unavailable',
    'materials.viewTime': 'View time',
    'materials.viewAllMaterials': 'View all materials to unlock the test',
    'materials.remaining': 'Remaining',
    
    // Categories
    'category.programming': 'Programming',
    'category.mathematics': 'Mathematics',
    'category.databases': 'Databases',
    'category.networks': 'Networks',
    'category.webDevelopment': 'Web Development',
    'category.mobileDevelopment': 'Mobile Development',
    'category.machineLearning': 'Machine Learning',
    'category.security': 'Cybersecurity',
    'category.devops': 'DevOps',
    'category.operatingSystems': 'Operating Systems',
    
    // Quiz
    'quiz.title': 'Quizzes',
    'quiz.mode': 'Mode',
    'quiz.practice': 'Practice',
    'quiz.exam': 'Exam',
    'quiz.selectQuiz': 'Select quiz',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.time': 'Time',
    'quiz.result': 'Result',
    'quiz.completed': 'Quiz completed!',
    'quiz.congratulations': 'Congratulations on completing the quiz!',
    'quiz.correctAnswers': 'correct answers',
    'quiz.tryAgain': 'Try again',
    'quiz.backToMaterials': 'Back to materials',
    'quiz.hints': 'Hints',
    'quiz.checklist': 'Checklist',
    'quiz.answer': 'Answer',
    'quiz.skip': 'Skip',
    'quiz.next': 'Next',
    'quiz.finish': 'Finish quiz',
    'quiz.explanation': 'Explanation',
    'quiz.loading': 'Loading quiz...',
    'quiz.explanationImmediate': 'Instant explanation',
    'quiz.questionUnavailable': 'Question unavailable',
    'quiz.showAnswer': 'Show answer',
    'quiz.nextQuestion': 'Next question',
    'quiz.hint.practice': 'In Practice mode you get explanation immediately',
    'quiz.hint.exam': 'In Exam mode time is limited and no hints',
    'quiz.hint.reviewMaterials': 'Review materials before taking the quiz',
    'quiz.checklist.reviewMaterials': 'Review materials',
    'quiz.checklist.pickMode': 'Choose quiz mode',
    'quiz.checklist.answerAll': 'Answer all questions',
    'quiz.checklist.score75': 'Score ≥75% correct',
    'quiz.noQuizzes': 'No quizzes available',
    'quiz.history': 'Attempt history',
    'quiz.noHistory': 'No attempts yet',
    'quiz.loadingQuestion': 'Loading question...',
    'quiz.error': 'An error occurred. Try another quiz.',
    'quiz.start': 'Start test',
    'quiz.tryAgainMessage': 'Try again',
    
    // Lesson
    'lesson.breadcrumb.algorithms': 'Algorithms',
    'lesson.breadcrumb.search': 'Search',
    'lesson.breadcrumb.binarySearch': 'Binary Search',
    'lesson.toc': 'Contents',
    'lesson.progress': 'Progress',
    'lesson.progressRequirement': 'Requirement: view ≥1 material + quiz ≥75%',
    'lesson.content.notes': 'Notes',
    'lesson.content.video': 'Video',
    'lesson.content.quiz': 'Quiz',
    'lesson.content.code': 'Code practice',
    'lesson.questionCounter': 'Question',
    'lesson.explanationTitle': 'Explanation',
    'lesson.placeholder': 'Content will be here',
    'lesson.run': 'Run',
    'lesson.tests': 'Tests',
    'lesson.testTitle': 'Test',
    'lesson.hint.sortedOnly': 'Binary search works only on sorted arrays',
    'lesson.hint.splitHalf': 'Each step splits the array in half',
    'lesson.hint.complexity': 'Complexity is always O(log n) in worst case',
    'lesson.step': 'Step',
    // Profile
    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.xp': 'XP',
    'profile.badges': 'Badges',
    'profile.settings': 'Settings',
    'profile.language': 'Interface language',
    'profile.theme': 'Theme',
    'profile.light': 'Light',
    'profile.dark': 'Dark',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.password': 'Password',
    'auth.signIn': 'Sign in',
    'auth.createAccount': 'Create account',
    
    // Editor
    'editor.topics': 'Topics',
    'editor.materials': 'Materials',
    'editor.quizzes': 'Quizzes',
    'editor.create': 'Create',
    'editor.edit': 'Edit',
    'editor.delete': 'Delete',

    // Dashboard Content
    'dashboard.course.algorithms': 'Algorithm Basics',
    'dashboard.course.sql': 'SQL for Beginners',
    'dashboard.lesson.quicksort': 'Lesson 5: QuickSort',
    'dashboard.lesson.joins': 'Lesson 3: JOIN Operations',
    'dashboard.goal.quiz': 'Complete 1 quiz',
    'dashboard.goal.materials': 'View 3 materials',
    'dashboard.goal.concept': 'Learn a new concept',
    'dashboard.weak.recursion': 'Recursion',
    'dashboard.weak.recursion.advice': 'Review notes and take additional tests',
    'dashboard.weak.sqlJoin': 'SQL INNER JOIN',
    'dashboard.weak.sqlJoin.advice': 'Practice with real data examples',
    'dashboard.weak.bigO': 'Big-O Notation',
    'dashboard.weak.bigO.advice': 'Watch video explanation and solve 3 problems',
    'dashboard.achievement.firstQuiz': 'First Quiz',
    'dashboard.achievement.weekStreak': 'Week Streak',
    'dashboard.achievement.fastAnswer': 'Fast Answer',
    'dashboard.achievement.sqlMaster': 'SQL Master',
    'dashboard.weekday.mon': 'Mon',
    'dashboard.weekday.tue': 'Tue',
    'dashboard.weekday.wed': 'Wed',
    'dashboard.weekday.thu': 'Thu',
    'dashboard.weekday.fri': 'Fri',
    'dashboard.weekday.sat': 'Sat',
    'dashboard.weekday.sun': 'Sun',
    'dashboard.last7days': '7 days',
  },
}

export function t(key: TranslationKey, lang: Lang): string {
  return translations[lang]?.[key] || translations['EN'][key] || key
}
