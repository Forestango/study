import { List } from "@refinedev/antd";
import { Card, Col, Row, Tree, Typography } from "antd";
import { Link } from "react-router";
import { getLessonGroups } from "../data/storage";

export function LessonTree() {
  const lessons = getLessonGroups();
  const treeData = Object.entries(
    lessons.reduce<Record<string, Record<string, typeof lessons>>>((acc, lesson) => {
      acc[lesson.course] ||= {};
      acc[lesson.course][lesson.age] ||= [];
      acc[lesson.course][lesson.age].push(lesson);
      return acc;
    }, {}),
  ).map(([course, ages]) => ({
    title: course,
    key: course,
    children: Object.entries(ages).map(([age, ageLessons]) => ({
      title: age,
      key: `${course}-${age}`,
      children: ageLessons.map((lesson) => ({
        title: lesson.title,
        key: lesson.id,
        children: lesson.materials.map((material) => ({
          title: <Link to={`/admin/articles/${material.id}`}>{material.materialType || material.title}</Link>,
          key: material.id,
        })),
      })),
    })),
  }));

  return (
    <List title="Дерево уроков">
      <Row gutter={16}>
        <Col span={10}>
          <Card>
            <Tree defaultExpandAll treeData={treeData} />
          </Card>
        </Col>
        <Col span={14}>
          <Card>
            <Typography.Title level={4}>Структура методик</Typography.Title>
            <Typography.Paragraph>
              Дерево строится из материалов уроков. Откройте материал в дереве, чтобы отредактировать его курс, возраст, урок, тип и HTML.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </List>
  );
}
