import { List } from "@refinedev/antd";
import { Button, Card, Col, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Tree, Typography, message } from "antd";
import type { DataNode } from "antd/es/tree";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { addAuditEvent, getArticlesAsync, getLessonTreeAsync, setArticlesAsync, setLessonTreeAsync } from "../data/storage";
import type { Article, LessonTreeNode, LessonTreeNodeType, Role } from "../shared/types";

type NodeForm = {
  title: string;
  type: LessonTreeNodeType;
  order?: number;
  roles?: Role[];
};

const roleOptions = [
  { label: "Владелец", value: "owner" },
  { label: "Методист", value: "methodist" },
  { label: "Администратор", value: "admin" },
  { label: "Педагог", value: "coach" },
];

const nodeTypeLabel: Record<LessonTreeNodeType, string> = {
  folder: "Ветка",
  lesson: "Урок",
  material: "Материал",
};

const sortNodes = (nodes: LessonTreeNode[]) => [...nodes].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

const collectChildIds = (nodes: LessonTreeNode[], parentId: string): string[] => {
  const children = nodes.filter((node) => node.parentId === parentId);
  return children.flatMap((node) => [node.id, ...collectChildIds(nodes, node.id)]);
};

const getPath = (nodes: LessonTreeNode[], node: LessonTreeNode) => {
  const path = [node];
  let current = node;
  while (current.parentId) {
    const parent = nodes.find((item) => item.id === current.parentId);
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }
  return path;
};

const syncArticlesFromTree = (articles: Article[], nodes: LessonTreeNode[]) =>
  articles.map((article) => {
    const materialNode = nodes.find((node) => node.type === "material" && node.articleId === article.id);
    if (!materialNode) return article;

    const path = getPath(nodes, materialNode);
    const folders = path.filter((node) => node.type === "folder");
    const lesson = [...path].reverse().find((node) => node.type === "lesson");
    const inheritedRoles = materialNode.roles || lesson?.roles || article.roles;

    return {
      ...article,
      category: "Методики занятий",
      contentType: "lesson" as const,
      lessonCourse: folders[0]?.title || "Методики",
      lessonAge: folders[1]?.title || "Без возраста",
      lessonId: lesson?.id || article.lessonId || `lesson-${article.id}`,
      lessonTitle: lesson?.title || article.lessonTitle || article.title,
      lessonOrder: materialNode.order,
      materialType: materialNode.title,
      roles: inheritedRoles?.length ? inheritedRoles : article.roles,
    };
  });

