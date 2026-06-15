const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const seedArticles = [
  {
    id: "admin-seed-article",
    title: "Пример обычной статьи",
    category: "Администратор",
    updated: new Date().toLocaleDateString("ru-RU"),
    roles: ["owner"],
    tags: [],
    summary: "Стартовый материал для админки.",
    html: "<h2>Пример обычной статьи</h2><p>Этот материал можно заменить на реальный регламент.</p>",
  },
  {
    id: "admin-seed-lesson-script",
    title: "Сценарий занятия",
    category: "Методики занятий",
    contentType: "lesson",
    lessonId: "seed-intro",
    lessonTitle: "Вводный урок",
    lessonCourse: "Базовый курс",
    lessonAge: "4-5 лет",
    materialType: "Сценарий",
    lessonOrder: 1,
    updated: new Date().toLocaleDateString("ru-RU"),
    roles: ["owner"],
    tags: [],
    summary: "Первый материал урока.",
    html: "<h2>Сценарий занятия</h2><p>Опишите ход урока.</p>",
  },
];

let articles = JSON.parse(localStorage.getItem("franchiseArticles") || "null") || seedArticles;
let imageStore = JSON.parse(localStorage.getItem("franchiseImages") || "{}");
let selectedId = articles[0]?.id || null;
let query = "";

function saveArticles() {
  localStorage.setItem("franchiseArticles", JSON.stringify(articles));
  window.dispatchEvent(new CustomEvent("franchise:articles-changed"));
}

function saveImages() {
  localStorage.setItem("franchiseImages", JSON.stringify(imageStore));
  window.dispatchEvent(new CustomEvent("franchise:images-changed"));
}

function slugify(text) {
  const translit = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y", э: "e", ю: "yu", я: "ya",
  };
  const base = text.toLowerCase().split("").map((char) => translit[char] || char).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  let id = base || `item-${Date.now()}`;
  let counter = 2;
  while (articles.some((article) => article.id === id && article.id !== selectedId)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

function sanitizeHtml(html) {
  const parsedDocument = new DOMParser().parseFromString(html || "", "text/html");
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

function plainText(html) {
  const template = document.createElement("template");
  template.innerHTML = sanitizeHtml(html);
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}

function renderStoredImages(html) {
  return sanitizeHtml(html).replace(/src="franchise-image:([^"]+)"/g, (_match, imageId) => {
    const image = imageStore[imageId];
    return `src="${image?.src || ""}"`;
  });
}

function isLesson(article) {
  return article.contentType === "lesson" || article.category === "Методики занятий";
}

function filteredArticles() {
  const needle = query.toLowerCase().trim();
  if (!needle) return articles;
  return articles.filter((article) => `${article.title} ${article.category} ${article.lessonCourse || ""} ${article.lessonAge || ""} ${article.lessonTitle || ""} ${article.materialType || ""}`.toLowerCase().includes(needle));
}

