import { EditButton, List, useTable } from "@refinedev/antd";
import { Button, Space, Table, Tag } from "antd";
import { Link } from "react-router";
import type { Article } from "../shared/types";
import { isLessonArticle } from "../data/storage";

export function ArticleList() {
  const { tableProps } = useTable<Article>({
    resource: "articles",
    pagination: { pageSize: 20 },
  });

  return (
    <List
      title="Материалы"
      headerButtons={
        <Link to="/admin/articles/new">
          <Button type="primary">Создать</Button>
        </Link>
      }
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column<Article> title="Название" dataIndex="title" />
        <Table.Column<Article> title="Раздел" dataIndex="category" />
        <Table.Column<Article>
          title="Тип"
          render={(_, record) => (
            <Tag color={isLessonArticle(record) ? "gold" : "green"}>
              {isLessonArticle(record) ? "Урок" : "Статья"}
            </Tag>
          )}
        />
        <Table.Column<Article> title="Обновлено" dataIndex="updated" />
        <Table.Column<Article>
          title=""
          render={(_, record) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
