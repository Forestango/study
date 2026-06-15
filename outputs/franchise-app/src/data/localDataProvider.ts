import type { DataProvider } from "@refinedev/core";
import { getArticles, setArticles } from "./storage";
import { summaryFromHtml } from "../shared/html";

export const localDataProvider: DataProvider = {
  getList: async ({ resource }) => {
    if (resource !== "articles") return { data: [], total: 0 };
    const data = getArticles();
    return { data: data as any, total: data.length };
  },
  getOne: async ({ id }) => {
    const record = getArticles().find((item) => item.id === String(id));
    if (!record) throw new Error("Record not found");
    return { data: record as any };
  },
  create: async ({ variables }) => {
    const article = {
      ...(variables as any),
      id: (variables as any).id || crypto.randomUUID(),
      updated: new Date().toLocaleDateString("ru-RU"),
      summary: summaryFromHtml((variables as any).html || ""),
      roles: (variables as any).roles || ["owner"],
    };
    setArticles([article, ...getArticles()]);
    return { data: article as any };
  },
  update: async ({ id, variables }) => {
    const articles = getArticles();
    const current = articles.find((item) => item.id === String(id));
    if (!current) throw new Error("Record not found");
    const updated = {
      ...current,
      ...(variables as any),
      updated: new Date().toLocaleDateString("ru-RU"),
      summary: summaryFromHtml((variables as any).html || current.html || ""),
    };
    setArticles(articles.map((item) => (item.id === String(id) ? updated : item)));
    return { data: updated as any };
  },
  deleteOne: async ({ id }) => {
    const articles = getArticles();
    const deleted = articles.find((item) => item.id === String(id));
    setArticles(articles.filter((item) => item.id !== String(id)));
    return { data: (deleted || { id }) as any };
  },
  getApiUrl: () => "",
};
