# Женя Лебедев — парикмахер-стилист

Персональный editorial-сайт московского парикмахера-стилиста Жени Лебедева: портфолио работ, подход, услуги, обучение и контакты.

## Stack

- React
- Vite
- Three.js
- CSS
- Vercel

## Локальный запуск

```bash
npm ci
npm run dev
```

После запуска сайт доступен по адресу, который покажет Vite.

## Production build

```bash
npm run build
npm run preview
```

Готовая статическая сборка создаётся в каталоге `dist`.

## Deployment

Проект настроен для Vercel. Production branch — `main`, build command — `npm run build`, output directory — `dist`.

Переменные окружения не требуются.
