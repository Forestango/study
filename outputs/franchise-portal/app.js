const users = {
  owner: {
    name: "Владислав Костенко",
    role: "Владелец франшизы",
    shortRole: "owner",
    location: "Управляющая компания",
    permissions: ["all", "download", "audit", "publish"],
  },
  methodist: {
    name: "Анна Методист",
    role: "Методист",
    shortRole: "methodist",
    location: "Методический отдел",
    permissions: ["methodics", "publish"],
  },
  admin: {
    name: "Мария Администратор",
    role: "Администратор точки",
    shortRole: "admin",
    location: "Филиал Казань",
    permissions: ["operations", "sales"],
  },
  coach: {
    name: "Илья Педагог",
    role: "Педагог",
    shortRole: "coach",
    location: "Филиал Казань",
    permissions: ["methodics"],
  },
};

const defaultArticles = [
  {
    id: "premises-minimum",
    title: "Требования к помещению перед запуском",
    category: "Открытие точки",
    version: "v3.2",
    updated: "15.06.2026",
    roles: ["owner", "admin"],
    tags: ["помещение", "ремонт", "запуск"],
    summary: "Минимальная площадь, зоны, высота потолков, требования к санузлу и входной группе.",
    html: `
      <h2>Требования к помещению перед запуском</h2>
      <div class="meta-row"><span class="tag">Открытие точки</span><span>Версия v3.2</span><span>Обновлено 15.06.2026</span></div>
      <p>Помещение должно быть удобно для родителей, безопасно для детей и достаточно гибко для проведения занятий разных форматов.</p>
      <table class="mini-table">
        <tr><th>Параметр</th><th>Минимум</th><th>Комментарий</th></tr>
        <tr><td>Площадь</td><td>от 75 м²</td><td>Желательно два учебных кабинета и зона ожидания.</td></tr>
        <tr><td>Потолки</td><td>от 2,7 м</td><td>Ниже допускается только после согласования.</td></tr>
        <tr><td>Вход</td><td>отдельный или понятный</td><td>Маршрут должен быть безопасен для детей.</td></tr>
      </table>
      <div class="callout"><strong>Критично:</strong> не подписывать долгосрочный договор аренды до проверки помещения управляющей компанией.</div>
      <ol>
        <li>Собрать фото и видео помещения.</li>
        <li>Проверить планировку по чеклисту.</li>
        <li>Согласовать ремонтную схему и брендирование.</li>
      </ol>
    `,
  },
  {
    id: "first-shift",
    title: "Первая смена администратора",
    category: "Администратор",
    version: "v1.8",
    updated: "12.06.2026",
    roles: ["owner", "admin"],
    tags: ["администратор", "смена", "регламент"],
    summary: "Пошаговый порядок открытия смены, проверки кабинетов, звонков и отчетности.",
    html: `
      <h2>Первая смена администратора</h2>
      <div class="meta-row"><span class="tag">Администратор</span><span>Версия v1.8</span><span>Обновлено 12.06.2026</span></div>
      <p>Администратор отвечает за первое впечатление семьи, готовность пространства и корректную фиксацию заявок.</p>
      <ul>
        <li>Открыть точку за 40 минут до первого занятия.</li>
        <li>Проверить чистоту входной зоны, санузла и кабинетов.</li>
        <li>Сверить расписание, оплаты и ожидаемые пробные занятия.</li>
        <li>Подготовить короткие отчеты для управляющего.</li>
      </ul>
      <div class="callout">Если родитель задает методический вопрос, администратор не импровизирует, а передает вопрос педагогу или методисту.</div>
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
    version: "v2.1",
    updated: "10.06.2026",
    roles: ["owner", "methodist", "coach"],
    tags: ["методика", "дети", "урок"],
    summary: "Структура вводного занятия, цели блока, материалы и признаки успешного урока.",
    html: `
      <h2>Занятие 4-5 лет: вводный урок</h2>
      <div class="meta-row"><span class="tag">Методики занятий</span><span>Версия v2.1</span><span>Обновлено 10.06.2026</span></div>
      <p>Цель вводного урока — мягко включить ребенка в формат занятий и дать родителю понятный результат без перегруза.</p>
      <table class="mini-table">
        <tr><th>Блок</th><th>Время</th><th>Задача</th></tr>
        <tr><td>Приветствие</td><td>5 минут</td><td>Контакт, правила, эмоциональная настройка.</td></tr>
        <tr><td>Основное упражнение</td><td>20 минут</td><td>Проверка уровня и вовлечение через действие.</td></tr>
        <tr><td>Финал</td><td>5 минут</td><td>Похвала, мини-результат, мостик к следующему занятию.</td></tr>
      </table>
      <div class="callout">Методист видит этот материал полностью. В будущем сюда можно добавить видеофрагменты и лист наблюдений.</div>
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
    version: "v1.0",
    updated: "15.06.2026",
    roles: ["owner", "methodist", "coach"],
    tags: ["методика", "чеклист", "урок"],
    summary: "Что проверить до, во время и после вводного занятия.",
    html: `
      <h2>Чеклист педагога: вводный урок 4-5 лет</h2>
      <div class="meta-row"><span class="tag">Чеклист</span><span>Обновлено 15.06.2026</span></div>
      <ul>
        <li>Материалы разложены до прихода ребенка.</li>
        <li>Первое задание можно выполнить за 2-3 минуты.</li>
        <li>Родителю в конце показан конкретный результат занятия.</li>
        <li>Администратору передана рекомендация по следующему шагу.</li>
      </ul>
      <div class="callout"><strong>Важно:</strong> чеклист не заменяет сценарий, а помогает провести урок ровно.</div>
    `,
  },
  {
    id: "sales-call",
    title: "Скрипт звонка после заявки",
    category: "Продажи",
    version: "v1.4",
    updated: "08.06.2026",
    roles: ["owner", "admin"],
    tags: ["продажи", "заявка", "скрипт"],
    summary: "Логика первого звонка: быстро понять запрос, записать на пробное и снять возражения.",
    html: `
      <h2>Скрипт звонка после заявки</h2>
      <div class="meta-row"><span class="tag">Продажи</span><span>Версия v1.4</span><span>Обновлено 08.06.2026</span></div>
      <p>Задача звонка — не рассказать все о франшизе, а записать семью на понятный следующий шаг.</p>
      <ol>
        <li>Поздороваться и назвать причину звонка.</li>
        <li>Уточнить возраст ребенка и ожидание родителя.</li>
        <li>Предложить два конкретных времени пробного занятия.</li>
        <li>Зафиксировать запись и отправить сообщение с адресом.</li>
      </ol>
      <div class="callout">Не используем давление. Хороший звонок звучит уверенно, спокойно и по делу.</div>
    `,
  },
  {
    id: "brand-updates",
    title: "Как публиковать обновления методик",
    category: "Методический отдел",
    version: "v1.0",
    updated: "15.06.2026",
    roles: ["owner", "methodist"],
    tags: ["публикация", "версии", "методист"],
    summary: "Процесс подготовки новой версии статьи, согласования и обязательного ознакомления.",
    html: `
      <h2>Как публиковать обновления методик</h2>
      <div class="meta-row"><span class="tag">Методический отдел</span><span>Версия v1.0</span><span>Обновлено 15.06.2026</span></div>
      <p>Каждая важная правка должна иметь понятную причину, новую версию и список ролей, которым нужно ознакомиться с изменением.</p>
      <ul>
        <li>Создать черновик и отметить измененные блоки.</li>
        <li>Проверить доступы по ролям.</li>
        <li>Опубликовать и включить обязательное ознакомление.</li>
        <li>Через 72 часа проверить, кто не прочитал обновление.</li>
      </ul>
    `,
  },
];

