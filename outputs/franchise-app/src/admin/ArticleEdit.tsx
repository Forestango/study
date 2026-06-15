import { Create, Edit } from "@refinedev/antd";
import { useNavigation, useOne } from "@refinedev/core";
import { Button, Card, Checkbox, Col, Form, Input, InputNumber, Row, Space } from "antd";
import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router";
import { getArticles, getImages, setArticles, setImages } from "../data/storage";
import { sanitizeHtml, summaryFromHtml } from "../shared/html";
import type { Article } from "../shared/types";

type Props = {
  mode: "create" | "edit";
};

type ArticleFormValues = Article & {
  isLessonMaterial?: boolean;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function ArticleEdit({ mode }: Props) {
  const [form] = Form.useForm<ArticleFormValues>();
  const htmlFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const { list } = useNavigation();
  const { result } = useOne<Article>({
    resource: "articles",
    id,
    queryOptions: { enabled: mode === "edit" && !!id },
  });
  const record = result;
  const isLesson = Form.useWatch("isLessonMaterial", form);

  const initialValues = useMemo(
    () =>
      record
        ? {
            ...record,
            isLessonMaterial: record.contentType === "lesson" || !!record.lessonId,
          }
        : {
            title: "",
            category: "",
            html: "<h2>Название</h2>\n<p>Текст материала.</p>",
            roles: ["owner"] as Article["roles"],
            isLessonMaterial: false,
          },
    [record],
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const appendHtml = (snippet: string) => {
    const currentHtml = form.getFieldValue("html") || "";
    form.setFieldValue("html", `${currentHtml.trim()}\n\n${snippet}`.trim());
  };

  const importHtmlFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      form.setFieldValue("html", sanitizeHtml(String(reader.result || "")));
    });
    reader.readAsText(file);
    if (htmlFileRef.current) htmlFileRef.current.value = "";
  };

  const insertImageFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const caption = window.prompt("Подпись к картинке", file.name.replace(/\.[^.]+$/, "")) || "";
      const safeCaption = escapeHtml(caption);
      const id = crypto.randomUUID();
      const images = getImages();
      setImages({
        ...images,
        [id]: {
          name: file.name,
          caption,
          src: String(reader.result || ""),
        },
      });
      appendHtml(`<figure>\n  <img src="franchise-image:${id}" alt="${safeCaption}">\n  <figcaption>${safeCaption}</figcaption>\n</figure>`);
    });
    reader.readAsDataURL(file);
    if (imageFileRef.current) imageFileRef.current.value = "";
  };

  const save = (values: ArticleFormValues) => {
    const articles = getArticles();
    const article: Article = {
      ...initialValues,
      ...values,
      contentType: (values as any).isLessonMaterial ? "lesson" : "article",
      id: record?.id || crypto.randomUUID(),
      updated: new Date().toLocaleDateString("ru-RU"),
      html: sanitizeHtml(values.html),
      summary: summaryFromHtml(values.html),
      roles: values.roles?.length ? values.roles : ["owner"],
    };

    if ((values as any).isLessonMaterial) {
      article.lessonId = article.lessonId || `${article.lessonCourse}-${article.lessonAge}-${article.lessonTitle}`.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-");
    } else {
      delete article.lessonId;
      delete article.lessonTitle;
      delete article.lessonCourse;
      delete article.lessonAge;
      delete article.lessonOrder;
      delete article.materialType;
    }

    setArticles(record ? articles.map((item) => (item.id === record.id ? article : item)) : [article, ...articles]);
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
            <Form.Item name="category" label="Раздел" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Card size="small" title="Привязка к уроку" style={{ marginBottom: 16 }}>
          <Form.Item name="isLessonMaterial" valuePropName="checked">
            <Checkbox>Это материал урока</Checkbox>
          </Form.Item>
          {isLesson && (
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="lessonCourse" label="Курс">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="lessonAge" label="Возраст">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="lessonTitle" label="Урок">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="materialType" label="Тип материала">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="lessonOrder" label="Порядок">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          )}
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

        <Form.Item name="html" label="HTML" rules={[{ required: true }]}>
          <Input.TextArea rows={18} />
        </Form.Item>

        <Space>
          <Button onClick={() => htmlFileRef.current?.click()}>Импорт HTML из файла</Button>
          <Button onClick={() => imageFileRef.current?.click()}>Добавить картинку</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Сохранить
          </Button>
          <Button onClick={() => list("articles")}>Отмена</Button>
        </Space>
        <input ref={htmlFileRef} type="file" accept=".html,.htm,text/html" hidden onChange={(event) => importHtmlFile(event.target.files?.[0])} />
        <input ref={imageFileRef} type="file" accept="image/*" hidden onChange={(event) => insertImageFile(event.target.files?.[0])} />
      </Form>
    </Wrapper>
  );
}
