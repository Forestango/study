import type { Article } from "../shared/types";
import { seedArticles } from "./seed";

const ARTICLES_KEY = "franchiseArticles";
const IMAGES_KEY = "franchiseImages";
const SUPABASE_TABLE = "franchise_content";
const SUPABASE_ROW_ID = "default";
export const ARTICLES_CHANGED_EVENT = "franchise:articles-changed";
export const IMAGES_CHANGED_EVENT = "franchise:images-changed";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasRemoteBackend = Boolean(supabaseUrl && supabaseAnonKey);

type ContentState = {
  articles: Article[];
  images: Record<string, StoredImage>;
};

function dispatchContentEvents() {
  window.dispatchEvent(new CustomEvent(ARTICLES_CHANGED_EVENT));
  window.dispatchEvent(new CustomEvent(IMAGES_CHANGED_EVENT));
}

function cacheState(state: ContentState) {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(state.articles));
  localStorage.setItem(IMAGES_KEY, JSON.stringify(state.images));
}

async function requestRemoteContent(method: "GET" | "POST", body?: ContentState) {
  if (!hasRemoteBackend) throw new Error("Remote backend is not configured");
  const endpoint =
    method === "GET"
      ? `${supabaseUrl}/rest/v1/${SUPABASE_TABLE}?id=eq.${SUPABASE_ROW_ID}&select=articles,images`
      : `${supabaseUrl}/rest/v1/${SUPABASE_TABLE}`;
  const response = await fetch(endpoint, {
    method,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(method === "POST" ? { Prefer: "resolution=merge-duplicates" } : {}),
    },
    body: body ? JSON.stringify({ id: SUPABASE_ROW_ID, ...body }) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return method === "GET" ? ((await response.json()) as Partial<ContentState>[]) : [];
}

async function loadRemoteState(): Promise<ContentState> {
  const rows = await requestRemoteContent("GET");
  const row = rows[0];
  if (row?.articles?.length) {
    const state = {
      articles: row.articles,
      images: row.images || {},
    };
    cacheState(state);
    return state;
  }

  const state = {
    articles: seedArticles,
    images: getImages(),
  };
  await saveRemoteState(state);
  return state;
}

async function saveRemoteState(state: ContentState) {
  cacheState(state);
  await requestRemoteContent("POST", state);
}

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

export async function getArticlesAsync(): Promise<Article[]> {
  if (!hasRemoteBackend) return getArticles();
  const state = await loadRemoteState();
  return state.articles;
}

export async function setArticlesAsync(articles: Article[]) {
  if (!hasRemoteBackend) {
    setArticles(articles);
    return;
  }

  const { images } = await loadRemoteState();
  await saveRemoteState({ articles, images });
  dispatchContentEvents();
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

export async function getImagesAsync(): Promise<Record<string, StoredImage>> {
  if (!hasRemoteBackend) return getImages();
  const state = await loadRemoteState();
  return state.images;
}

export async function setImagesAsync(images: Record<string, StoredImage>) {
  if (!hasRemoteBackend) {
    setImages(images);
    return;
  }

  const { articles } = await loadRemoteState();
  await saveRemoteState({ articles, images });
  dispatchContentEvents();
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
