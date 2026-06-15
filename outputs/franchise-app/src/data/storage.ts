import type { Article } from "../shared/types";
import { seedArticles } from "./seed";

const ARTICLES_KEY = "franchiseArticles";
const IMAGES_KEY = "franchiseImages";
export const ARTICLES_CHANGED_EVENT = "franchise:articles-changed";
export const IMAGES_CHANGED_EVENT = "franchise:images-changed";

export function getArticles(): Article[] {
  const saved = localStorage.getItem(ARTICLES_KEY);
  if (!saved) {
    setArticles(seedArticles);
    return seedArticles;
  }
  const articles = JSON.parse(saved) as Article[];
  const ids = new Set(articles.map((article) => article.id));
  const missingSeed = seedArticles.filter((article) => !ids.has(article.id));
  if (!missingSeed.length) return articles;
  const restored = [...articles, ...missingSeed];
  setArticles(restored);
  return restored;
}

export function setArticles(articles: Article[]) {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  window.dispatchEvent(new CustomEvent(ARTICLES_CHANGED_EVENT));
}

export type StoredImage = {
  name: string;
  caption: string;
  src: string;
};

export function getImages(): Record<string, StoredImage> {
  return JSON.parse(localStorage.getItem(IMAGES_KEY) || "{}");
}

export function setImages(images: Record<string, StoredImage>) {
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  window.dispatchEvent(new CustomEvent(IMAGES_CHANGED_EVENT));
}

export function renderStoredImages(html: string) {
  const images = getImages();
  return html.replace(/src="franchise-image:([^"]+)"/g, (_match, imageId) => {
    const image = images[imageId];
    return `src="${image?.src || ""}"`;
  });
}

export function isLessonArticle(article: Article) {
  return article.contentType === "lesson" || article.category === "Методики занятий";
}

export function getLessonGroups(articles = getArticles()) {
  const lessons = new Map<string, { id: string; title: string; course: string; age: string; updated: string; materials: Article[] }>();
  articles.filter(isLessonArticle).forEach((article) => {
    const id = article.lessonId || `single-${article.id}`;
    if (!lessons.has(id)) {
      lessons.set(id, {
        id,
        title: article.lessonTitle || article.title,
        course: article.lessonCourse || article.category,
        age: article.lessonAge || "Без возраста",
        updated: article.updated,
        materials: [],
      });
    }
    lessons.get(id)!.materials.push(article);
  });
  return Array.from(lessons.values()).map((lesson) => ({
    ...lesson,
    materials: lesson.materials.sort((a, b) => (a.lessonOrder || 99) - (b.lessonOrder || 99)),
  }));
}
