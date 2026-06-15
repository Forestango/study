import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ARTICLES_CHANGED_EVENT, IMAGES_CHANGED_EVENT, getArticles, getLessonGroups, isLessonArticle, renderStoredImages } from "../data/storage";
import { sanitizeHtml } from "../shared/html";

const basePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");
const withBasePath = (path: string) => `${basePath}${path}`;

export function PortalApp() {
  const [articles, setArticles] = useState(() => getArticles());
  const [, refreshImages] = useState(0);
  const initialHashId = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("article") || undefined;
  const initialHashArticle = articles.find((item) => item.id === initialHashId);
  const [mode, setMode] = useState<"articles" | "lessons">(initialHashArticle && isLessonArticle(initialHashArticle) ? "lessons" : "articles");
  const [selectedId, setSelectedId] = useState<string | undefined>(initialHashArticle?.id);
  const [query, setQuery] = useState("");
  const needle = query.toLowerCase().trim();
  const matches = (text: string) => !needle || text.toLowerCase().includes(needle);
  const standalone = articles.filter((article) => !isLessonArticle(article)).filter((article) => matches(`${article.title} ${article.category} ${article.summary || ""} ${article.html}`));
  const lessons = getLessonGroups(
    articles.filter((article) => matches(`${article.title} ${article.category} ${article.lessonTitle || ""} ${article.lessonCourse || ""} ${article.lessonAge || ""} ${article.html}`)),
  );

  const selectedArticle = useMemo(() => {
    if (mode === "articles") return standalone.find((article) => article.id === selectedId) || standalone[0];
    const material = lessons.flatMap((lesson) => lesson.materials).find((article) => article.id === selectedId);
    return material || lessons[0]?.materials[0];
  }, [lessons, mode, selectedId, standalone]);

  const selectedLesson = lessons.find((lesson) => lesson.materials.some((material) => material.id === selectedArticle?.id));

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
    const refreshArticles = () => setArticles(getArticles());
    const refreshStoredImages = () => refreshImages((value) => value + 1);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "franchiseArticles") refreshArticles();
      if (event.key === "franchiseImages") refreshStoredImages();
    };

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
      if (target?.matches("input, textarea")) return;
      event.preventDefault();
    };
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea")) return;
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
    await navigator.clipboard?.writeText(url).catch(() => window.prompt("Ссылка на материал", url));
  };

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
        <div className="header-actions">
          <Link to="/admin/articles">Админка</Link>
          <Link to="/admin/lessons">Уроки в админке</Link>
        </div>
      </header>

      <section className="portal-toolbar">
        <div className="mode-switch">
          <button className={mode === "articles" ? "active" : ""} onClick={() => setMode("articles")}>Статьи</button>
          <button className={mode === "lessons" ? "active" : ""} onClick={() => setMode("lessons")}>Уроки</button>
        </div>
        <label className="portal-search">
          <span>⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по материалам..." />
        </label>
      </section>

      <section className="portal-grid">
        <aside className="portal-list panel panel-pad">
          {mode === "articles" &&
            standalone.map((article) => (
              <button key={article.id} className={`portal-card ${selectedArticle?.id === article.id ? "active" : ""}`} onClick={() => setSelectedId(article.id)}>
                <span>{article.category}</span>
                <strong>{article.title}</strong>
                <small>{article.summary}</small>
              </button>
            ))}
          {mode === "lessons" &&
            lessons.map((lesson) => (
              <div className="lesson-tree" key={lesson.id}>
                <strong>{lesson.course}</strong>
                <span>{lesson.age}</span>
                <b>{lesson.title}</b>
                {lesson.materials.map((material) => (
                  <button key={material.id} className={`portal-card material ${selectedArticle?.id === material.id ? "active" : ""}`} onClick={() => setSelectedId(material.id)}>
                    {material.materialType || material.title}
                  </button>
                ))}
              </div>
            ))}
        </aside>

        <article className="reader panel panel-pad">
          {selectedArticle ? (
            <>
              <div className="reader-actions">
                <div className="shield-strip">
                  <span>Копирование отключено</span>
                  <span>Печать отключена</span>
                  {selectedLesson && <span>{selectedLesson.course} · {selectedLesson.age}</span>}
                </div>
                <button onClick={copyLink}>Скопировать ссылку</button>
              </div>
              {selectedLesson && (
                <header className="lesson-head">
                  <small>Методика занятия</small>
                  <h1>{selectedLesson.title}</h1>
                  <div className="lesson-tabs">
                    {selectedLesson.materials.map((material) => (
                      <button key={material.id} className={selectedArticle.id === material.id ? "active" : ""} onClick={() => setSelectedId(material.id)}>
                        {material.materialType || material.title}
                      </button>
                    ))}
                  </div>
                </header>
              )}
              <div dangerouslySetInnerHTML={{ __html: renderStoredImages(sanitizeHtml(selectedArticle.html)) }} />
            </>
          ) : (
            <p>Материал не выбран.</p>
          )}
        </article>
      </section>
    </main>
  );
}
