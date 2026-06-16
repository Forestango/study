import { Button, Card, Col, Row, Space, Statistic, Timeline, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getArticlesAsync, getAuditEventsAsync, getLessonTreeAsync, isLessonArticle } from "../data/storage";
import type { Article, AuditEvent, LessonTreeNode } from "../shared/types";

export function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nodes, setNodes] = useState<LessonTreeNode[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    Promise.all([getArticlesAsync(), getLessonTreeAsync(), getAuditEventsAsync()]).then(([nextArticles, nextNodes, nextEvents]) => {
      setArticles(nextArticles);
      setNodes(nextNodes);
      setEvents(nextEvents);
    });
  }, []);

  const stats = useMemo(
    () => ({
      articles: articles.filter((article) => !isLessonArticle(article)).length,
      lessons: nodes.filter((node) => node.type === "lesson").length,
      materials: nodes.filter((node) => node.type === "material").length,
      branches: nodes.filter((node) => node.type === "folder").length,
    }),
    [articles, nodes],
  );

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <Typography.Text className="admin-eyebrow">Рабочий стол</Typography.Text>
          <Typography.Title level={1}>Сначала структура, потом материалы</Typography.Title>
          <Typography.Paragraph>
            Здесь собираем все действия редактора: дерево уроков, статьи, доступы, историю изменений и состояние синхронизации.
          </Typography.Paragraph>
        </div>
        <Space wrap>
          <Link to="/admin/articles/new">
            <Button type="primary" size="large">Создать материал</Button>
          </Link>
          <Link to="/admin/lessons">
            <Button size="large">Настроить дерево</Button>
          </Link>
        </Space>
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Статьи" value={stats.articles} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Уроки" value={stats.lessons} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Материалы уроков" value={stats.materials} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Ветки дерева" value={stats.branches} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Основной маршрут редактора" className="admin-route-card">
            <div>
              <strong>1. Дерево уроков</strong>
              <span>Создать ветки, уроки и материалы в правильной вложенности.</span>
            </div>
            <div>
              <strong>2. Материал</strong>
              <span>Написать статью в Markdown и выбрать место публикации.</span>
            </div>
            <div>
              <strong>3. Доступы</strong>
              <span>Проверить роли для материала или всей ветки.</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Последние действия">
            <Timeline
              items={(events.length ? events.slice(0, 5) : [{ id: "empty", action: "История пока пустая", detail: "Первые действия появятся здесь", createdAt: "", actor: "" }]).map((event) => ({
                key: event.id,
                children: (
                  <div className="admin-timeline-item">
                    <strong>{event.action}</strong>
                    <span>{event.detail}</span>
                    {event.createdAt && <small>{event.createdAt}</small>}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
