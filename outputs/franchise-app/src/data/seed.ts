import type { Article } from "../shared/types";

export const seedArticles: Article[] = [
  {
    id: "premises-minimum",
    title: "Требования к помещению перед запуском",
    category: "Открытие точки",
    updated: "15.06.2026",
    roles: ["owner", "admin"],
    summary: "Минимальная площадь, зоны, высота потолков, требования к санузлу и входной группе.",
    html: `
      <h2>Требования к помещению перед запуском</h2>
      <p>Помещение должно быть удобно для родителей, безопасно для детей и достаточно гибко для проведения занятий разных форматов.</p>
      <table class="mini-table">
        <tr><th>Параметр</th><th>Минимум</th><th>Комментарий</th></tr>
        <tr><td>Площадь</td><td>от 75 м²</td><td>Желательно два учебных кабинета и зона ожидания.</td></tr>
        <tr><td>Потолки</td><td>от 2,7 м</td><td>Ниже допускается только после согласования.</td></tr>
      </table>
    `,
  },
  {
    id: "lesson-4-5",
    title: "Сценарий занятия",
    category: "Методики занятий",
    contentType: "lesson",
    lessonId: "intro-4-5",
    lessonTitle: "Вводный урок",
    lessonAge: "4-5 лет",
    lessonCourse: "Базовый курс",
    lessonOrder: 1,
    materialType: "Сценарий",
    updated: "10.06.2026",
    roles: ["owner", "methodist", "coach"],
    summary: "Структура вводного занятия, цели блока, материалы и признаки успешного урока.",
    html: `
      <h2>Занятие 4-5 лет: вводный урок</h2>
      <p>Цель вводного урока — мягко включить ребенка в формат занятий и дать родителю понятный результат.</p>
    `,
  },
  {
    id: "lesson-4-5-checklist",
    title: "Чеклист педагога",
    category: "Методики занятий",
    contentType: "lesson",
    lessonId: "intro-4-5",
    lessonTitle: "Вводный урок",
    lessonAge: "4-5 лет",
    lessonCourse: "Базовый курс",
    lessonOrder: 2,
    materialType: "Чеклист",
    updated: "15.06.2026",
    roles: ["owner", "methodist", "coach"],
    summary: "Что проверить до, во время и после вводного занятия.",
    html: `
      <h2>Чеклист педагога</h2>
      <ul>
        <li>Материалы разложены до прихода ребенка.</li>
        <li>Родителю в конце показан конкретный результат занятия.</li>
      </ul>
    `,
  },
];
