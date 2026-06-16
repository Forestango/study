import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ARTICLES_CHANGED_EVENT,
  IMAGES_CHANGED_EVENT,
  getArticles,
  getArticlesAsync,
  getImagesAsync,
  getLessonTreeAsync,
  getStorageStatus,
  getStoredFilesAsync,
  isLessonArticle,
  renderStoredImages,
} from "../data/storage";
import { sanitizeHtml } from "../shared/html";
import type { Article, LessonTreeNode, Role, StoredFile } from "../shared/types";

const basePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
const withBasePath = (path: string) => `${basePath}${path}`;
const currentPortalRole = (localStorage.getItem("franchisePortalRole") || "owner") as Role;
const canSeeProtectionState = currentPortalRole === "owner";

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} КБ`;
  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
};

export function PortalApp() {
  const [articles, setArticles] = useState(() => getArticles());
  const [lessonTree, setLessonTree] = useState<LessonTreeNode[]>([]);
  const [, refreshImages] = useState(0);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [storageStatus, setStorageStatus] = useState(() => getStorageStatus());
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const initialHashId = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("article") || undefined;
  const initialHashArticle = articles.find((item) => item.id === initialHashId);
  const [mode, setMode] = useState<"articles" | "lessons">(initialHashArticle && isLessonArticle(initialHashArticle) ? "lessons" : "articles");
  const [selectedId, setSelectedId] = useState<string | undefined>(initialHashArticle?.id);
  const [query, setQuery] = useState("");
  const needle = query.toLowerCase().trim();
  const matches = (text: string) => !needle || text.toLowerCase().includes(needle);
  const standalone = articles.filter((article) => !isLessonArticle(article)).filter((article) => matches(`${article.title} ${article.category} ${article.summary || ""} ${article.html}`));

  const articleById = useMemo(() => new Map(articles.map((article) => [article.id, article])), [articles]);
  const nodesByParent = useMemo(() => {
    const map = new Map<string | undefined, LessonTreeNode[]>();
    lessonTree.forEach((node) => {
      const siblings = map.get(node.parentId) || [];
      siblings.push(node);
      map.set(node.parentId, siblings);
    });
    map.forEach((nodes) => nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)));
    return map;
  }, [lessonTree]);

  const nodeHasMatch = (node: LessonTreeNode): boolean => {
    const article = node.articleId ? articleById.get(node.articleId) : undefined;
    const ownText = `${node.title} ${article?.title || ""} ${article?.summary || ""} ${article?.html || ""}`;
    return matches(ownText) || (nodesByParent.get(node.id) || []).some(nodeHasMatch);
  };

  const lessonMaterials = useMemo(
    () => lessonTree.filter((node) => node.type === "material" && node.articleId).map((node) => articleById.get(node.articleId!)).filter(Boolean) as Article[],
    [articleById, lessonTree],
  );

  const selectedArticle = useMemo(() => {
    if (mode === "articles") return standalone.find((article) => article.id === selectedId) || standalone[0];
    return lessonMaterials.find((article) => article.id === selectedId) || lessonMaterials[0];
  }, [lessonMaterials, mode, selectedId, standalone]);

  const selectedMaterialNode = selectedArticle ? lessonTree.find((node) => node.type === "material" && node.articleId === selectedArticle.id) : undefined;
  const selectedPath = useMemo(() => {
    if (!selectedMaterialNode) return [] as LessonTreeNode[];
    const path = [selectedMaterialNode];
    let current = selectedMaterialNode;
    while (current.parentId) {
      const parent = lessonTree.find((node) => node.id === current.parentId);
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }
    return path;
  }, [lessonTree, selectedMaterialNode]);
  const selectedLessonNode = [...selectedPath].reverse().find((node) => node.type === "lesson");
  const siblingMaterials = selectedLessonNode
    ? (nodesByParent.get(selectedLessonNode.id) || [])
        .filter((node) => node.type === "material" && node.articleId)
        .map((node) => ({ node, article: articleById.get(node.articleId!) }))
        .filter((item): item is { node: LessonTreeNode; article: Article } => Boolean(item.article))
    : [];
  const selectedFiles = selectedArticle
    ? files.filter((file) => file.articleIds.includes(selectedArticle.id) || selectedArticle.fileIds?.includes(file.id))
    : [];

  useEffect(() => {
    const openFromHash = () => {
      const hashId = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("article");
      const article = articles.find((item) => item.id === hashId);
      if (!article) return;
      setMode(isLessonArticle(article) ? "lessons" : "articles");
      setSelectedId(article.id);
    };
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [articles]);

  useEffect(() => {
    const refreshArticles = async () => {
      const [nextArticles, nextTree] = await Promise.all([getArticlesAsync(), getLessonTreeAsync()]);
      setArticles(nextArticles);
      setLessonTree(nextTree);
      setStorageStatus(getStorageStatus());
    };
    const refreshStoredImages = async () => {
      const [, nextFiles] = await Promise.all([getImagesAsync(), getStoredFilesAsync()]);
      setFiles(nextFiles);
      refreshImages((value) => value + 1);
      setStorageStatus(getStorageStatus());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "franchiseArticles") refreshArticles();
      if (event.key === "franchiseImages") refreshStoredImages();
    };

    refreshArticles();
    refreshStoredImages();
    window.addEventListener(ARTICLES_CHANGED_EVENT, refreshArticles);
    window.addEventListener(IMAGES_CHANGED_EVENT, refreshStoredImages);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshArticles);
    return () => {
      window.removeEventListener(ARTICLES_CHANGED_EVENT, refreshArticles);
      window.removeEventListener(IMAGES_CHANGED_EVENT, refreshStoredImages);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshArticles);
    };
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      history.replaceState(null, "", withBasePath(`/portal#article=${encodeURIComponent(selectedArticle.id)}`));
    }
  }, [selectedArticle]);

  useEffect(() => {
    const prevent = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, button, a")) return;
      event.preventDefault();
    };
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, button, a")) return;
      if ((event.metaKey || event.ctrlKey) && ["a", "c", "x", "s", "p", "u"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };
    document.addEventListener("copy", prevent);
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("selectstart", prevent);
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("keydown", keydown);
    };
  }, []);

  const copyLink = async () => {
    if (!selectedArticle) return;
    const url = `${window.location.origin}${withBasePath(`/portal#article=${encodeURIComponent(selectedArticle.id)}`)}`;
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
    window.setTimeout(() => {
      const fallback = () => {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      };
      navigator.clipboard?.writeText(url).catch(fallback) || fallback();
    });
  };

  const renderLessonNodes = (parentId?: string, depth = 0): React.ReactNode =>
    (nodesByParent.get(parentId) || []).filter(nodeHasMatch).map((node) => {
      const article = node.articleId ? articleById.get(node.articleId) : undefined;
      const isActive = article?.id === selectedArticle?.id;
      if (node.type === "material" && article) {
        return (
          <button
            key={node.id}
            className={`portal-card portal-card-material ${isActive ? "active" : ""}`}
            style={{ marginLeft: depth * 12 }}
            onClick={() => setSelectedId(article.id)}
          >
            <span>{node.title || article.materialType || "Материал"}</span>
            <strong>{article.title}</strong>
            <small>{article.summary}</small>
          </button>
        );
      }

      return (
        <div className={`lesson-tree-node lesson-tree-node-${node.type}`} key={node.id} style={{ marginLeft: depth * 10 }}>
          <strong>{node.title}</strong>
          {renderLessonNodes(node.id, depth + 1)}
        </div>
      );
    });

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div className="profile-pill">
          <span>В</span>
          <div>
            <strong>Владислав Костенко</strong>
            <small>Владелец франшизы</small>
          </div>
        </div>
        <div className="mode-switch">
          <button className={mode === "articles" ? "active" : ""} onClick={() => setMode("articles")}>Статьи</button>
          <button className={mode === "lessons" ? "active" : ""} onClick={() => setMode("lessons")}>Уроки</button>
        </div>
        <label className="portal-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по материалам" />
        </label>
        <div className="header-actions">
          <span className={`sync-status sync-status-${storageStatus.mode}`} title={storageStatus.detail}>
            {storageStatus.mode === "connected" ? "Общая база" : storageStatus.mode === "error" ? "Ошибка базы" : "Локально"}
          </span>
          <Link to="/admin/articles">Админка</Link>
        </div>
      </header>

      <section className="portal-grid">
        <aside className="portal-list">
          {mode === "articles" &&
            standalone.map((article) => (
              <button key={article.id} className={`portal-card ${selectedArticle?.id === article.id ? "active" : ""}`} onClick={() => setSelectedId(article.id)}>
                <span>{article.category}</span>
                <strong>{article.title}</strong>
                <small>{article.summary}</small>
              </button>
            ))}
          {mode === "lessons" &&
            renderLessonNodes()}
        </aside>

        <article className="reader">
          {selectedArticle ? (
            <>
              <div className="reader-actions">
                <div className="shield-strip">
                  {canSeeProtectionState && (
                    <>
                      <span>Копирование отключено</span>
                      <span>Печать отключена</span>
                    </>
                  )}
                  {selectedPath.length > 1 && <span>{selectedPath.slice(0, -1).map((node) => node.title).join(" · ")}</span>}
                </div>
                <button className="copy-link-button" type="button" onClick={copyLink}>
                  {copyState === "copied" ? "Ссылка скопирована" : "Скопировать ссылку"}
                </button>
              </div>
              {selectedLessonNode && (
                <header className="lesson-head">
                  <small>Методика занятия</small>
                  <h1>{selectedLessonNode.title}</h1>
                  {!!siblingMaterials.length && (
                    <div className="lesson-tabs">
                      {siblingMaterials.map(({ node, article }) => (
                        <button key={node.id} className={selectedArticle.id === article.id ? "active" : ""} onClick={() => setSelectedId(article.id)}>
                          {node.title || article.materialType || article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </header>
              )}
              <div dangerouslySetInnerHTML={{ __html: renderStoredImages(sanitizeHtml(selectedArticle.html)) }} />
              {!!selectedFiles.length && (
                <section className="reader-files">
                  <h2>Файлы к материалу</h2>
                  <div>
                    {selectedFiles.map((file) => (
                      <a key={file.id} href={file.src} download={file.name}>
                        <strong>{file.name}</strong>
                        <span>{file.description || "Скачать файл"}</span>
                        <small>{formatFileSize(file.size)}</small>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p>Материал не выбран.</p>
          )}
        </article>
      </section>
    </main>
  );
}