let articles = JSON.parse(localStorage.getItem("franchiseArticles") || "null") || defaultArticles;
let imageStore = JSON.parse(localStorage.getItem("franchiseImages") || "{}");

const state = {
  user: null,
  category: "Все",
  contentMode: "articles",
  selectedId: null,
  selectedLessonId: null,
  selectedLessonMaterialId: null,
  query: "",
  editingId: null,
  audit: JSON.parse(localStorage.getItem("franchiseAudit") || "[]"),
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const isEditableTarget = (target) => target?.matches?.("input, textarea");

function ensureLessonDemoData() {
  const intro = articles.find((article) => article.id === "lesson-4-5");
  if (intro) {
    Object.assign(intro, {
      title: intro.contentType === "lesson" ? intro.title : "Сценарий занятия",
      contentType: "lesson",
      lessonId: "intro-4-5",
      lessonTitle: "Вводный урок",
      lessonAge: "4-5 лет",
      lessonCourse: "Базовый курс",
      lessonOrder: 1,
      materialType: "Сценарий",
    });
  }
  if (!articles.some((article) => article.id === "lesson-4-5-checklist")) {
    const checklist = defaultArticles.find((article) => article.id === "lesson-4-5-checklist");
    if (checklist) articles.splice(articles.findIndex((article) => article.id === "lesson-4-5") + 1, 0, checklist);
  }
}

ensureLessonDemoData();
saveArticles();

function canRead(article) {
  return state.user && (state.user.shortRole === "owner" || (article.roles || ["owner"]).includes(state.user.shortRole));
}

function isLessonArticle(article) {
  return article.contentType === "lesson" || article.category === "Методики занятий";
}

function getAvailableArticles() {
  return articles
    .filter(canRead)
    .filter((article) => (state.contentMode === "lessons" ? isLessonArticle(article) : !isLessonArticle(article)))
    .filter((article) => {
      if (state.category === "Все") return true;
      return state.contentMode === "lessons" ? (article.lessonCourse || article.category) === state.category : article.category === state.category;
    })
    .filter((article) => {
      const haystack = `${article.title} ${article.category} ${article.summary || ""} ${(article.tags || []).join(" ")} ${article.html}`.toLowerCase();
      return haystack.includes(state.query.toLowerCase().trim());
    });
}

function getAvailableLessons() {
  const lessons = new Map();
  getAvailableArticles().forEach((article) => {
    const lessonId = article.lessonId || `single-${article.id}`;
    if (!lessons.has(lessonId)) {
      lessons.set(lessonId, {
        id: lessonId,
        title: article.lessonTitle || article.title,
        age: article.lessonAge || "Без возраста",
        course: article.lessonCourse || article.category,
        updated: article.updated,
        materials: [],
      });
    }
    const lesson = lessons.get(lessonId);
    lesson.materials.push(article);
    lesson.updated = article.updated > lesson.updated ? article.updated : lesson.updated;
  });

  return Array.from(lessons.values()).map((lesson) => ({
    ...lesson,
    materials: lesson.materials.sort((a, b) => (a.lessonOrder || 99) - (b.lessonOrder || 99)),
  }));
}

function getPlainTextFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = sanitizeHtml(html);
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}

