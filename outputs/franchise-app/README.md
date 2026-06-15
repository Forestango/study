# Franchise App

Новый каркас приложения под нормальную админку.

## Что внутри

- `/portal` — пользовательский портал для чтения материалов.
- `/admin` — админка на Refine + Ant Design.
- Общий data layer: Supabase при наличии env-переменных, localStorage как fallback для локального прототипа.
- Модель материалов поддерживает обычные статьи и материалы уроков.

## Запуск

Зависимости уже установлены локальным npm из `../../work/npm-local`.

```bash
npm install
npm run dev
```

Открыть:

- `http://localhost:5173/portal`
- `http://localhost:5173/admin/articles`
- `http://localhost:5173/admin/lessons`

В этой среде сервер запущен на:

- `http://127.0.0.1:5173/portal`
- `http://127.0.0.1:5173/admin/articles`
- `http://127.0.0.1:5173/admin/lessons`

Проверено:

- `npm run build` проходит.
- Refine-админка открывается.
- Дерево уроков открывается.
- Портал открывается.

## Дальше

## Общая база через Supabase

Для общего хранилища между браузерами:

1. Создать проект в Supabase.
2. Открыть SQL Editor и выполнить `supabase.sql`.
3. В GitHub repo добавить:
   - `Settings -> Secrets and variables -> Actions -> Variables`
     - `VITE_SUPABASE_URL` = Project URL.
   - `Settings -> Secrets and variables -> Actions -> Secrets`
     - `VITE_SUPABASE_ANON_KEY` = anon public key.
4. Перезапустить workflow `Deploy franchise app`.

Без этих переменных приложение продолжит работать в localStorage-режиме.

Важно: текущие Supabase policies разрешают публичную запись в одну строку `default`. Это удобно для прототипа на GitHub Pages, но перед реальным запуском нужен auth, роли и серверная проверка прав.

## Дальше

Следующий шаг — добавить авторизацию и разграничить права на серверной стороне.
