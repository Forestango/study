import { Button, Tag, Typography } from "antd";
import { Link, NavLink, Outlet } from "react-router";
import { getStorageStatus } from "../data/storage";

const navGroups = [
  {
    title: "Контент",
    items: [
      { to: "/admin", label: "Обзор", end: true },
      { to: "/admin/articles", label: "Материалы" },
      { to: "/admin/articles/new", label: "Новый материал" },
      { to: "/admin/lessons", label: "Дерево уроков" },
      { to: "/admin/files", label: "Файлы" },
    ],
  },
  {
    title: "Контроль",
    items: [
      { to: "/admin/access", label: "Права доступа" },
      { to: "/admin/audit", label: "Последние действия" },
    ],
  },
];

const statusText = {
  connected: "Общая база",
  local: "Локально",
  error: "Ошибка базы",
};

const statusColor = {
  connected: "green",
  local: "gold",
  error: "red",
};

export function AdminLayout() {
  const status = getStorageStatus();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>В</span>
          <div>
            <strong>Админка базы</strong>
            <small>Study portal</small>
          </div>
        </div>

        <nav className="admin-nav">
          {navGroups.map((group) => (
            <section key={group.title}>
              <Typography.Text className="admin-nav-title">{group.title}</Typography.Text>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : "")}>
                  {item.label}
                </NavLink>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <Typography.Text className="admin-eyebrow">Панель управления</Typography.Text>
            <Typography.Title level={2}>Контент и уроки</Typography.Title>
          </div>
          <div className="admin-topbar-actions">
            <Tag color={statusColor[status.mode]}>{statusText[status.mode]}</Tag>
            <Link to="/portal">
              <Button>Открыть портал</Button>
            </Link>
          </div>
        </header>
        {status.mode === "error" && <div className="admin-alert">База не подтвердила синхронизацию: {status.detail}</div>}
        <Outlet />
      </main>
    </div>
  );
}