function getSummaryFromHtml(html) {
  return getPlainTextFromHtml(html).slice(0, 150) || "Без описания";
}

function sanitizeHtml(html) {
  const documentParser = new DOMParser();
  const parsedDocument = documentParser.parseFromString(html || "", "text/html");
  const root = parsedDocument.body;
  root.querySelectorAll("script, style, link, meta, iframe, object, embed, form, input, button, textarea, select, option").forEach((node) => node.remove());
  root.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name === "style" || name.startsWith("on") || value.startsWith("javascript:")) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return root.innerHTML.trim();
}

function renderStoredImages(html) {
  return sanitizeHtml(html).replace(/src="franchise-image:([^"]+)"/g, (_match, imageId) => {
    const image = imageStore[imageId];
    return `src="${image?.src || ""}"`;
  });
}

function saveImages() {
  localStorage.setItem("franchiseImages", JSON.stringify(imageStore));
  window.dispatchEvent(new CustomEvent("franchise:images-changed"));
}

function getArticleIdFromHash() {
  const match = window.location.hash.match(/article=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setArticleHash(id) {
  if (!id) return;
  history.replaceState(null, "", `${window.location.pathname}#article=${encodeURIComponent(id)}`);
}

function saveArticles() {
  localStorage.setItem("franchiseArticles", JSON.stringify(articles));
  window.dispatchEvent(new CustomEvent("franchise:articles-changed"));
}

function slugify(text) {
  const translit = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya",
  };
  const base = text
    .toLowerCase()
    .split("")
    .map((char) => translit[char] || char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  let id = base || `article-${Date.now()}`;
  let counter = 2;
  while (articles.some((article) => article.id === id && article.id !== state.editingId)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

function getCurrentArticleUrl() {
  const article = articles.find((item) => item.id === state.selectedId);
  if (!article) return "";
  return `${window.location.origin}${window.location.pathname}#article=${encodeURIComponent(article.id)}`;
}

function addAudit(action, detail) {
  if (!state.user) return;
  state.audit.unshift({
    at: new Date().toLocaleString("ru-RU"),
    user: state.user.name,
    action,
    detail,
  });
  state.audit = state.audit.slice(0, 40);
  localStorage.setItem("franchiseAudit", JSON.stringify(state.audit));
  renderAudit();
}

function login(login, password, remember = true) {
  if (!users[login] || password !== "1234") {
    alert("Проверь логин и пароль. В демо пароль: 1234.");
    return;
  }

  state.user = users[login];
  const hashArticle = articles.find((article) => article.id === getArticleIdFromHash());
  const hashArticleAvailable = hashArticle && (state.user.shortRole === "owner" || (hashArticle.roles || ["owner"]).includes(state.user.shortRole));
  state.contentMode = hashArticleAvailable && isLessonArticle(hashArticle) ? "lessons" : "articles";
  state.selectedId = hashArticleAvailable ? hashArticle.id : null;
  state.selectedLessonId = hashArticleAvailable && isLessonArticle(hashArticle) ? hashArticle.lessonId || `single-${hashArticle.id}` : null;
  state.selectedLessonMaterialId = hashArticleAvailable && isLessonArticle(hashArticle) ? hashArticle.id : null;
  state.category = "Все";
  state.query = "";
  $("#loginPanel").classList.add("is-hidden");
  $("#appPanel").classList.remove("is-hidden");
  window.scrollTo(0, 0);
  $("#searchInput").value = "";
  $("#userName").textContent = state.user.name;
  $("#userRole").textContent = state.user.role;
  $("#avatar").textContent = state.user.name[0];
  if (remember) {
    localStorage.setItem("franchiseSession", login);
  }
  $("#adminMenu").hidden = state.user.shortRole !== "owner";
  $$("[data-owner-only]").forEach((element) => {
    element.hidden = state.user.shortRole !== "owner";
  });
  showView("knowledge", false);
  addAudit("Вход", `Роль: ${state.user.role}`);
  renderAll();
  if (hashArticle && state.selectedId !== hashArticle.id) {
    addAudit("Ссылка недоступна", hashArticle.title);
  }
}

function logout() {
  addAudit("Выход", "Сессия завершена");
  state.user = null;
  state.selectedId = null;
  localStorage.removeItem("franchiseSession");
  $("#appPanel").classList.add("is-hidden");
  $("#loginPanel").classList.remove("is-hidden");
}

function renderCategories() {
  const source =
    state.contentMode === "lessons"
      ? articles.filter(canRead).filter(isLessonArticle).map((article) => article.lessonCourse || article.category)
      : articles.filter(canRead).filter((article) => !isLessonArticle(article)).map((article) => article.category);
  const categories = ["Все", ...new Set(source)];
  $("#categoryRow").innerHTML = categories
    .map((category) => `<button class="chip ${category === state.category ? "is-active" : ""}" data-category="${category}" type="button">${category}</button>`)
    .join("");
}

function renderArticleList() {
  if (state.contentMode === "lessons") {
    renderLessonList();
    return;
  }
  const available = getAvailableArticles();
  if (!state.selectedId || !available.some((article) => article.id === state.selectedId)) {
    state.selectedId = available[0]?.id || null;
  }
  if (state.selectedId) setArticleHash(state.selectedId);

  $("#articleList").innerHTML = available.length
    ? available
        .map(
          (article) => `
            <button class="article-card ${article.id === state.selectedId ? "is-active" : ""}" data-article="${article.id}" type="button">
              <span class="meta-row"><span class="tag">${article.category}</span></span>
              <strong>${article.title}</strong>
              <span class="muted">${article.summary || getSummaryFromHtml(article.html)}</span>
              <span class="meta-row"><span>${article.updated}</span><span>${(article.tags || []).join(" · ")}</span></span>
            </button>
          `,
        )
        .join("")
    : `<div class="article-card"><strong>Ничего не найдено</strong><span class="muted">Попробуй другой запрос или проверь доступы этой роли.</span></div>`;
}

function renderLessonList() {
  const lessons = getAvailableLessons().filter((lesson) => state.category === "Все" || lesson.course === state.category);
  if (!state.selectedLessonId || !lessons.some((lesson) => lesson.id === state.selectedLessonId)) {
    state.selectedLessonId = lessons[0]?.id || null;
  }
  const selectedLesson = lessons.find((lesson) => lesson.id === state.selectedLessonId);
  if (selectedLesson && !selectedLesson.materials.some((material) => material.id === state.selectedLessonMaterialId)) {
    state.selectedLessonMaterialId = selectedLesson.materials[0]?.id || null;
    state.selectedId = state.selectedLessonMaterialId;
  }
  if (state.selectedLessonMaterialId) setArticleHash(state.selectedLessonMaterialId);

  const grouped = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.course]) acc[lesson.course] = {};
    if (!acc[lesson.course][lesson.age]) acc[lesson.course][lesson.age] = [];
    acc[lesson.course][lesson.age].push(lesson);
    return acc;
  }, {});

  $("#articleList").innerHTML = lessons.length
    ? Object.entries(grouped)
        .map(
          ([course, ages]) => `
            <div class="lesson-tree-group">
              <strong>${course}</strong>
              ${Object.entries(ages)
                .map(
                  ([age, ageLessons]) => `
                    <div class="lesson-tree-age">
                      <span>${age}</span>
                      ${ageLessons
                        .map(
                          (lesson) => `
                            <button class="article-card lesson-card ${lesson.id === state.selectedLessonId ? "is-active" : ""}" data-lesson="${lesson.id}" type="button">
                              <strong>${lesson.title}</strong>
                              <span class="muted">${lesson.materials.length} материала: ${lesson.materials.map((item) => item.materialType || item.title).join(", ")}</span>
                              <span class="meta-row"><span>Обновлено ${lesson.updated}</span></span>
                            </button>
                          `,
                        )
                        .join("")}
                    </div>
                  `,
                )
                .join("")}
            </div>
          `,
        )
        .join("")
    : `<div class="article-card"><strong>Уроки не найдены</strong><span class="muted">Попробуй другой запрос или фильтр.</span></div>`;
}

