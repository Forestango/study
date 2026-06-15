import { List } from "@refinedev/antd";
import { Button, Card, Checkbox, Space, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import { addAuditEvent, getArticlesAsync, setArticlesAsync } from "../data/storage";
import type { Article, Role } from "../shared/types";

const roles: { label: string; value: Role }[] = [
  { label: "Владелец", value: "owner" },
  { label: "Методист", value: "methodist" },
  { label: "Администратор", value: "admin" },
  { label: "Педагог", value: "coach" },
];

export function AccessSettings() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    getArticlesAsync().then(setArticles);
  }, []);

  const updateRoles = (id: string, nextRoles: Role[]) => {
    setArticles((items) => items.map((article) => (article.id === id ? { ...article, roles: nextRoles.length ? nextRoles : ["owner"] } : article)));
  };

  const save = async () => {
    await setArticlesAsync(articles);
    await addAuditEvent("Обновлены права доступа", "Изменены доступы материалов");
    message.success("Права доступа сохранены");
  };

  return (
    <List
      title="Права доступа"
      headerButtons={
        <Button type="primary" onClick={save}>
          Сохранить
        </Button>
      }
    >
      <Card>
        <Table dataSource={articles} rowKey="id" pagination={{ pageSize: 20 }}>
          <Table.Column<Article> title="Материал" dataIndex="title" />
          <Table.Column<Article> title="Раздел" dataIndex="category" />
          <Table.Column<Article>
            title="Тип"
            render={(_, article) => <Tag color={article.contentType === "lesson" ? "gold" : "green"}>{article.contentType === "lesson" ? "Урок" : "Статья"}</Tag>}
          />
          <Table.Column<Article>
            title="Роли"
            render={(_, article) => (
              <Checkbox.Group value={article.roles} onChange={(values) => updateRoles(article.id, values as Role[])}>
                <Space wrap>
                  {roles.map((role) => (
                    <Checkbox key={role.value} value={role.value}>
                      {role.label}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}
          />
        </Table>
      </Card>
    </List>
  );
}
