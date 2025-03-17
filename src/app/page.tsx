import Link from "next/link";
import TelegramFullscreenButton from "@/components/TelegramFullscreenButton";

export default function Home() {
  return (
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-6">
      {/* Герой секция */}
      <div className="text-center space-y-4 sm:space-y-5 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl">
          <span className="text-gradient">Zametka</span>
        </h1>
        <p className="text-lg sm:text-xl text-foreground">
          Мой личный сервис для заметок и учета финансов
        </p>
        <div className="mt-4 sm:mt-6 flex justify-center gap-3 sm:gap-4">
          <Link href="/notes" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 sm:px-4 py-2 text-sm font-medium shadow-sm transition-colors hover-lift">Заметки</Link>
          <Link href="/finances" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md px-3 sm:px-4 py-2 text-sm font-medium shadow-sm transition-colors hover-lift">Финансы</Link>
        </div>
        
        <div className="hidden sm:flex justify-center mt-4">
          <TelegramFullscreenButton 
            buttonText="Открыть в полноэкранном режиме" 
            exitButtonText="Выйти из полноэкранного режима"
            showVersionWarning={true}
          />
        </div>
      </div>
      
      {/* Блоки основных функций */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 space-y-3 sm:space-y-4 glass hover-lift">
          <div className="icon-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Заметки</h2>
          <p className="text-sm sm:text-base text-foreground">
            Мои заметки, задачи и идеи в одном месте
          </p>
          <Link href="/notes" className="inline-flex items-center text-primary font-medium group">
            Открыть 
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        <div className="card p-5 sm:p-6 space-y-3 sm:space-y-4 glass hover-lift">
          <div className="icon-gradient w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
              <path d="M12 18V6"></path>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Финансы</h2>
          <p className="text-sm sm:text-base text-foreground">
            Контроль доходов и расходов, анализ финансов
          </p>
          <Link href="/finances" className="inline-flex items-center text-primary font-medium group">
            Открыть 
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