function renderReader() {
  if (state.contentMode === "lessons") {
    renderLessonReader();
    return;
  }
  const article = articles.find((item) => item.id === state.selectedId);
  $("#reader").removeAttribute("data-watermark");

  if (!article) {
    $("#reader").innerHTML = `<h2>Материал не выбран</h2><p>Для этой роли нет опубликованных статей по текущему фильтру.</p>`;
    return;
  }

  $("#reader").innerHTML = `
    <div class="reader-actions">
      <div class="shield-strip" aria-label="Защита материала">
        <span>Копирование отключено</span>
        <span>Печать отключена</span>
        <span>Скачивание отключено</span>
      </div>
      <button class="link-button" id="copyArticleLink" type="button">Скопировать ссылку</button>
    </div>
    ${renderStoredImages(article.html)}
    <div class="callout">
      <strong>Защита просмотра:</strong> выделение, копирование, перетаскивание, печать и сохранение отключены на уровне интерфейса. В серверной версии добавим выдачу контента только после проверки прав, лимиты, защищенные изображения и расширенный аудит.
    </div>
  `;
}

function renderLessonReader() {
  const lesson = getAvailableLessons().find((item) => item.id === state.selectedLessonId);
  if (!lesson) {
    $("#reader").innerHTML = `<h2>Урок не выбран</h2><p>По текущему фильтру нет доступных методик.</p>`;
    return;
  }
  const material = lesson.materials.find((item) => item.id === state.selectedLessonMaterialId) || lesson.materials[0];
  state.selectedLessonMaterialId = material?.id || null;
  state.selectedId = material?.id || null;
  if (material) setArticleHash(material.id);

  $("#reader").innerHTML = `
    <div class="reader-actions">
      <div class="shield-strip" aria-label="Защита материала">
        <span>${lesson.course}</span>
        <span>${lesson.age}</span>
        <span>${lesson.materials.length} материала</span>
      </div>
      <button class="link-button" id="copyArticleLink" type="button">Скопировать ссылку</button>
    </div>
    <header class="lesson-head">
      <p class="eyebrow">Методика занятия</p>
      <h2>${lesson.title}</h2>
    </header>
    <div class="lesson-tabs" aria-label="Материалы урока">
      ${lesson.materials
        .map(
          (item) => `
            <button class="lesson-tab ${item.id === material.id ? "is-active" : ""}" data-material="${item.id}" type="button">
              ${item.materialType || item.title}
            </button>
          `,
        )
        .join("")}
    </div>
    <section class="lesson-material">
      ${renderStoredImages(material.html)}
    </section>
  `;
}

