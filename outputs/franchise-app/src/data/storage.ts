import type { Article, AuditEvent, LessonTreeNode } from "../shared/types";
import { seedArticles } from "./seed";

const ARTICLES_KEY = "franchiseArticles";
const IMAGES_KEY = "franchiseImages";
const META_KEY = "__franchiseMeta";
const SUPABASE_TABLE = "franchise_content";
const SUPABASE_ROW_ID = "default";
export const ARTICLES_CHANGED_EVENT = "franchise:articles-changed";
export const IMAGES_CHANGED_EVENT = "franchise:images-changed";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasRemoteBackend = Boolean(supabaseUrl && supabasePublishableKey);
let remoteStatus: "local" | "connected" | "error" = hasRemoteBackend ? "local" : "local";
let remoteStatusDetail = hasRemoteBackend ? "Supabase configured, waiting for first sync" : "Supabase env is not configured";

type ContentState = {
  articles: Article[];
  images: Record<string, StoredImage>;
};

type StoredContentMeta = {
  lessonTree?: LessonTreeNode[];
  auditEvents?: AuditEvent[];
};

function readCachedArticles(): Article[] {
  const saved = localStorage.getItem(ARTICLES_KEY);
  if (!saved) return seedArticles;
  return JSON.parse(saved) as Article[];
}

function mergeArticles(remoteArticles: Article[], localArticles: Article[]) {
  const byId = new Map(remoteArticles.map((article) => [article.id, article]));
  localArticles.forEach((article) => {
    if (!byId.has(article.id)) byId.set(article.id, article);
  });
  return Array.from(byId.values());
}

function markRemoteConnected(detail = "Supabase sync is active") {
  remoteStatus = "connected";
  remoteStatusDetail = detail;
}

function markRemoteError(error: unknown) {
  remoteStatus = "error";
  remoteStatusDetail = error instanceof Error ? error.message : "Supabase sync failed";
}

export function getStorageStatus() {
  return {
    mode: hasRemoteBackend ? remoteStatus : "local",
    detail: remoteStatusDetail,
  };
}

function dispatchContentEvents() {
  window.dispatchEvent(new CustomEvent(ARTICLES_CHANGED_EVENT));
  window.dispatchEvent(new CustomEvent(IMAGES_CHANGED_EVENT));
}

function getStoredMeta(images = getImages()): StoredContentMeta {
  return ((images as any)[META_KEY] || {}) as StoredContentMeta;
}

function setStoredMeta(images: Record<string, StoredImage>, meta: StoredContentMeta) {
  return {
    ...images,
    [META_KEY]: meta,
  } as unknown as Record<string, StoredImage>;
}

function createAuditEvent(action: string, detail: string): AuditEvent {
  return {
    id: crypto.randomUUID(),
    action,
    detail,
    actor: "Админка",
    createdAt: new Date().toLocaleString("ru-RU"),
  };
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
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${supabasePublishableKey}`,
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
  try {
    const rows = await requestRemoteContent("GET");
    const row = rows[0];
    const localArticles = readCachedArticles();
    const localImages = getImages();

    if (row?.articles?.length) {
      const mergedArticles = mergeArticles(row.articles, localArticles);
      const mergedImages = { ...(row.images || {}), ...localImages };
      const state = {
        articles: mergedArticles,
        images: mergedImages,
      };

      cacheState(state);
      markRemoteConnected();
      if (mergedArticles.length !== row.articles.length || Object.keys(mergedImages).length !== Object.keys(row.images || {}).length) {
        await saveRemoteState(state);
      }
      return state;
    }

    const state = {
      articles: localArticles,
      images: localImages,
    };
    await saveRemoteState(state);
    markRemoteConnected("Supabase row was initialized from this browser");
    return state;
  } catch (error) {
    markRemoteError(error);
    return {
      articles: getArticles(),
      images: getImages(),
    };
  }
}

async function saveRemoteState(state: ContentState) {
  cacheState(state);
  await requestRemoteContent("POST", state);
  markRemoteConnected();
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

function buildLessonTreeFromArticles(articles: Article[]) {
  const nodes: LessonTreeNode[] = [];
  const courseIds = new Map<string, string>();
  const ageIds = new Map<string, string>();

  articles.filter(isLessonArticle).forEach((article, index) => {
    const course = article.lessonCourse || article.category || "Методики занятий";
    const age = article.lessonAge || "Без возраста";
    const lessonTitle = article.lessonTitle || article.title;
    const courseId = courseIds.get(course) || `course-${courseIds.size + 1}-${course.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-")}`;
    courseIds.set(course, courseId);

    if (!nodes.some((node) => node.id === courseId)) {
      nodes.push({ id: courseId, type: "folder", title: course, order: courseIds.size });
    }

    const ageKey = `${courseId}/${age}`;
    const ageId = ageIds.get(ageKey) || `age-${ageIds.size + 1}-${age.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-")}`;
    ageIds.set(ageKey, ageId);

    if (!nodes.some((node) => node.id === ageId)) {
      nodes.push({ id: ageId, parentId: courseId, type: "folder", title: age, order: ageIds.size });
    }

    const lessonId = article.lessonId || `lesson-${article.id}`;
    if (!nodes.some((node) => node.id === lessonId)) {
      nodes.push({ id: lessonId, parentId: ageId, type: "lesson", title: lessonTitle, order: index + 1, roles: article.roles });
    }

    nodes.push({
      id: `material-${article.id}`,
      parentId: lessonId,
      type: "material",
      title: article.materialType || article.title,
      order: article.lessonOrder || index + 1,
      articleId: article.id,
      roles: article.roles,
    });
  });

  return nodes;
}

export async function getLessonTreeAsync(): Promise<LessonTreeNode[]> {
  const images = await getImagesAsync();
  const meta = getStoredMeta(images);
  if (meta.lessonTree?.length) return meta.lessonTree;
  const lessonTree = buildLessonTreeFromArticles(await getArticlesAsync());
  await setLessonTreeAsync(lessonTree);
  return lessonTree;
}

export async function setLessonTreeAsync(lessonTree: LessonTreeNode[]) {
  const images = await getImagesAsync();
  const meta = getStoredMeta(images);
  await setImagesAsync(setStoredMeta(images, { ...meta, lessonTree }));
}

export async function setArticlesAndLessonTreeAsync(
  articles: Article[],
  lessonTree: LessonTreeNode[],
  audit?: { action: string; detail: string },
) {
  const updateImages = (images: Record<string, StoredImage>) => {
    const meta = getStoredMeta(images);
    const auditEvents = audit ? [createAuditEvent(audit.action, audit.detail), ...(meta.auditEvents || [])].slice(0, 200) : meta.auditEvents;
    return setStoredMeta(images, { ...meta, lessonTree, auditEvents });
  };

  if (!hasRemoteBackend) {
    const images = updateImages(getImages());
    cacheState({ articles, images });
    dispatchContentEvents();
    return;
  }

  const state = await loadRemoteState();
  await saveRemoteState({ articles, images: updateImages(state.images) });
  dispatchContentEvents();
}

export async function getAuditEventsAsync() {
  const images = await getImagesAsync();
  return getStoredMeta(images).auditEvents || [];
}

export async function addAuditEvent(action: string, detail: string) {
  const images = await getImagesAsync();
  const meta = getStoredMeta(images);
  const event = createAuditEvent(action, detail);
  await setImagesAsync(setStoredMeta(images, { ...meta, auditEvents: [event, ...(meta.auditEvents || [])].slice(0, 200) }));
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
