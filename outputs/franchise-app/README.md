# Franchise App

Новый каркас приложения под нормальную админку.

## Что внутри

- `/portal` — пользовательский портал для чтения материалов.
- `/admin` — админка на Refine + Ant Design.
- Общий localStorage data layer для прототипа.
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

Следующий шаг — заменить localStorage data provider на настоящий backend API.