function renderEditor() {
  if (!state.user || state.user.shortRole !== "owner") return;
  $("#editorList").innerHTML = `
    <button class="editor-card ${state.editingId ? "" : "is-active"}" data-editor-new type="button">
      <strong>Новая статья</strong>
      <span class="muted">Создать материал с нуля</span>
    </button>
    ${renderEditorTree()}
  `;
  loadEditorArticle(state.editingId);
}

function renderEditorTree() {
  const standalone = articles.filter((article) => !isLessonArticle(article));
  const lessonsByCourse = new Map();
  articles.filter(isLessonArticle).forEach((article) => {
    const course = article.lessonCourse || "Без курса";
    const age = article.lessonAge || "Без возраста";
    const lessonId = article.lessonId || `single-${article.id}`;
    if (!lessonsByCourse.has(course)) lessonsByCourse.set(course, new Map());
    const ages = lessonsByCourse.get(course);
    if (!ages.has(age)) ages.set(age, new Map());
    const lessons = ages.get(age);
    if (!lessons.has(lessonId)) {
      lessons.set(lessonId, {
        title: article.lessonTitle || article.title,
        materials: [],
      });
    }
    lessons.get(lessonId).materials.push(article);
  });

  const articleTree = `
    <div class="editor-tree-group">
      <strong>Обычные статьи</strong>
      ${standalone
        .map(
          (article) => `
            <button class="editor-card ${article.id === state.editingId ? "is-active" : ""}" data-editor-id="${article.id}" type="button">
              <strong>${article.title}</strong>
              <span class="muted">${article.category}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  const lessonTree = Array.from(lessonsByCourse.entries())
    .map(
      ([course, ages]) => `
        <div class="editor-tree-group">
          <strong>${course}</strong>
          ${Array.from(ages.entries())
            .map(
              ([age, lessons]) => `
                <div class="editor-tree-branch">
                  <span>${age}</span>
                  ${Array.from(lessons.values())
                    .map(
                      (lesson) => `
                        <div class="editor-tree-lesson">
                          <b>${lesson.title}</b>
                          ${lesson.materials
                            .sort((a, b) => (a.lessonOrder || 99) - (b.lessonOrder || 99))
                            .map(
                              (article) => `
                                <button class="editor-card editor-material ${article.id === state.editingId ? "is-active" : ""}" data-editor-id="${article.id}" type="button">
                                  <strong>${article.materialType || article.title}</strong>
                                  <span class="muted">${article.title}</span>
                                </button>
                              `,
                            )
                            .join("")}
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `,
            )
            .join("")}
        </div>
      `,
    )
    .join("");

  return `${articleTree}<div class="editor-tree-group"><strong>Уроки</strong>${lessonTree || `<span class="muted">Пока нет уроков.</span>`}</div>`;
}

function loadEditorArticle(id) {
  state.editingId = id || null;
  const article = articles.find((item) => item.id === id);
  $("#editorHeading").textContent = article ? "Редактирование статьи" : "Новая статья";
  $("#editorTitle").value = article?.title || "";
  $("#editorCategory").value = article?.category || "";
  $("#editorIsLesson").checked = !!article && isLessonArticle(article);
  $("#lessonSettings").open = !!article && isLessonArticle(article);
  $("#editorLessonCourse").value = article?.lessonCourse || "";
  $("#editorLessonAge").value = article?.lessonAge || "";
  $("#editorLessonTitle").value = article?.lessonTitle || "";
  $("#editorMaterialType").value = article?.materialType || "";
  $("#editorLessonOrder").value = article?.lessonOrder || "";
  $("#editorHtml").value =
    article?.html?.trim() ||
    `<h2>Название статьи</h2>\n<p>Основной текст материала.</p>\n<div class="callout"><strong>Важно:</strong> заметка или предупреждение.</div>`;
}

function renderAccess() {
  const roleCards = Object.values(users)
    .map((user) => {
      const count = articles.filter((article) => user.shortRole === "owner" || (article.roles || ["owner"]).includes(user.shortRole)).length;
      return `
        <article class="access-card">
          <h3>${user.role}</h3>
          <p class="muted">${user.location}</p>
          <div class="permission-row"><span>Доступных статей</span><span>${count}</span></div>
          <div class="permission-row"><span>Публикация</span><span>${user.permissions.includes("publish") ? "Да" : "Нет"}</span></div>
          <div class="permission-row"><span>Аудит</span><span>${user.permissions.includes("audit") ? "Да" : "Нет"}</span></div>
          <div class="permission-row"><span>Скачивание</span><span>${user.permissions.includes("download") ? "Да" : "Нет"}</span></div>
        </article>
      `;
    })
    .join("");
  $("#accessGrid").innerHTML = roleCards;
}

function renderAudit() {
  $("#auditList").innerHTML = state.audit.length
    ? state.audit
        .map(
          (item) => `
            <div class="audit-item">
              <time>${item.at}</time>
              <div><strong>${item.action}</strong><br><span class="muted">${item.user}: ${item.detail}</span></div>
            </div>
          `,
        )
        .join("")
    : `<p class="muted">Пока нет событий.</p>`;
}

function renderAll() {
  $$("#modeRow [data-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === state.contentMode);
  });
  renderCategories();
  renderArticleList();
  renderReader();
  renderAccess();
  renderAudit();
  renderEditor();
}

function showView(view, shouldAudit = true) {
  $$(".nav-tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === view));
  $$(".view").forEach((panel) => panel.classList.toggle("is-active", panel.id === `${view}View`));
  const activeButton = $(`.nav-tab[data-view="${view}"]`);
  const title = activeButton?.dataset.title || "База знаний";
  $("#adminMenu")?.removeAttribute("open");
  if (shouldAudit) addAudit("Открыт раздел", title);
}

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  login($("#loginInput").value.trim(), $("#passwordInput").value.trim());
});

$("#logoutButton").addEventListener("click", logout);

$("#categoryRow").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  state.selectedId = null;
  state.selectedLessonId = null;
  state.selectedLessonMaterialId = null;
  addAudit("Фильтр", `Категория: ${state.category}`);
  renderAll();
});

$("#modeRow").addEventListener("click", (event) => {
  const button = event.target.closest("[data-mode]");
  if (!button) return;
  state.contentMode = button.dataset.mode;
  state.category = "Все";
  state.selectedId = null;
  state.selectedLessonId = null;
  state.selectedLessonMaterialId = null;
  addAudit("Переключен режим", state.contentMode === "lessons" ? "Уроки" : "Статьи");
  renderAll();
});

$("#articleList").addEventListener("click", (event) => {
  const lessonButton = event.target.closest("[data-lesson]");
  if (lessonButton) {
    state.selectedLessonId = lessonButton.dataset.lesson;
    const lesson = getAvailableLessons().find((item) => item.id === state.selectedLessonId);
    state.selectedLessonMaterialId = lesson?.materials[0]?.id || null;
    state.selectedId = state.selectedLessonMaterialId;
    addAudit("Просмотр урока", lesson?.title || state.selectedLessonId);
    renderArticleList();
    renderReader();
    return;
  }

  const button = event.target.closest("[data-article]");
  if (!button) return;
  state.selectedId = button.dataset.article;
  const article = articles.find((item) => item.id === state.selectedId);
  addAudit("Просмотр статьи", article.title);
  renderArticleList();
  renderReader();
});

$("#reader").addEventListener("click", async (event) => {
  const materialButton = event.target.closest("[data-material]");
  if (materialButton) {
    state.selectedLessonMaterialId = materialButton.dataset.material;
    state.selectedId = state.selectedLessonMaterialId;
    const material = articles.find((item) => item.id === state.selectedLessonMaterialId);
    addAudit("Открыт материал урока", material?.title || state.selectedLessonMaterialId);
    renderReader();
    return;
  }

  const button = event.target.closest("#copyArticleLink");
  if (!button) return;
  const url = getCurrentArticleUrl();
  try {
    await navigator.clipboard.writeText(url);
    button.textContent = "Ссылка скопирована";
    addAudit("Скопирована ссылка", articles.find((item) => item.id === state.selectedId)?.title || url);
    setTimeout(() => {
      button.textContent = "Скопировать ссылку";
    }, 1400);
  } catch {
    window.prompt("Ссылка на статью", url);
  }
});

$("#searchInput").addEventListener("input", (event) => {
  state.query = event.target.value;
  state.selectedId = null;
  renderArticleList();
  renderReader();
});

$$(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => {
    if (!button.dataset.view) return;
    showView(button.dataset.view);
  });
});

$("#editorList").addEventListener("click", (event) => {
  const newButton = event.target.closest("[data-editor-new]");
  const articleButton = event.target.closest("[data-editor-id]");
  if (newButton) {
    loadEditorArticle(null);
    renderEditor();
    return;
  }
  if (articleButton) {
    loadEditorArticle(articleButton.dataset.editorId);
    renderEditor();
  }
});

$("#newArticleButton").addEventListener("click", () => {
  loadEditorArticle(null);
  renderEditor();
});

$("#editorForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!state.user || state.user.shortRole !== "owner") return;
  const existing = articles.find((article) => article.id === state.editingId);
  const title = $("#editorTitle").value.trim();
  const html = sanitizeHtml($("#editorHtml").value.trim());
  const isLesson = $("#editorIsLesson").checked;
  const lessonTitle = $("#editorLessonTitle").value.trim();
  const lessonCourse = $("#editorLessonCourse").value.trim();
  const lessonAge = $("#editorLessonAge").value.trim();
  const materialType = $("#editorMaterialType").value.trim();
  const lessonOrder = Number($("#editorLessonOrder").value || 0) || undefined;
  const savedArticle = {
    id: existing?.id || slugify(title),
    title,
    category: $("#editorCategory").value.trim(),
    version: existing?.version || "v1.0",
    updated: new Date().toLocaleDateString("ru-RU"),
    roles: existing?.roles || ["owner"],
    tags: existing?.tags || [],
    summary: getSummaryFromHtml(html),
    html,
  };

  if (isLesson) {
    savedArticle.contentType = "lesson";
    savedArticle.lessonTitle = lessonTitle || title;
    savedArticle.lessonCourse = lessonCourse || savedArticle.category || "Без курса";
    savedArticle.lessonAge = lessonAge || "Без возраста";
    savedArticle.lessonId = existing?.lessonId || slugify(`${savedArticle.lessonCourse}-${savedArticle.lessonAge}-${savedArticle.lessonTitle}`);
    savedArticle.materialType = materialType || title;
    savedArticle.lessonOrder = lessonOrder;
  }

  if (existing) {
    articles = articles.map((article) => (article.id === existing.id ? savedArticle : article));
  } else {
    articles.unshift(savedArticle);
  }

  state.editingId = savedArticle.id;
  state.selectedId = savedArticle.id;
  state.contentMode = isLesson ? "lessons" : "articles";
  state.selectedLessonId = isLesson ? savedArticle.lessonId : null;
  state.selectedLessonMaterialId = isLesson ? savedArticle.id : null;
  state.category = "Все";
  state.query = "";
  $("#searchInput").value = "";
  saveArticles();
  setArticleHash(savedArticle.id);
  addAudit("Сохранена статья", savedArticle.title);
  renderAll();
  showView("knowledge", false);
});

$("#editorImage").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const imageNumber = Object.keys(imageStore).length + 1;
    const imageId = `img-${Date.now()}`;
    const caption = window.prompt("Подпись к картинке", `Рисунок ${imageNumber}. ${file.name}`) || `Рисунок ${imageNumber}`;
    imageStore[imageId] = {
      name: file.name,
      caption,
      src: reader.result,
    };
    saveImages();
    const imageHtml = `\n<figure class="article-image" id="${imageId}"><img src="franchise-image:${imageId}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>\n`;
    const textarea = $("#editorHtml");
    const start = textarea.selectionStart || textarea.value.length;
    const end = textarea.selectionEnd || textarea.value.length;
    textarea.value = `${textarea.value.slice(0, start)}${imageHtml}${textarea.value.slice(end)}`;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + imageHtml.length;
    event.target.value = "";
  });
  reader.readAsDataURL(file);
});

