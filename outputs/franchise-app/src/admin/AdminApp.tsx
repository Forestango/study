import { Refine } from "@refinedev/core";
import { RefineThemes, ThemedLayout, ThemedTitle, useNotificationProvider } from "@refinedev/antd";
import routerProvider, { NavigateToResource } from "@refinedev/react-router";
import { ConfigProvider, App as AntdApp } from "antd";
import { Outlet, Route, Routes } from "react-router";
import { localDataProvider } from "../data/localDataProvider";
import { AccessSettings } from "./AccessSettings";
import { ArticleEdit } from "./ArticleEdit";
import { ArticleList } from "./ArticleList";
import { AuditLog } from "./AuditLog";
import { LessonTree } from "./LessonTree";
import "@refinedev/antd/dist/reset.css";

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
            <Route
              element={
                <ThemedLayout
                  Title={({ collapsed }: { collapsed: boolean }) => (
                    <ThemedTitle collapsed={collapsed} text="Админка" />
                  )}
                >
                  <Outlet />
                </ThemedLayout>
              }
            >
              <Route index element={<NavigateToResource resource="articles" />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/new" element={<ArticleEdit mode="create" />} />
              <Route path="articles/:id" element={<ArticleEdit mode="edit" />} />
              <Route path="lessons" element={<LessonTree />} />
              <Route path="access" element={<AccessSettings />} />
              <Route path="audit" element={<AuditLog />} />
            </Route>
          </Routes>
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}
