import { Create, Edit } from "@refinedev/antd";
import { useNavigation, useOne } from "@refinedev/core";
import { Button, Card, Checkbox, Col, Form, Input, Row, Space, TreeSelect, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { addAuditEvent, getArticlesAsync, getImagesAsync, getLessonTreeAsync, setArticlesAsync, setImagesAsync, setLessonTreeAsync } from "../data/storage";
import { summaryFromHtml } from "../shared/html";
import { htmlToMarkdown, markdownToHtml } from "../shared/markdown";
import type { Article, LessonTreeNode } from "../shared/types";
import { MarkdownRichEditor } from "./MarkdownRichEditor";

type Props = {
  mode: "create" | "edit";
};

type ArticleFormValues = Article & {
  contentPlacement?: string;
};

type PlacementTreeNode = {
  title: string;
  value: string;
  disabled?: boolean;
  children?: PlacementTreeNode[];
};

const ARTICLE_PLACEMENT = "__articles";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sortNodes = (nodes: LessonTreeNode[]) => [...nodes].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

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

const syncArticleFromTree = (article: Article, nodes: LessonTreeNode[]) => {
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
};

export function ArticleEdit({ mode }: Props) {
  const [form] = Form.useForm<ArticleFormValues>();
  const [lessonTree, setLessonTree] = useState<LessonTreeNode[]>([]);
  const markdownFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const { list } = useNavigation();
  const { result } = useOne<Article>({
    resource: "articles",
    id,
    queryOptions: { enabled: mode === "edit" && !!id },
  });
  const record = result;
  const contentPlacement = Form.useWatch("contentPlacement", form);
  const markdown = Form.useWatch("markdown", form) || "";
  const isLessonPlacement = contentPlacement && contentPlacement !== ARTICLE_PLACEMENT;

  const currentMaterialNode = useMemo(
    () => (record ? lessonTree.find((node) => node.type === "material" && node.articleId === record.id) : undefined),
    [lessonTree, record],
  );

  const placementOptions = useMemo<PlacementTreeNode[]>(() => {
    const build = (parentId?: string): PlacementTreeNode[] =>
      sortNodes(lessonTree.filter((node) => node.parentId === parentId && node.type !== "material")).map((node) => ({
        title: node.title,
        value: node.id,
        children: build(node.id),
      }));

    return [
      {
        title: "Статьи",
        value: ARTICLE_PLACEMENT,
      },
      {
        title: "Уроки",
        value: "lessons-root",
        disabled: true,
        children: build(),
      },
    ];
  }, [lessonTree]);

  const initialValues = useMemo(
    () =>
      record
        ? {
            ...record,
            bodyFormat: "markdown" as const,
            markdown: record.markdown || htmlToMarkdown(record.html),
            contentPlacement: currentMaterialNode?.parentId || ARTICLE_PLACEMENT,
          }
        : {
            title: "",
            category: "",
            html: "",
            markdown: "# Название\n\nТекст материала.",
            bodyFormat: "markdown" as const,
            roles: ["owner"] as Article["roles"],
            contentPlacement: ARTICLE_PLACEMENT,
          },
    [currentMaterialNode, record],
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  useEffect(() => {
    getLessonTreeAsync().then(setLessonTree);
  }, []);

  useEffect(() => {
    if (isLessonPlacement && !form.getFieldValue("category")) {
      form.setFieldValue("category", "Методики занятий");
    }
  }, [form, isLessonPlacement]);

  const appendMarkdown = (snippet: string) => {
    const currentMarkdown = form.getFieldValue("markdown") || "";
    form.setFieldValue("markdown", `${currentMarkdown.trim()}\n\n${snippet}`.trim());
  };

  const importMarkdownFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      form.setFieldValue("markdown", String(reader.result || ""));
    });
    reader.readAsText(file);
    if (markdownFileRef.current) markdownFileRef.current.value = "";
  };

  const insertImageFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const caption = window.prompt("Подпись к картинке", file.name.replace(/\.[^.]+$/, "")) || "";
      const safeCaption = escapeHtml(caption);
      const id = crypto.randomUUID();
      const images = await getImagesAsync();
      await setImagesAsync({
        ...images,
        [id]: {
          name: file.name,
          caption,
          src: String(reader.result || ""),
        },
      });
      appendMarkdown(`![${safeCaption}](franchise-image:${id})`);
    });
    reader.readAsDataURL(file);
    if (imageFileRef.current) imageFileRef.current.value = "";
  };

  const save = async (values: ArticleFormValues) => {
    const [articles, nodes] = await Promise.all([getArticlesAsync(), getLessonTreeAsync()]);
    const placement = values.contentPlacement || ARTICLE_PLACEMENT;
    const targetNode = nodes.find((node) => node.id === placement);
    const html = markdownToHtml(values.markdown || "");
    const article: Article = {
      ...initialValues,
      ...values,
      contentType: targetNode ? "lesson" : "article",
      id: record?.id || crypto.randomUUID(),
      updated: new Date().toLocaleDateString("ru-RU"),
      bodyFormat: "markdown",
      markdown: values.markdown || "",
      html,
      summary: summaryFromHtml(html),
      roles: values.roles?.length ? values.roles : ["owner"],
    };
    delete (article as ArticleFormValues).contentPlacement;

    let nextNodes = nodes.filter((node) => !(node.type === "material" && node.articleId === article.id));

    if (targetNode) {
      const previousMaterial = nodes.find((node) => node.type === "material" && node.articleId === article.id);
      const siblings = nextNodes.filter((node) => node.parentId === targetNode.id);
      const materialNode: LessonTreeNode = {
        id: previousMaterial?.id || crypto.randomUUID(),
        parentId: targetNode.id,
        type: "material",
        title: article.title,
        order: previousMaterial?.parentId === targetNode.id ? previousMaterial.order : siblings.length + 1,
        articleId: article.id,
        roles: article.roles,
      };
      nextNodes = [...nextNodes, materialNode];
      Object.assign(article, syncArticleFromTree(article, nextNodes));
    } else {
      article.contentType = "article";
      delete article.lessonId;
      delete article.lessonTitle;
      delete article.lessonCourse;
      delete article.lessonAge;
      delete article.lessonOrder;
      delete article.materialType;
    }

    await setArticlesAsync(record ? articles.map((item) => (item.id === record.id ? article : item)) : [article, ...articles]);
    if (placement === ARTICLE_PLACEMENT || targetNode) {
      await setLessonTreeAsync(nextNodes);
      setLessonTree(nextNodes);
    }
    await addAuditEvent(record ? "Обновлен материал" : "Создан материал", article.title);
    list("articles");
  };

  const Wrapper = mode === "create" ? Create : Edit;

  return (
    <Wrapper title={mode === "create" ? "Новый материал" : "Редактирование материала"} saveButtonProps={{ onClick: () => form.submit() }}>
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={save}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="title" label="Заголовок" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="Раздел" rules={[{ required: !isLessonPlacement }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Card size="small" title="Место публикации" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="contentPlacement" label="Куда сохранить материал" rules={[{ required: true }]}>
                <TreeSelect
                  treeData={placementOptions}
                  treeDefaultExpandAll
                  placeholder="Выберите раздел"
                  style={{ width: "100%" }}
                  treeNodeFilterProp="title"
                  showSearch
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Typography.Paragraph className="muted" style={{ marginTop: 30, marginBottom: 0 }}>
                {isLessonPlacement ? "Материал появится в выбранной ветке дерева уроков." : "Материал будет отдельной статьей портала."}
              </Typography.Paragraph>
            </Col>
          </Row>
        </Card>

        <Form.Item name="roles" label="Доступы">
          <Checkbox.Group
            options={[
              { label: "Владелец", value: "owner" },
              { label: "Методист", value: "methodist" },
              { label: "Администратор", value: "admin" },
              { label: "Педагог", value: "coach" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Markdown">
          <MarkdownRichEditor value={markdown} onChange={(nextMarkdown) => form.setFieldValue("markdown", nextMarkdown)} />
        </Form.Item>
        <Form.Item name="markdown" hidden rules={[{ required: true, message: "Заполни материал" }]}>
          <Input />
        </Form.Item>

        <Space>
          <Button onClick={() => markdownFileRef.current?.click()}>Импорт Markdown из файла</Button>
          <Button onClick={() => imageFileRef.current?.click()}>Добавить картинку</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Сохранить
          </Button>
          <Button onClick={() => list("articles")}>Отмена</Button>
        </Space>
        <input ref={markdownFileRef} type="file" accept=".md,.markdown,text/markdown,text/plain" hidden onChange={(event) => importMarkdownFile(event.target.files?.[0])} />
        <input ref={imageFileRef} type="file" accept="image/*" hidden onChange={(event) => insertImageFile(event.target.files?.[0])} />
      </Form>
    </Wrapper>
  );
}