$("#editorImportHtml").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const html = String(reader.result || "").trim();
    const importedDocument = new DOMParser().parseFromString(html, "text/html");
    const importedTitle = importedDocument.querySelector("h1, h2, title")?.textContent?.trim();
    if (!$("#editorTitle").value.trim()) {
      $("#editorTitle").value = importedTitle || file.name.replace(/\.(html|htm)$/i, "");
    }
    if (!$("#editorCategory").value.trim()) {
      $("#editorCategory").value = "Импорт";
    }
    $("#editorHtml").value = sanitizeHtml(html);
    event.target.value = "";
    addAudit("Импортирован HTML", file.name);
  });
  reader.readAsText(file);
});

window.addEventListener("hashchange", () => {
  if (!state.user) return;
  const article = articles.find((item) => item.id === getArticleIdFromHash());
  if (!article || !canRead(article)) return;
  state.contentMode = isLessonArticle(article) ? "lessons" : "articles";
  state.selectedId = article.id;
  state.selectedLessonId = isLessonArticle(article) ? article.lessonId || `single-${article.id}` : null;
  state.selectedLessonMaterialId = isLessonArticle(article) ? article.id : null;
  state.category = "Все";
  state.query = "";
  $("#searchInput").value = "";
  showView("knowledge", false);
  renderAll();
  addAudit("Открыта ссылка", article.title);
});