function buildTree() {
  const items = filteredArticles();
  const standalone = items.filter((article) => !isLesson(article));
  const lessonItems = items.filter(isLesson);
  const lessonsByCourse = new Map();

  lessonItems.forEach((article) => {
    const course = article.lessonCourse || "Без курса";
    const age = article.lessonAge || "Без возраста";
    const lessonId = article.lessonId || `single-${article.id}`;
    if (!lessonsByCourse.has(course)) lessonsByCourse.set(course, new Map());
    const ages = lessonsByCourse.get(course);
    if (!ages.has(age)) ages.set(age, new Map());
    const lessons = ages.get(age);
    if (!lessons.has(lessonId)) lessons.set(lessonId, { title: article.lessonTitle || article.title, materials: [] });
    lessons.get(lessonId).materials.push(article);
  });

  const articleTree = `
    <section class="tree-section">
      <strong>Обычные статьи</strong>
      ${standalone.map(renderTreeItem).join("") || `<span class="muted">Нет статей</span>`}
    </section>
  `;

  const lessonTree = Array.from(lessonsByCourse.entries())
    .map(
      ([course, ages]) => `
        <section class="tree-section">
          <strong>${course}</strong>
          ${Array.from(ages.entries())
            .map(
              ([age, lessons]) => `
                <div class="tree-branch">
                  <span>${age}</span>
                  ${Array.from(lessons.values())
                    .map(
                      (lesson) => `
                        <div class="tree-lesson">
                          <b>${lesson.title}</b>
                          ${lesson.materials.sort((a, b) => (a.lessonOrder || 99) - (b.lessonOrder || 99)).map(renderTreeItem).join("")}
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `,
            )
            .join("")}
        </section>
      `,
    )
    .join("");

  $("#contentTree").innerHTML = `${articleTree}${lessonTree || `<section class="tree-section"><strong>Уроки</strong><span class="muted">Нет уроков</span></section>`}`;
}

function renderTreeItem(article) {
  return `
    <button class="tree-item ${article.id === selectedId ? "is-active" : ""}" data-id="${article.id}" type="button">
      <strong>${isLesson(article) ? article.materialType || article.title : article.title}</strong>
      <span class="muted">${isLesson(article) ? article.title : article.category}</span>
    </button>
  `;
}

function loadForm(id) {
  selectedId = id || null;
  const article = articles.find((item) => item.id === selectedId);
  $("#formHeading").textContent = article ? "Редактирование" : "Новый материал";
  $("#adminTitle").value = article?.title || "";
  $("#adminCategory").value = article?.category || "";
  $("#adminIsLesson").checked = !!article && isLesson(article);
  $("#adminLessonCourse").value = article?.lessonCourse || "";
  $("#adminLessonAge").value = article?.lessonAge || "";
  $("#adminLessonTitle").value = article?.lessonTitle || "";
  $("#adminMaterialType").value = article?.materialType || "";
  $("#adminLessonOrder").value = article?.lessonOrder || "";
  $("#adminHtml").value = article?.html?.trim() || "<h2>Название</h2>\n<p>Текст материала.</p>";
  renderPreview();
  buildTree();
}

function saveForm() {
  const existing = articles.find((article) => article.id === selectedId);
  const title = $("#adminTitle").value.trim();
  const category = $("#adminCategory").value.trim();
  const html = sanitizeHtml($("#adminHtml").value.trim());
  const isLessonMaterial = $("#adminIsLesson").checked;
  const saved = {
    id: existing?.id || slugify(title),
    title,
    category,
    updated: new Date().toLocaleDateString("ru-RU"),
    roles: existing?.roles || ["owner"],
    tags: existing?.tags || [],
    summary: plainText(html).slice(0, 150) || "Без описания",
    html,
  };

  if (isLessonMaterial) {
    saved.contentType = "lesson";
    saved.lessonCourse = $("#adminLessonCourse").value.trim() || category || "Без курса";
    saved.lessonAge = $("#adminLessonAge").value.trim() || "Без возраста";
    saved.lessonTitle = $("#adminLessonTitle").value.trim() || title;
    saved.lessonId = existing?.lessonId || slugify(`${saved.lessonCourse}-${saved.lessonAge}-${saved.lessonTitle}`);
    saved.materialType = $("#adminMaterialType").value.trim() || title;
    saved.lessonOrder = Number($("#adminLessonOrder").value || 0) || undefined;
  }

  if (existing) {
    articles = articles.map((article) => (article.id === existing.id ? saved : article));
  } else {
    articles.unshift(saved);
  }
  selectedId = saved.id;
  saveArticles();
  loadForm(selectedId);
}

function renderPreview() {
  $("#previewFrame").innerHTML = renderStoredImages($("#adminHtml").value);
}

function newArticle(isLessonMaterial = false) {
  selectedId = null;
  loadForm(null);
  $("#adminCategory").value = isLessonMaterial ? "Методики занятий" : "";
  $("#adminIsLesson").checked = isLessonMaterial;
  if (isLessonMaterial) {
    $("#adminLessonCourse").value = "Базовый курс";
    $("#adminLessonAge").value = "4-5 лет";
    $("#adminLessonTitle").value = "Новый урок";
    $("#adminMaterialType").value = "Сценарий";
    $("#adminLessonOrder").value = "1";
  }
}

$("#contentTree").addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  loadForm(button.dataset.id);
});

$("#newArticleAdmin").addEventListener("click", () => newArticle(false));
$("#newLessonMaterialAdmin").addEventListener("click", () => newArticle(true));
$("#saveContent").addEventListener("click", saveForm);

$("#previewToggle").addEventListener("click", () => {
  const grid = document.querySelector(".editor-grid");
  const preview = $("#previewPane");
  preview.hidden = !preview.hidden;
  grid.classList.toggle("has-preview", !preview.hidden);
  renderPreview();
});

$("#adminHtml").addEventListener("input", renderPreview);
$("#adminSearch").addEventListener("input", (event) => {
  query = event.target.value;
  buildTree();
});

$("#adminImportHtml").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const html = String(reader.result || "").trim();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const importedTitle = doc.querySelector("h1, h2, title")?.textContent?.trim();
    if (!$("#adminTitle").value.trim()) $("#adminTitle").value = importedTitle || file.name.replace(/\.(html|htm)$/i, "");
    if (!$("#adminCategory").value.trim()) $("#adminCategory").value = "Импорт";
    $("#adminHtml").value = sanitizeHtml(html);
    event.target.value = "";
    renderPreview();
  });
  reader.readAsText(file);
});

$("#adminImage").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const imageNumber = Object.keys(imageStore).length + 1;
    const imageId = `img-${Date.now()}`;
    const caption = window.prompt("Подпись к картинке", `Рисунок ${imageNumber}. ${file.name}`) || `Рисунок ${imageNumber}`;
    imageStore[imageId] = { name: file.name, caption, src: reader.result };
    saveImages();
    const html = `\n<figure class="article-image" id="${imageId}"><img src="franchise-image:${imageId}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>\n`;
    const textarea = $("#adminHtml");
    const start = textarea.selectionStart || textarea.value.length;
    const end = textarea.selectionEnd || textarea.value.length;
    textarea.value = `${textarea.value.slice(0, start)}${html}${textarea.value.slice(end)}`;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + html.length;
    event.target.value = "";
    renderPreview();
  });
  reader.readAsDataURL(file);
});

saveArticles();
loadForm(selectedId);
