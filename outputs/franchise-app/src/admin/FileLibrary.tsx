import { List } from "@refinedev/antd";
import { Button, Card, Form, Input, Popconfirm, Select, Space, Table, Tag, Typography, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { useEffect, useMemo, useState } from "react";
import { getArticlesAsync, getStoredFilesAsync, setArticlesAsync, setStoredFilesAsync } from "../data/storage";
import type { Article, StoredFile } from "../shared/types";

type FileFormValues = {
  description?: string;
  articleIds?: string[];
  upload?: UploadFile[];
};

const formatSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} КБ`;
  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });

export function FileLibrary() {
  const [form] = Form.useForm<FileFormValues>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);

  const articleOptions = useMemo(
    () => articles.map((article) => ({ label: article.title, value: article.id })),
    [articles],
  );
  const articleById = useMemo(() => new Map(articles.map((article) => [article.id, article])), [articles]);

  const refresh = async () => {
    const [nextArticles, nextFiles] = await Promise.all([getArticlesAsync(), getStoredFilesAsync()]);
    setArticles(nextArticles);
    setFiles(nextFiles);
  };

  useEffect(() => {
    refresh();
  }, []);

  const syncArticleFileIds = async (nextFiles: StoredFile[]) => {
    const nextArticles = articles.map((article) => {
      const fileIds = nextFiles.filter((file) => file.articleIds.includes(article.id)).map((file) => file.id);
      return { ...article, fileIds };
    });
    await setArticlesAsync(nextArticles);
    setArticles(nextArticles);
  };

  const saveFiles = async (nextFiles: StoredFile[], detail: string) => {
    await setStoredFilesAsync(nextFiles, { action: "Обновлены файлы", detail });
    await syncArticleFileIds(nextFiles);
    setFiles(nextFiles);
  };

  const upload = async (values: FileFormValues) => {
    const rawFiles = (values.upload || []).map((item) => item.originFileObj).filter(Boolean) as File[];
    if (!rawFiles.length) {
      message.warning("Выберите файл");
      return;
    }

    const uploaded = await Promise.all(
      rawFiles.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        description: values.description,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        src: await readFileAsDataUrl(file),
        articleIds: values.articleIds || [],
        createdAt: new Date().toLocaleString("ru-RU"),
      })),
    );
    await saveFiles([...uploaded, ...files], `Добавлено файлов: ${uploaded.length}`);
    form.resetFields();
    message.success("Файл добавлен");
  };

  const updateFileArticles = async (file: StoredFile, articleIds: string[]) => {
    const nextFiles = files.map((item) => (item.id === file.id ? { ...item, articleIds } : item));
    await saveFiles(nextFiles, `Изменены связи файла "${file.name}"`);
    message.success("Связи файла сохранены");
  };

  const deleteFile = async (file: StoredFile) => {
    const nextFiles = files.filter((item) => item.id !== file.id);
    await saveFiles(nextFiles, `Удален файл "${file.name}"`);
    message.success("Файл удален");
  };

  return (
    <List title="Файлы">
      <div className="admin-page">
        <Card title="Добавить файл">
          <Form form={form} layout="vertical" onFinish={upload}>
            <Form.Item name="upload" label="Файл" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList || []}>
              <Upload beforeUpload={() => false} multiple>
                <Button>Выбрать файл</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="description" label="Описание">
              <Input placeholder="Например: презентация к занятию или архив распечаток" />
            </Form.Item>
            <Form.Item name="articleIds" label="Связать с материалами">
              <Select mode="multiple" allowClear showSearch options={articleOptions} optionFilterProp="label" placeholder="Можно оставить без связи" />
            </Form.Item>
            <Button type="primary" htmlType="submit">Загрузить в базу</Button>
          </Form>
        </Card>

        <Card title="Библиотека файлов">
          <Table dataSource={files} rowKey="id" pagination={{ pageSize: 20 }}>
            <Table.Column<StoredFile>
              title="Файл"
              render={(_, file) => (
                <Space direction="vertical" size={2}>
                  <a href={file.src} download={file.name}>{file.name}</a>
                  <Typography.Text type="secondary">{file.description || "Без описания"}</Typography.Text>
                </Space>
              )}
            />
            <Table.Column<StoredFile> title="Размер" width={110} render={(_, file) => formatSize(file.size)} />
            <Table.Column<StoredFile>
              title="Связи"
              render={(_, file) => (
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  value={file.articleIds}
                  options={articleOptions}
                  optionFilterProp="label"
                  placeholder="Без связи"
                  style={{ minWidth: 280, width: "100%" }}
                  onChange={(value) => updateFileArticles(file, value)}
                />
              )}
            />
            <Table.Column<StoredFile>
              title="В материалах"
              render={(_, file) =>
                file.articleIds.length ? (
                  <Space wrap>
                    {file.articleIds.map((articleId) => (
                      <Tag key={articleId}>{articleById.get(articleId)?.title || "Материал удален"}</Tag>
                    ))}
                  </Space>
                ) : (
                  <Typography.Text type="secondary">Только в библиотеке</Typography.Text>
                )
              }
            />
            <Table.Column<StoredFile>
              title=""
              width={120}
              render={(_, file) => (
                <Popconfirm title="Удалить файл из библиотеки?" onConfirm={() => deleteFile(file)}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              )}
            />
          </Table>
        </Card>
      </div>
    </List>
  );
}