function refreshStoredContent() {
  articles = JSON.parse(localStorage.getItem("franchiseArticles") || "null") || defaultArticles;
  imageStore = JSON.parse(localStorage.getItem("franchiseImages") || "{}");
  if (state.selectedId && !articles.some((article) => article.id === state.selectedId)) {
    state.selectedId = null;
    state.selectedLessonId = null;
    state.selectedLessonMaterialId = null;
  }
  if (state.user) renderAll();
}

window.addEventListener("franchise:articles-changed", refreshStoredContent);
window.addEventListener("franchise:images-changed", refreshStoredContent);
window.addEventListener("storage", (event) => {
  if (event.key === "franchiseArticles" || event.key === "franchiseImages") refreshStoredContent();
});
window.addEventListener("focus", refreshStoredContent);

document.addEventListener("copy", (event) => {
  if (isEditableTarget(event.target)) return;
  event.preventDefault();
  if (event.clipboardData) {
    event.clipboardData.setData("text/plain", "");
  }
  addAudit("Попытка копирования", "Событие заблокировано интерфейсом");
});

document.addEventListener("contextmenu", (event) => {
  if (isEditableTarget(event.target)) return;
  event.preventDefault();
  addAudit("Попытка открыть меню", "Контекстное меню заблокировано");
});

