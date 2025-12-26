import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* 404 illustration */}
      <div className="relative mb-8">
        <div className="text-[150px] md:text-[200px] font-display font-bold text-neutral-100 dark:text-neutral-800 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FileQuestion size={80} className="text-primary-500" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
        Сторінку не знайдено
      </h1>
      
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md">
        Схоже, ця сторінка переїхала, була видалена, або ви ввели неправильну адресу.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/" 
          className="btn flex items-center gap-2"
        >
          <Home size={18} />
          На головну
        </Link>
        
        <button 
          onClick={() => window.history.back()}
          className="btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Назад
        </button>
      </div>

      {/* Quick links */}
      <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-sm text-neutral-500 mb-4">Можливо, ви шукали:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/materials" className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm font-medium transition-colors">
            Матеріали
          </Link>
          <Link to="/leaderboard" className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm font-medium transition-colors">
            Рейтинг
          </Link>
          <Link to="/profile" className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm font-medium transition-colors">
            Профіль
          </Link>
        </div>
      </div>
    </div>
  )
}