export function LessonTree() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nodes, setNodes] = useState<LessonTreeNode[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [form] = Form.useForm<NodeForm>();

  const selectedNode = nodes.find((node) => node.id === selectedId);
  const selectedArticle = selectedNode?.articleId ? articles.find((article) => article.id === selectedNode.articleId) : undefined;

  const refresh = async () => {
    const [nextArticles, nextNodes] = await Promise.all([getArticlesAsync(), getLessonTreeAsync()]);
    setArticles(nextArticles);
    setNodes(nextNodes);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selectedNode) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({
      title: selectedNode.title,
      type: selectedNode.type,
      order: selectedNode.order,
      roles: selectedNode.roles,
    });
  }, [form, selectedNode]);

  const treeData = useMemo(() => {
    const build = (parentId?: string): DataNode[] =>
      sortNodes(nodes.filter((node) => node.parentId === parentId)).map((node) => ({
        key: node.id,
        title: `${node.title} · ${nodeTypeLabel[node.type]}`,
        children: build(node.id),
      }));
    return build();
  }, [nodes]);

  const persistTree = async (nextNodes: LessonTreeNode[], detail: string) => {
    const nextArticles = syncArticlesFromTree(articles, nextNodes);
    await setLessonTreeAsync(nextNodes);
    await setArticlesAsync(nextArticles);
    await addAuditEvent("Изменено дерево уроков", detail);
    setNodes(nextNodes);
    setArticles(nextArticles);
  };

  const saveNode = async (values: NodeForm) => {
    if (!selectedNode) return;
    const nextNodes = nodes.map((node) =>
      node.id === selectedNode.id
        ? {
            ...node,
            title: values.title,
            type: values.type,
            order: values.order || node.order,
            roles: values.roles,
          }
        : node,
    );
    await persistTree(nextNodes, `Обновлен узел "${values.title}"`);
    message.success("Узел сохранен");
  };

  const createNode = async (type: LessonTreeNodeType) => {
    const parent = selectedNode && selectedNode.type !== "material" ? selectedNode : undefined;
    const id = crypto.randomUUID();
    const siblings = nodes.filter((node) => node.parentId === parent?.id);
    let article: Article | undefined;
    const title = type === "folder" ? "Новая ветка" : type === "lesson" ? "Новый урок" : "Новый материал";

    if (type === "material") {
      article = {
        id: crypto.randomUUID(),
        title,
        category: "Методики занятий",
        contentType: "lesson",
        html: "<h2>Новый материал</h2>\n<p>Добавьте содержание.</p>",
        updated: new Date().toLocaleDateString("ru-RU"),
        roles: parent?.roles || ["owner", "methodist", "coach"],
        summary: "Новый материал урока.",
      };
    }

    const nextNodes = [
      ...nodes,
      {
        id,
        parentId: parent?.id,
        type,
        title,
        order: siblings.length + 1,
        articleId: article?.id,
        roles: parent?.roles,
      },
    ];
    const nextArticles = article ? [article, ...articles] : articles;
    const syncedArticles = syncArticlesFromTree(nextArticles, nextNodes);

    await setLessonTreeAsync(nextNodes);
    await setArticlesAsync(syncedArticles);
    await addAuditEvent("Создан узел дерева", `${nodeTypeLabel[type]} "${title}"`);
    setNodes(nextNodes);
    setArticles(syncedArticles);
    setSelectedId(id);
    message.success("Узел создан");
  };

  const deleteNode = async () => {
    if (!selectedNode) return;
    const ids = [selectedNode.id, ...collectChildIds(nodes, selectedNode.id)];
    const articleIds = new Set(nodes.filter((node) => ids.includes(node.id) && node.articleId).map((node) => node.articleId));
    const nextNodes = nodes.filter((node) => !ids.includes(node.id));
    const nextArticles = syncArticlesFromTree(
      articles.filter((article) => !articleIds.has(article.id)),
      nextNodes,
    );

    await setLessonTreeAsync(nextNodes);
    await setArticlesAsync(nextArticles);
    await addAuditEvent("Удалена ветка дерева", selectedNode.title);
    setNodes(nextNodes);
    setArticles(nextArticles);
    setSelectedId(undefined);
    message.success("Ветка удалена");
  };

  const moveNode = async (dragId: string, targetId: string, dropToGap: boolean) => {
    const dragged = nodes.find((node) => node.id === dragId);
    const target = nodes.find((node) => node.id === targetId);
    if (!dragged || !target || dragged.id === target.id) return;
    if (collectChildIds(nodes, dragged.id).includes(target.id)) return;

    const nextParentId = dropToGap ? target.parentId : target.id;
    const siblings = sortNodes(nodes.filter((node) => node.parentId === nextParentId && node.id !== dragged.id));
    const targetIndex = Math.max(
      0,
      siblings.findIndex((node) => node.id === target.id),
    );
    const insertIndex = dropToGap ? targetIndex + 1 : siblings.length;
    siblings.splice(insertIndex, 0, { ...dragged, parentId: nextParentId });
    const reordered = siblings.map((node, index) => ({ ...node, order: index + 1 }));
    const nextNodes = nodes.map((node) => reordered.find((item) => item.id === node.id) || node);

    await persistTree(nextNodes, `Перемещен узел "${dragged.title}"`);
  };

  return (
    <List title="Дерево уроков">
      <Row gutter={16}>
        <Col span={10}>
          <Card>
            <Space wrap style={{ marginBottom: 12 }}>
              <Button onClick={() => createNode("folder")}>Создать ветку</Button>
              <Button onClick={() => createNode("lesson")}>Создать урок</Button>
              <Button type="primary" onClick={() => createNode("material")}>Создать материал</Button>
            </Space>
            <Tree
              draggable
              blockNode
              defaultExpandAll
              selectedKeys={selectedId ? [selectedId] : []}
              treeData={treeData}
              onSelect={(keys) => setSelectedId(String(keys[0] || ""))}
              onDrop={(info) => moveNode(String(info.dragNode.key), String(info.node.key), info.dropToGap)}
            />
          </Card>
        </Col>
        <Col span={14}>
          <Card>
            <Typography.Title level={4}>Редактор узла</Typography.Title>
            <Form form={form} layout="vertical" onFinish={saveNode}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="title" label="Название" rules={[{ required: true }]}>
                    <Input disabled={!selectedNode} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="type" label="Тип">
                    <Select disabled={!selectedNode} options={Object.entries(nodeTypeLabel).map(([value, label]) => ({ value, label }))} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="order" label="Порядок">
                    <InputNumber min={1} style={{ width: "100%" }} disabled={!selectedNode} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="roles" label="Доступы узла">
                <Select mode="multiple" disabled={!selectedNode} options={roleOptions} />
              </Form.Item>
              <Space wrap>
                <Button type="primary" htmlType="submit" disabled={!selectedNode}>Сохранить узел</Button>
                <Popconfirm title="Удалить выбранную ветку и вложенные материалы?" onConfirm={deleteNode} disabled={!selectedNode}>
                  <Button danger disabled={!selectedNode}>Удалить ветку</Button>
                </Popconfirm>
                {selectedArticle && <Link to={`/admin/articles/${selectedArticle.id}`}>Открыть статью</Link>}
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
    </List>
  );
}