document.addEventListener("selectstart", (event) => {
  if (isEditableTarget(event.target)) return;
  if (event.target.closest("#reader")) {
    event.preventDefault();
    addAudit("Попытка выделения", "Выделение текста в статье заблокировано");
  }
});

document.addEventListener("dragstart", (event) => {
  if (event.target.closest("#reader")) {
    event.preventDefault();
    addAudit("Попытка перетаскивания", "Перетаскивание контента заблокировано");
  }
});

document.addEventListener("mousedown", (event) => {
  if (event.target?.matches?.("input, textarea, button")) return;
  if (event.detail > 1 && event.target.closest("#reader")) {
    event.preventDefault();
  }
});

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;
  const node = selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode;
  if (node?.closest?.("#reader")) {
    selection.removeAllRanges();
  }
});

document.addEventListener("keydown", (event) => {
  if (isEditableTarget(event.target)) return;
  const key = event.key.toLowerCase();
  const blocked =
    (event.metaKey || event.ctrlKey) && ["c", "x", "s", "p", "u", "a", "i", "j"].includes(key);
  if (blocked) {
    event.preventDefault();
    addAudit("Горячая клавиша заблокирована", `${event.metaKey ? "Cmd" : "Ctrl"}+${event.key.toUpperCase()}`);
  }
});

window.addEventListener("beforeprint", () => {
  addAudit("Попытка печати", "Печать заменена защитным экраном");
});

const savedSession = localStorage.getItem("franchiseSession");
if (savedSession && users[savedSession]) {
  login(savedSession, "1234", false);
}
