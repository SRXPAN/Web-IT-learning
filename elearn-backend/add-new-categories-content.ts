// add-new-categories-content.ts
// Скрипт для додавання контенту нових категорій
import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

async function upsertTopic(slug: string, data: {
  name: string
  nameJson: { UA: string; PL: string; EN: string }
  description: string
  descJson: { UA: string; PL: string; EN: string }
  category: string
  parentId?: string | null
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
      category: data.category as any,
      parentId: data.parentId,
      status: 'Published',
      publishedAt: new Date(),
    },
  })
  console.log(`  ✓ Created topic "${slug}"`)
  return topic
}

async function main() {
  console.log('🚀 Adding content for new categories...\n')

  // ==================== WEB DEVELOPMENT ====================
  console.log('🌐 WEB DEVELOPMENT topics:')
  
  const webDev = await upsertTopic('web-development-basics', {
    name: 'Web Development Basics',
    nameJson: { UA: 'Основи веб-розробки', PL: 'Podstawy tworzenia stron', EN: 'Web Development Basics' },
    description: 'HTML, CSS, JavaScript fundamentals',
    descJson: { UA: 'Основи HTML, CSS, JavaScript', PL: 'Podstawy HTML, CSS, JavaScript', EN: 'HTML, CSS, JavaScript fundamentals' },
    category: 'WebDevelopment',
  })

  await upsertTopic('html-basics', {
    name: 'HTML Basics',
    nameJson: { UA: 'Основи HTML', PL: 'Podstawy HTML', EN: 'HTML Basics' },
    description: 'HTML tags and structure',
    descJson: { UA: 'HTML теги та структура', PL: 'Tagi HTML i struktura', EN: 'HTML tags and structure' },
    category: 'WebDevelopment',
    parentId: webDev.id,
  })

  await upsertTopic('css-styling', {
    name: 'CSS Styling',
    nameJson: { UA: 'CSS стилізація', PL: 'Stylowanie CSS', EN: 'CSS Styling' },
    description: 'Selectors, flexbox, grid',
    descJson: { UA: 'Селектори, flexbox, grid', PL: 'Selektory, flexbox, grid', EN: 'Selectors, flexbox, grid' },
    category: 'WebDevelopment',
    parentId: webDev.id,
  })

  await upsertTopic('javascript-dom', {
    name: 'JavaScript DOM',
    nameJson: { UA: 'JavaScript DOM', PL: 'JavaScript DOM', EN: 'JavaScript DOM' },
    description: 'DOM manipulation and events',
    descJson: { UA: 'Маніпуляції з DOM та події', PL: 'Manipulacja DOM i zdarzenia', EN: 'DOM manipulation and events' },
    category: 'WebDevelopment',
    parentId: webDev.id,
  })

  const frameworks = await upsertTopic('frontend-frameworks', {
    name: 'Frontend Frameworks',
    nameJson: { UA: 'Фронтенд фреймворки', PL: 'Frameworki frontendowe', EN: 'Frontend Frameworks' },
    description: 'React, Vue, Angular',
    descJson: { UA: 'React, Vue, Angular', PL: 'React, Vue, Angular', EN: 'React, Vue, Angular' },
    category: 'WebDevelopment',
  })

  await upsertTopic('react-basics', {
    name: 'React Basics',
    nameJson: { UA: 'Основи React', PL: 'Podstawy React', EN: 'React Basics' },
    description: 'Components, hooks, state',
    descJson: { UA: 'Компоненти, хуки, стан', PL: 'Komponenty, hooki, stan', EN: 'Components, hooks, state' },
    category: 'WebDevelopment',
    parentId: frameworks.id,
  })

  await upsertTopic('vue-basics', {
    name: 'Vue.js Basics',
    nameJson: { UA: 'Основи Vue.js', PL: 'Podstawy Vue.js', EN: 'Vue.js Basics' },
    description: 'Vue components, composition API',
    descJson: { UA: 'Vue компоненти, Composition API', PL: 'Komponenty Vue, Composition API', EN: 'Vue components, composition API' },
    category: 'WebDevelopment',
    parentId: frameworks.id,
  })

  // ==================== MOBILE DEVELOPMENT ====================
  console.log('\n📱 MOBILE DEVELOPMENT topics:')
  
  const mobileDev = await upsertTopic('mobile-dev-intro', {
    name: 'Mobile Development Intro',
    nameJson: { UA: 'Вступ до мобільної розробки', PL: 'Wprowadzenie do rozwoju mobilnego', EN: 'Mobile Development Intro' },
    description: 'Native vs Cross-platform',
    descJson: { UA: 'Нативна vs кросплатформна', PL: 'Natywne vs wieloplatformowe', EN: 'Native vs Cross-platform' },
    category: 'MobileDevelopment',
  })

  await upsertTopic('react-native', {
    name: 'React Native',
    nameJson: { UA: 'React Native', PL: 'React Native', EN: 'React Native' },
    description: 'Cross-platform mobile apps',
    descJson: { UA: 'Кросплатформні мобільні додатки', PL: 'Aplikacje mobilne wieloplatformowe', EN: 'Cross-platform mobile apps' },
    category: 'MobileDevelopment',
    parentId: mobileDev.id,
  })

  await upsertTopic('flutter', {
    name: 'Flutter',
    nameJson: { UA: 'Flutter', PL: 'Flutter', EN: 'Flutter' },
    description: 'Google UI toolkit',
    descJson: { UA: 'Google UI інструментарій', PL: 'Zestaw narzędzi Google UI', EN: 'Google UI toolkit' },
    category: 'MobileDevelopment',
    parentId: mobileDev.id,
  })

  await upsertTopic('android-kotlin', {
    name: 'Android with Kotlin',
    nameJson: { UA: 'Android з Kotlin', PL: 'Android z Kotlin', EN: 'Android with Kotlin' },
    description: 'Native Android development',
    descJson: { UA: 'Нативна Android розробка', PL: 'Natywny rozwój Android', EN: 'Native Android development' },
    category: 'MobileDevelopment',
  })

  await upsertTopic('ios-swift', {
    name: 'iOS with Swift',
    nameJson: { UA: 'iOS зі Swift', PL: 'iOS ze Swift', EN: 'iOS with Swift' },
    description: 'Native iOS development',
    descJson: { UA: 'Нативна iOS розробка', PL: 'Natywny rozwój iOS', EN: 'Native iOS development' },
    category: 'MobileDevelopment',
  })

  // ==================== MACHINE LEARNING ====================
  console.log('\n🤖 MACHINE LEARNING topics:')
  
  const mlBasics = await upsertTopic('ml-basics', {
    name: 'Machine Learning Basics',
    nameJson: { UA: 'Основи машинного навчання', PL: 'Podstawy uczenia maszynowego', EN: 'Machine Learning Basics' },
    description: 'Supervised, unsupervised learning',
    descJson: { UA: 'Контрольоване, неконтрольоване навчання', PL: 'Uczenie nadzorowane, nienadzorowane', EN: 'Supervised, unsupervised learning' },
    category: 'MachineLearning',
  })

  await upsertTopic('linear-regression', {
    name: 'Linear Regression',
    nameJson: { UA: 'Лінійна регресія', PL: 'Regresja liniowa', EN: 'Linear Regression' },
    description: 'Prediction and fitting',
    descJson: { UA: 'Передбачення та апроксимація', PL: 'Predykcja i dopasowanie', EN: 'Prediction and fitting' },
    category: 'MachineLearning',
    parentId: mlBasics.id,
  })

  await upsertTopic('classification', {
    name: 'Classification',
    nameJson: { UA: 'Класифікація', PL: 'Klasyfikacja', EN: 'Classification' },
    description: 'Logistic regression, SVM',
    descJson: { UA: 'Логістична регресія, SVM', PL: 'Regresja logistyczna, SVM', EN: 'Logistic regression, SVM' },
    category: 'MachineLearning',
    parentId: mlBasics.id,
  })

  const deepLearning = await upsertTopic('deep-learning', {
    name: 'Deep Learning',
    nameJson: { UA: 'Глибинне навчання', PL: 'Głębokie uczenie', EN: 'Deep Learning' },
    description: 'Neural networks, CNN, RNN',
    descJson: { UA: 'Нейронні мережі, CNN, RNN', PL: 'Sieci neuronowe, CNN, RNN', EN: 'Neural networks, CNN, RNN' },
    category: 'MachineLearning',
  })

  await upsertTopic('neural-networks', {
    name: 'Neural Networks',
    nameJson: { UA: 'Нейронні мережі', PL: 'Sieci neuronowe', EN: 'Neural Networks' },
    description: 'Perceptrons, backpropagation',
    descJson: { UA: 'Перцептрони, зворотне поширення', PL: 'Perceptrony, propagacja wsteczna', EN: 'Perceptrons, backpropagation' },
    category: 'MachineLearning',
    parentId: deepLearning.id,
  })

  await upsertTopic('computer-vision', {
    name: 'Computer Vision',
    nameJson: { UA: "Комп'ютерний зір", PL: 'Widzenie komputerowe', EN: 'Computer Vision' },
    description: 'Image classification, object detection',
    descJson: { UA: 'Класифікація зображень, виявлення об\'єктів', PL: 'Klasyfikacja obrazów, wykrywanie obiektów', EN: 'Image classification, object detection' },
    category: 'MachineLearning',
    parentId: deepLearning.id,
  })

  // ==================== SECURITY ====================
  console.log('\n🔒 SECURITY topics:')
  
  const securityBasics = await upsertTopic('security-basics', {
    name: 'Cybersecurity Basics',
    nameJson: { UA: 'Основи кібербезпеки', PL: 'Podstawy cyberbezpieczeństwa', EN: 'Cybersecurity Basics' },
    description: 'Threats, vulnerabilities, defenses',
    descJson: { UA: 'Загрози, вразливості, захист', PL: 'Zagrożenia, podatności, obrona', EN: 'Threats, vulnerabilities, defenses' },
    category: 'Security',
  })

  await upsertTopic('encryption', {
    name: 'Encryption',
    nameJson: { UA: 'Шифрування', PL: 'Szyfrowanie', EN: 'Encryption' },
    description: 'Symmetric, asymmetric, hashing',
    descJson: { UA: 'Симетричне, асиметричне, хешування', PL: 'Symetryczne, asymetryczne, haszowanie', EN: 'Symmetric, asymmetric, hashing' },
    category: 'Security',
    parentId: securityBasics.id,
  })

  await upsertTopic('web-security', {
    name: 'Web Security',
    nameJson: { UA: 'Веб-безпека', PL: 'Bezpieczeństwo webowe', EN: 'Web Security' },
    description: 'XSS, CSRF, SQL injection',
    descJson: { UA: 'XSS, CSRF, SQL ін\'єкції', PL: 'XSS, CSRF, SQL injection', EN: 'XSS, CSRF, SQL injection' },
    category: 'Security',
    parentId: securityBasics.id,
  })

  await upsertTopic('ethical-hacking', {
    name: 'Ethical Hacking',
    nameJson: { UA: 'Етичний хакінг', PL: 'Etyczne hakowanie', EN: 'Ethical Hacking' },
    description: 'Penetration testing, tools',
    descJson: { UA: 'Тестування на проникнення, інструменти', PL: 'Testy penetracyjne, narzędzia', EN: 'Penetration testing, tools' },
    category: 'Security',
  })

  // ==================== DEVOPS ====================
  console.log('\n⚙️ DEVOPS topics:')
  
  const devOps = await upsertTopic('devops-intro', {
    name: 'DevOps Introduction',
    nameJson: { UA: 'Вступ до DevOps', PL: 'Wprowadzenie do DevOps', EN: 'DevOps Introduction' },
    description: 'CI/CD, automation, culture',
    descJson: { UA: 'CI/CD, автоматизація, культура', PL: 'CI/CD, automatyzacja, kultura', EN: 'CI/CD, automation, culture' },
    category: 'DevOps',
  })

  await upsertTopic('docker', {
    name: 'Docker',
    nameJson: { UA: 'Docker', PL: 'Docker', EN: 'Docker' },
    description: 'Containers, images, compose',
    descJson: { UA: 'Контейнери, образи, compose', PL: 'Kontenery, obrazy, compose', EN: 'Containers, images, compose' },
    category: 'DevOps',
    parentId: devOps.id,
  })

  await upsertTopic('kubernetes', {
    name: 'Kubernetes',
    nameJson: { UA: 'Kubernetes', PL: 'Kubernetes', EN: 'Kubernetes' },
    description: 'Orchestration, pods, services',
    descJson: { UA: 'Оркестрація, поди, сервіси', PL: 'Orkiestracja, pody, usługi', EN: 'Orchestration, pods, services' },
    category: 'DevOps',
    parentId: devOps.id,
  })

  await upsertTopic('cicd-pipelines', {
    name: 'CI/CD Pipelines',
    nameJson: { UA: 'CI/CD пайплайни', PL: 'Pipeline CI/CD', EN: 'CI/CD Pipelines' },
    description: 'GitHub Actions, Jenkins, GitLab CI',
    descJson: { UA: 'GitHub Actions, Jenkins, GitLab CI', PL: 'GitHub Actions, Jenkins, GitLab CI', EN: 'GitHub Actions, Jenkins, GitLab CI' },
    category: 'DevOps',
  })

  await upsertTopic('cloud-services', {
    name: 'Cloud Services',
    nameJson: { UA: 'Хмарні сервіси', PL: 'Usługi chmurowe', EN: 'Cloud Services' },
    description: 'AWS, GCP, Azure basics',
    descJson: { UA: 'Основи AWS, GCP, Azure', PL: 'Podstawy AWS, GCP, Azure', EN: 'AWS, GCP, Azure basics' },
    category: 'DevOps',
  })

  // ==================== OPERATING SYSTEMS ====================
  console.log('\n💻 OPERATING SYSTEMS topics:')
  
  const osBasics = await upsertTopic('os-basics', {
    name: 'OS Basics',
    nameJson: { UA: 'Основи ОС', PL: 'Podstawy SO', EN: 'OS Basics' },
    description: 'Processes, memory, file systems',
    descJson: { UA: 'Процеси, пам\'ять, файлові системи', PL: 'Procesy, pamięć, systemy plików', EN: 'Processes, memory, file systems' },
    category: 'OperatingSystems',
  })

  await upsertTopic('processes-threads', {
    name: 'Processes & Threads',
    nameJson: { UA: 'Процеси та потоки', PL: 'Procesy i wątki', EN: 'Processes & Threads' },
    description: 'Scheduling, synchronization',
    descJson: { UA: 'Планування, синхронізація', PL: 'Planowanie, synchronizacja', EN: 'Scheduling, synchronization' },
    category: 'OperatingSystems',
    parentId: osBasics.id,
  })

  await upsertTopic('memory-management', {
    name: 'Memory Management',
    nameJson: { UA: 'Управління пам\'яттю', PL: 'Zarządzanie pamięcią', EN: 'Memory Management' },
    description: 'Virtual memory, paging',
    descJson: { UA: 'Віртуальна пам\'ять, сторінкова організація', PL: 'Pamięć wirtualna, stronicowanie', EN: 'Virtual memory, paging' },
    category: 'OperatingSystems',
    parentId: osBasics.id,
  })

  await upsertTopic('linux-basics', {
    name: 'Linux Basics',
    nameJson: { UA: 'Основи Linux', PL: 'Podstawy Linux', EN: 'Linux Basics' },
    description: 'Shell, commands, permissions',
    descJson: { UA: 'Оболонка, команди, права доступу', PL: 'Powłoka, polecenia, uprawnienia', EN: 'Shell, commands, permissions' },
    category: 'OperatingSystems',
  })

  await upsertTopic('file-systems', {
    name: 'File Systems',
    nameJson: { UA: 'Файлові системи', PL: 'Systemy plików', EN: 'File Systems' },
    description: 'ext4, NTFS, FAT32',
    descJson: { UA: 'ext4, NTFS, FAT32', PL: 'ext4, NTFS, FAT32', EN: 'ext4, NTFS, FAT32' },
    category: 'OperatingSystems',
  })

  // ==================== ADD CATEGORY TRANSLATIONS ====================
  console.log('\n🌐 Adding category translations...')
  
  const newCategoryTranslations: { category: Category; translations: { UA: string; PL: string; EN: string } }[] = [
    { category: 'WebDevelopment', translations: { UA: 'Веб-розробка', PL: 'Tworzenie stron', EN: 'Web Development' } },
    { category: 'MobileDevelopment', translations: { UA: 'Мобільна розробка', PL: 'Rozwój mobilny', EN: 'Mobile Development' } },
    { category: 'MachineLearning', translations: { UA: 'Машинне навчання', PL: 'Uczenie maszynowe', EN: 'Machine Learning' } },
    { category: 'Security', translations: { UA: 'Кібербезпека', PL: 'Cyberbezpieczeństwo', EN: 'Cybersecurity' } },
    { category: 'DevOps', translations: { UA: 'DevOps', PL: 'DevOps', EN: 'DevOps' } },
    { category: 'OperatingSystems', translations: { UA: 'Операційні системи', PL: 'Systemy operacyjne', EN: 'Operating Systems' } },
  ]

  for (const cat of newCategoryTranslations) {
    const exists = await prisma.categoryTranslation.findFirst({ where: { category: cat.category } })
    if (!exists) {
      await prisma.categoryTranslation.create({ data: cat })
      console.log(`  ✓ Added translation for "${cat.category}"`)
    }
  }

  console.log('\n✅ New categories content added successfully!')

  // Summary
  const topicCount = await prisma.topic.count()
  console.log(`\n📊 Total topics in database: ${topicCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
