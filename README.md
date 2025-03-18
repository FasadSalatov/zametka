# Zametka - Личный менеджер для заметок и финансов

Веб-приложение для управления личными заметками и финансами, оптимизированное для работы в качестве Telegram Mini App.

## Основные функции

- Управление заметками
- Учет финансов
- Учет долгов
- Настройка профиля
- Темная/светлая темы

## Особенности реализации

### Тактильная обратная связь (вибрация)

Приложение использует Telegram WebApp API для обеспечения тактильной обратной связи (вибрации) при взаимодействии с интерактивными элементами:

- Все кнопки автоматически активируют вибрацию при нажатии
- Можно указать силу вибрации через атрибут `data-haptic` с одним из значений:
  - `light` - легкая вибрация
  - `medium` - средняя вибрация (по умолчанию)
  - `heavy` - сильная вибрация
  - `rigid` - жесткая вибрация
  - `soft` - мягкая вибрация

Пример:
```jsx
<button data-haptic="medium">Нажми меня</button>
<button data-haptic="heavy">Важная кнопка</button>
```

### Запоминание полноэкранного режима

Приложение запоминает состояние полноэкранного режима с помощью Telegram CloudStorage API и автоматически восстанавливает его при следующем открытии.

### Адаптивная верстка и Safe Area

Приложение корректно обрабатывает Safe Area на устройствах с вырезами и скругленными углами экрана, используя как CSS-переменные `env()`, так и Telegram WebApp API.

## Технологии

- Next.js
- TypeScript
- Tailwind CSS
- Telegram WebApp API

## Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен-версии
npm run start
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
