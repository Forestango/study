import { List } from "@refinedev/antd";
import { AutoComplete, Button, Card, Col, Empty, Form, Input, InputNumber, Row, Space, Tree, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { getArticlesAsync, getLessonGroups, setArticlesAsync } from "../data/storage";
import type { Article, LessonGroup } from "../shared/types";

type Selection =
  | { type: "course"; course: string }
  | { type: "age"; course: string; age: string }
  | { type: "lesson"; lessonId: string }
  | { type: "material"; articleId: string };

type StructureForm = {
  course?: string;
  age?: string;
  title?: string;
  materialType?: string;
  lessonOrder?: number;
};

const parseKey = (key?: string | number | bigint): Selection | undefined => {
  if (!key || typeof key !== "string") return undefined;
  const [type, ...parts] = key.split("::");
  if (type === "course") return { type, course: parts[0] };
  if (type === "age") return { type, course: parts[0], age: parts[1] };
  if (type === "lesson") return { type, lessonId: parts[0] };
  if (type === "material") return { type, articleId: parts[0] };
  return undefined;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

export function LessonTree() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selection, setSelection] = useState<Selection>();
  const [form] = Form.useForm<StructureForm>();
  const selectedCourse = Form.useWatch("course", form);

  const refresh = async () => {
    setArticles(await getArticlesAsync());
  };

  useEffect(() => {
    refresh();
  }, []);

  const lessons = useMemo(() => getLessonGroups(articles), [articles]);
  const selectedLesson = selection?.type === "lesson" ? lessons.find((lesson) => lesson.id === selection.lessonId) : undefined;
  const selectedMaterial = selection?.type === "material" ? articles.find((article) => article.id === selection.articleId) : undefined;
  const courses = Array.from(new Set(lessons.map((lesson) => lesson.course))).sort();
  const agesByCourse = (course?: string) => Array.from(new Set(lessons.filter((lesson) => !course || lesson.course === course).map((lesson) => lesson.age))).sort();

  useEffect(() => {
    if (!selection) {
      form.resetFields();
      return;
    }

    if (selection.type === "course") {
      form.setFieldsValue({ course: selection.course });
    }

    if (selection.type === "age") {
      form.setFieldsValue({ course: selection.course, age: selection.age });
    }

    if (selection.type === "lesson") {
      const lesson = lessons.find((item) => item.id === selection.lessonId);
      form.setFieldsValue({ course: lesson?.course, age: lesson?.age, title: lesson?.title });
    }

    if (selection.type === "material") {
      const material = articles.find((item) => item.id === selection.articleId);
      form.setFieldsValue({
        course: material?.lessonCourse || material?.category,
        age: material?.lessonAge,
        title: material?.lessonTitle || material?.title,
        materialType: material?.materialType || material?.title,
        lessonOrder: material?.lessonOrder,
      });
    }
  }, [articles, form, lessons, selection]);

  const saveStructure = async (values: StructureForm) => {
    if (!selection) return;

    const nextArticles = articles.map((article) => {
      if (selection.type === "course" && article.lessonCourse === selection.course) {
        return { ...article, lessonCourse: values.course || article.lessonCourse };
      }

      if (selection.type === "age" && article.lessonCourse === selection.course && article.lessonAge === selection.age) {
        return {
          ...article,
          lessonCourse: values.course || article.lessonCourse,
          lessonAge: values.age || article.lessonAge,
        };
      }

      if (selection.type === "lesson" && (article.lessonId || `single-${article.id}`) === selection.lessonId) {
        const nextTitle = values.title || article.lessonTitle || article.title;
        const nextCourse = values.course || article.lessonCourse || article.category;
        const nextAge = values.age || article.lessonAge || "Без возраста";
        return {
          ...article,
          category: "Методики занятий",
          contentType: "lesson" as const,
          lessonCourse: nextCourse,
          lessonAge: nextAge,
          lessonTitle: nextTitle,
          lessonId: article.lessonId || slugify(`${nextCourse}-${nextAge}-${nextTitle}`) || `lesson-${article.id}`,
        };
      }

      if (selection.type === "material" && article.id === selection.articleId) {
        return {
          ...article,
          category: "Методики занятий",
          contentType: "lesson" as const,
          lessonCourse: values.course || article.lessonCourse || article.category,
          lessonAge: values.age || article.lessonAge || "Без возраста",
          lessonTitle: values.title || article.lessonTitle || article.title,
          materialType: values.materialType || article.materialType || article.title,
          lessonOrder: values.lessonOrder,
        };
      }

      return article;
    });

    await setArticlesAsync(nextArticles);
    setArticles(nextArticles);
    message.success("Структура обновлена");
  };

  const createLessonMaterial = async () => {
    const values = form.getFieldsValue();
    const course = values.course || (selection?.type === "course" ? selection.course : selectedLesson?.course) || "Новый курс";
    const age = values.age || (selection?.type === "age" ? selection.age : selectedLesson?.age) || "Без возраста";
    const title = values.title || selectedLesson?.title || "Новый урок";
    const id = crypto.randomUUID();
    const lessonId = selectedLesson?.id || slugify(`${course}-${age}-${title}`) || id;
    const article: Article = {
      id,
      title: values.materialType || "Новый материал",
      category: "Методики занятий",
      contentType: "lesson",
      lessonId,
      lessonTitle: title,
      lessonCourse: course,
      lessonAge: age,
      lessonOrder: values.lessonOrder || 1,
      materialType: values.materialType || "Сценарий",
      updated: new Date().toLocaleDateString("ru-RU"),
      roles: ["owner", "methodist", "coach"],
      summary: "Новый материал урока.",
      html: "<h2>Новый материал</h2>\n<p>Добавьте содержание урока.</p>",
    };
    const nextArticles = [article, ...articles];
    await setArticlesAsync(nextArticles);
    setArticles(nextArticles);
    setSelection({ type: "material", articleId: id });
    message.success("Материал урока создан");
  };

  const treeData = Object.entries(
    lessons.reduce<Record<string, Record<string, LessonGroup[]>>>((acc, lesson) => {
      acc[lesson.course] ||= {};
      acc[lesson.course][lesson.age] ||= [];
      acc[lesson.course][lesson.age].push(lesson);
      return acc;
    }, {}),
  ).map(([course, ages]) => ({
    title: course,
    key: `course::${course}`,
    children: Object.entries(ages).map(([age, ageLessons]) => ({
      title: age,
      key: `age::${course}::${age}`,
      children: ageLessons.map((lesson) => ({
        title: lesson.title,
        key: `lesson::${lesson.id}`,
        children: lesson.materials.map((material) => ({
          title: material.materialType || material.title,
          key: `material::${material.id}`,
        })),
      })),
    })),
  }));

  return (
    <List title="Дерево уроков">
      <Row gutter={16}>
        <Col span={10}>
          <Card>
            {treeData.length ? (
              <Tree
                defaultExpandAll
                selectedKeys={selection ? [Object.values(selection).join("::")] : []}
                treeData={treeData}
                onSelect={(keys) => setSelection(parseKey(keys[0]))}
              />
            ) : (
              <Empty description="Материалы уроков пока не созданы" />
            )}
          </Card>
        </Col>
        <Col span={14}>
          <Card>
            <Typography.Title level={4}>Настройка структуры</Typography.Title>
            <Typography.Paragraph>
              Выберите курс, возраст, урок или материал в дереве. Изменения применяются ко всем вложенным материалам выбранного узла.
            </Typography.Paragraph>

            <Form form={form} layout="vertical" onFinish={saveStructure}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="course" label="Курс">
                    <AutoComplete
                      options={courses.map((course) => ({ label: course, value: course }))}
                      placeholder="Название курса"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="age" label="Возраст">
                    <AutoComplete
                      options={agesByCourse(selectedCourse).map((age) => ({ label: age, value: age }))}
                      placeholder="Возрастная группа"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="title" label="Урок">
                    <Input placeholder="Название урока" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="materialType" label="Тип материала">
                    <Input placeholder="Сценарий, чеклист, презентация" disabled={selection?.type !== "material"} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="lessonOrder" label="Порядок">
                    <InputNumber min={1} style={{ width: "100%" }} disabled={selection?.type !== "material"} />
                  </Form.Item>
                </Col>
              </Row>

              <Space wrap>
                <Button type="primary" htmlType="submit" disabled={!selection}>
                  Сохранить структуру
                </Button>
                <Button onClick={createLessonMaterial}>Создать материал урока</Button>
                {selectedMaterial && <Link to={`/admin/articles/${selectedMaterial.id}`}>Открыть материал</Link>}
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>
    </List>
  );
}
