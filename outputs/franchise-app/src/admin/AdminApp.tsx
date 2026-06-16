import { Refine } from "@refinedev/core";
import { RefineThemes, useNotificationProvider } from "@refinedev/antd";
import routerProvider, { NavigateToResource } from "@refinedev/react-router";
import { ConfigProvider, App as AntdApp } from "antd";
import { lazy } from "react";
import { Route, Routes } from "react-router";
import { localDataProvider } from "../data/localDataProvider";
import { AccessSettings } from "./AccessSettings";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLayout } from "./AdminLayout";
import { ArticleList } from "./ArticleList";
import { AuditLog } from "./AuditLog";
import { FileLibrary } from "./FileLibrary";
import { LessonTree } from "./LessonTree";
import "@refinedev/antd/dist/reset.css";

const ArticleEdit = lazy(() => import("./ArticleEdit").then((module) => ({ default: module.ArticleEdit })));

export function AdminApp() {
  return (
    <ConfigProvider theme={RefineThemes.Green}>
      <AntdApp>
        <Refine
          routerProvider={routerProvider}
          dataProvider={localDataProvider}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: "articles",
              list: "/admin/articles",
              create: "/admin/articles/new",
              edit: "/admin/articles/:id",
              meta: { label: "Материалы" },
            },
            {
              name: "lessons",
              list: "/admin/lessons",
              meta: { label: "Дерево уроков" },
            },
            {
              name: "files",
              list: "/admin/files",
              meta: { label: "Файлы" },
            },
            {
              name: "access",
              list: "/admin/access",
              meta: { label: "Права доступа" },
            },
            {
              name: "audit",
              list: "/admin/audit",
              meta: { label: "Последние действия" },
            },
          ]}
        >
          <Routes>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleEdit mode="create" />} />
              <Route path="articles/:id" element={<ArticleEdit mode="edit" />} />
              <Route path="lessons" element={<LessonTree />} />
              <Route path="files" element={<FileLibrary />} />
              <Route path="access" element={<AccessSettings />} />
              <Route path="audit" element={<AuditLog />} />
            </Route>
            <Route path="*" element={<NavigateToResource resource="articles" />} />
          </Routes>
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}
